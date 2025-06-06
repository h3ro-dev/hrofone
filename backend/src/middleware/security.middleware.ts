import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import * as helmet from 'helmet';
import * as rateLimit from 'express-rate-limit';
import * as csrf from 'csurf';
import { ConfigService } from '@nestjs/config';
import { AuditLogService, AuditAction, AuditSeverity } from '../services/security/audit-log.service';

export interface SecurityConfig {
  rateLimit: {
    windowMs: number;
    max: number;
    message: string;
  };
  helmet: any;
  csrf: {
    cookie: boolean;
    httpOnly: boolean;
    secure: boolean;
    sameSite: 'strict' | 'lax' | 'none';
  };
}

@Injectable()
export class SecurityMiddleware implements NestMiddleware {
  private helmetMiddleware: any;
  private rateLimitMiddleware: any;
  private csrfMiddleware: any;
  private config: SecurityConfig;

  constructor(
    private configService: ConfigService,
    private auditLogService: AuditLogService
  ) {
    this.config = this.loadSecurityConfig();
    this.initializeMiddlewares();
  }

  private loadSecurityConfig(): SecurityConfig {
    return {
      rateLimit: {
        windowMs: this.configService.get<number>('RATE_LIMIT_WINDOW_MS') || 15 * 60 * 1000, // 15 minutes
        max: this.configService.get<number>('RATE_LIMIT_MAX') || 100,
        message: 'Too many requests from this IP, please try again later.',
      },
      helmet: {
        contentSecurityPolicy: {
          directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'"],
            scriptSrc: ["'self'"],
            imgSrc: ["'self'", 'data:', 'https:'],
            connectSrc: ["'self'"],
            fontSrc: ["'self'"],
            objectSrc: ["'none'"],
            mediaSrc: ["'self'"],
            frameSrc: ["'none'"],
          },
        },
        hsts: {
          maxAge: 31536000,
          includeSubDomains: true,
          preload: true,
        },
      },
      csrf: {
        cookie: true,
        httpOnly: true,
        secure: this.configService.get<string>('NODE_ENV') === 'production',
        sameSite: 'strict',
      },
    };
  }

  private initializeMiddlewares(): void {
    // Initialize Helmet for security headers
    this.helmetMiddleware = helmet(this.config.helmet);

    // Initialize rate limiting
    this.rateLimitMiddleware = rateLimit({
      ...this.config.rateLimit,
      handler: async (req: Request, res: Response) => {
        await this.auditLogService.logSecurityAlert(
          'suspicious_activity',
          `Rate limit exceeded for IP: ${this.getClientIp(req)}`,
          {
            ipAddress: this.getClientIp(req),
            userAgent: req.headers['user-agent'],
            path: req.path,
            method: req.method,
          }
        );
        res.status(429).json({
          error: 'Too many requests',
          message: this.config.rateLimit.message,
        });
      },
      skip: (req: Request) => {
        // Skip rate limiting for health checks
        return req.path === '/health' || req.path === '/metrics';
      },
    });

    // Initialize CSRF protection
    this.csrfMiddleware = csrf(this.config.csrf);
  }

  async use(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      // Apply security headers
      this.helmetMiddleware(req, res, () => {});

      // Add custom security headers
      this.addCustomSecurityHeaders(res);

      // Apply rate limiting
      await new Promise<void>((resolve, reject) => {
        this.rateLimitMiddleware(req, res, (err?: any) => {
          if (err) reject(err);
          else resolve();
        });
      });

      // Apply CSRF protection for state-changing operations
      if (this.requiresCsrfProtection(req)) {
        await new Promise<void>((resolve, reject) => {
          this.csrfMiddleware(req, res, (err?: any) => {
            if (err) {
              this.handleCsrfError(err, req, res);
              reject(err);
            } else {
              resolve();
            }
          });
        });
      }

      // Log security events
      await this.logSecurityEvent(req);

      // Check for common security threats
      const threat = this.detectSecurityThreats(req);
      if (threat) {
        await this.handleSecurityThreat(threat, req, res);
        return;
      }

      next();
    } catch (error) {
      this.handleSecurityError(error, req, res);
    }
  }

  private addCustomSecurityHeaders(res: Response): void {
    // Prevent clickjacking
    res.setHeader('X-Frame-Options', 'DENY');
    
    // Prevent MIME type sniffing
    res.setHeader('X-Content-Type-Options', 'nosniff');
    
    // Enable XSS protection
    res.setHeader('X-XSS-Protection', '1; mode=block');
    
    // Referrer policy
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    
    // Feature policy
    res.setHeader('Feature-Policy', "geolocation 'none'; microphone 'none'; camera 'none'");
    
    // Permissions policy
    res.setHeader('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');
    
    // Cache control for sensitive data
    if (this.isSensitiveRoute(res.req)) {
      res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, private');
      res.setHeader('Pragma', 'no-cache');
      res.setHeader('Expires', '0');
    }
  }

  private requiresCsrfProtection(req: Request): boolean {
    const safeMethods = ['GET', 'HEAD', 'OPTIONS'];
    const exemptPaths = ['/api/auth/login', '/api/auth/register', '/api/webhooks'];
    
    return !safeMethods.includes(req.method) && 
           !exemptPaths.some(path => req.path.startsWith(path));
  }

  private detectSecurityThreats(req: Request): string | null {
    const threats: { [key: string]: () => boolean } = {
      'sql-injection': () => this.detectSqlInjection(req),
      'xss-attempt': () => this.detectXssAttempt(req),
      'path-traversal': () => this.detectPathTraversal(req),
      'command-injection': () => this.detectCommandInjection(req),
      'xxe-attempt': () => this.detectXxeAttempt(req),
    };

    for (const [threatType, detector] of Object.entries(threats)) {
      if (detector()) {
        return threatType;
      }
    }

    return null;
  }

  private detectSqlInjection(req: Request): boolean {
    const sqlPatterns = [
      /(\b(union|select|insert|update|delete|drop|create|alter|exec|script)\b.*\b(from|where|table|database)\b)/i,
      /(\b(or|and)\b.*=.*)/i,
      /(--|\#|\/\*|\*\/)/,
      /(\bsleep\b.*\(.*\))/i,
      /(\bbenchmark\b.*\(.*\))/i,
    ];

    const checkString = (str: string): boolean => {
      return sqlPatterns.some(pattern => pattern.test(str));
    };

    // Check query parameters
    const queryString = JSON.stringify(req.query);
    if (checkString(queryString)) return true;

    // Check body
    if (req.body) {
      const bodyString = JSON.stringify(req.body);
      if (checkString(bodyString)) return true;
    }

    // Check headers
    const suspiciousHeaders = ['x-forwarded-for', 'referer', 'user-agent'];
    for (const header of suspiciousHeaders) {
      const value = req.headers[header];
      if (value && checkString(String(value))) return true;
    }

    return false;
  }

  private detectXssAttempt(req: Request): boolean {
    const xssPatterns = [
      /<script[^>]*>.*?<\/script>/gi,
      /<iframe[^>]*>.*?<\/iframe>/gi,
      /javascript:/gi,
      /on\w+\s*=/gi,
      /<img[^>]+src[\\s]*=[\\s]*["\']javascript:/gi,
      /eval\s*\(/gi,
      /expression\s*\(/gi,
    ];

    const checkString = (str: string): boolean => {
      return xssPatterns.some(pattern => pattern.test(str));
    };

    // Check all user inputs
    const inputs = [
      JSON.stringify(req.query),
      JSON.stringify(req.body),
      JSON.stringify(req.headers),
    ];

    return inputs.some(input => checkString(input));
  }

  private detectPathTraversal(req: Request): boolean {
    const pathPatterns = [
      /\.\.(\/|\\)/,
      /\.\.%2(f|F|5c|5C)/,
      /%2e%2e(\/|\\)/i,
      /\.\{2,\}/,
    ];

    const checkString = (str: string): boolean => {
      return pathPatterns.some(pattern => pattern.test(str));
    };

    return checkString(req.url) || 
           checkString(JSON.stringify(req.query)) ||
           checkString(JSON.stringify(req.body));
  }

  private detectCommandInjection(req: Request): boolean {
    const cmdPatterns = [
      /(\||;|&|`|\$\(|\))/,
      /\b(cat|ls|pwd|whoami|id|uname|ps|netstat|ifconfig|wget|curl)\b/i,
    ];

    const checkString = (str: string): boolean => {
      return cmdPatterns.some(pattern => pattern.test(str));
    };

    return checkString(JSON.stringify(req.query)) ||
           checkString(JSON.stringify(req.body));
  }

  private detectXxeAttempt(req: Request): boolean {
    if (!req.body || typeof req.body !== 'string') return false;

    const xxePatterns = [
      /<!ENTITY/i,
      /<!DOCTYPE[^>]*\[/i,
      /SYSTEM\s+["']file:/i,
      /SYSTEM\s+["']http:/i,
    ];

    return xxePatterns.some(pattern => pattern.test(req.body));
  }

  private async handleSecurityThreat(
    threatType: string,
    req: Request,
    res: Response
  ): Promise<void> {
    const clientIp = this.getClientIp(req);

    await this.auditLogService.logSecurityAlert(
      'breach_attempt',
      `Detected ${threatType} attempt from IP: ${clientIp}`,
      {
        ipAddress: clientIp,
        userAgent: req.headers['user-agent'],
        path: req.path,
        method: req.method,
        threatType,
        requestData: {
          query: req.query,
          body: req.body,
          headers: this.sanitizeHeaders(req.headers),
        },
      }
    );

    res.status(400).json({
      error: 'Bad Request',
      message: 'Invalid request detected',
    });
  }

  private async logSecurityEvent(req: Request): Promise<void> {
    // Log high-risk operations
    const highRiskPaths = [
      '/api/users/delete',
      '/api/employees/bulk-update',
      '/api/payroll/process',
      '/api/compliance/export',
      '/api/security/keys',
    ];

    if (highRiskPaths.some(path => req.path.startsWith(path))) {
      await this.auditLogService.log({
        action: AuditAction.SECURITY_ALERT,
        severity: AuditSeverity.INFO,
        result: 'success',
        metadata: {
          ipAddress: this.getClientIp(req),
          userAgent: req.headers['user-agent'] as string,
          path: req.path,
          method: req.method,
          riskLevel: 'high',
        },
      });
    }
  }

  private handleCsrfError(err: any, req: Request, res: Response): void {
    if (err.code === 'EBADCSRFTOKEN') {
      res.status(403).json({
        error: 'CSRF token validation failed',
        message: 'Invalid or missing CSRF token',
      });
    }
  }

  private handleSecurityError(error: any, req: Request, res: Response): void {
    console.error('Security middleware error:', error);
    res.status(500).json({
      error: 'Security check failed',
      message: 'An error occurred during security validation',
    });
  }

  private getClientIp(req: Request): string {
    const forwarded = req.headers['x-forwarded-for'];
    if (forwarded) {
      return (forwarded as string).split(',')[0].trim();
    }
    return req.connection.remoteAddress || 'unknown';
  }

  private isSensitiveRoute(req: Request): boolean {
    const sensitiveRoutes = [
      '/api/employees',
      '/api/payroll',
      '/api/benefits',
      '/api/compliance',
      '/api/security',
    ];

    return sensitiveRoutes.some(route => req.path.startsWith(route));
  }

  private sanitizeHeaders(headers: any): any {
    const sensitiveHeaders = ['authorization', 'cookie', 'x-api-key'];
    const sanitized = { ...headers };

    for (const header of sensitiveHeaders) {
      if (sanitized[header]) {
        sanitized[header] = '[REDACTED]';
      }
    }

    return sanitized;
  }
}