# Data Guardian Implementation Guide

## 🚀 Getting Started

This guide provides step-by-step instructions for implementing Data Guardian's bulletproof security features in the HR of One system.

## 📋 Prerequisites

- Node.js 18+ with TypeScript support
- PostgreSQL 14+ with encryption extensions
- Redis 7+ for session management
- Docker for containerization
- Kubernetes for orchestration (production)

## 🔧 Installation

### 1. Install Dependencies

```bash
# Backend security dependencies
npm install --save \
  @nestjs/common @nestjs/config @nestjs/core \
  bcrypt argon2 \
  jsonwebtoken passport passport-jwt \
  speakeasy qrcode \
  helmet express-rate-limit csurf \
  winston winston-daily-rotate-file \
  ioredis bull \
  class-validator class-transformer \
  @types/node @types/express

# Development dependencies
npm install --save-dev \
  @types/bcrypt @types/jsonwebtoken \
  @types/passport-jwt @types/speakeasy \
  @types/qrcode @types/helmet \
  @types/express-rate-limit @types/csurf
```

### 2. Environment Configuration

Create a `.env.secure` file with encrypted configuration:

```env
# Master Encryption Key (generate with: openssl rand -base64 32)
MASTER_ENCRYPTION_KEY=<base64-encoded-32-byte-key>

# Audit Hash Secret
AUDIT_HASH_SECRET=<random-secret>

# Database Encryption
DB_ENCRYPTION_KEY=<base64-encoded-key>
DB_SSL_CERT=/path/to/db-cert.pem

# Redis Configuration
REDIS_PASSWORD=<strong-password>
REDIS_TLS_ENABLED=true
REDIS_TLS_CERT=/path/to/redis-cert.pem

# JWT Configuration
JWT_SECRET=<strong-secret>
JWT_REFRESH_SECRET=<different-strong-secret>
JWT_EXPIRATION=30m
JWT_REFRESH_EXPIRATION=7d

# MFA Configuration
MFA_ISSUER=HR-of-One
MFA_BACKUP_CODES_SALT=<random-salt>

# Security Headers
ALLOWED_ORIGINS=https://app.hrofone.com,https://hrofone.com
FRAME_ANCESTORS=none
```

### 3. Database Setup

```sql
-- Enable encryption extensions
CREATE EXTENSION IF NOT EXISTS pgcrypto;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create audit log table with encryption
CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    action VARCHAR(100) NOT NULL,
    severity VARCHAR(20) NOT NULL,
    user_id UUID,
    user_email VARCHAR(255),
    user_roles JSONB,
    resource_type VARCHAR(100),
    resource_id UUID,
    result VARCHAR(20) NOT NULL,
    error_message TEXT,
    metadata JSONB,
    hash VARCHAR(64) NOT NULL,
    previous_hash VARCHAR(64),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    -- Indexes for performance
    INDEX idx_audit_timestamp (timestamp),
    INDEX idx_audit_user (user_id),
    INDEX idx_audit_action (action),
    INDEX idx_audit_severity (severity)
) PARTITION BY RANGE (timestamp);

-- Create partitions for audit logs (monthly)
CREATE TABLE audit_logs_2024_01 PARTITION OF audit_logs
    FOR VALUES FROM ('2024-01-01') TO ('2024-02-01');

-- Enable row-level security
ALTER TABLE employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE payroll ENABLE ROW LEVEL SECURITY;
ALTER TABLE benefits ENABLE ROW LEVEL SECURITY;

-- Create security policies
CREATE POLICY employee_self_access ON employees
    FOR SELECT
    USING (id = current_user_id() OR has_role('hr-admin'));

CREATE POLICY payroll_restricted_access ON payroll
    FOR ALL
    USING (has_role('hr-admin') OR has_role('payroll-admin'));
```

## 🔐 Implementation Steps

### Step 1: Initialize Security Module

```typescript
// app.module.ts
import { Module } from '@nestjs/common';
import { SecurityModule } from './security/security.module';

@Module({
  imports: [
    SecurityModule.forRoot({
      encryption: {
        masterKey: process.env.MASTER_ENCRYPTION_KEY,
        algorithm: 'aes-256-gcm',
      },
      audit: {
        enabled: true,
        realTimeAlerts: true,
      },
      rateLimit: {
        enabled: true,
        global: { windowMs: 900000, max: 100 },
      },
    }),
  ],
})
export class AppModule {}
```

### Step 2: Apply Security Middleware

```typescript
// main.ts
import { NestFactory } from '@nestjs/core';
import { SecurityMiddleware } from './middleware/security.middleware';
import * as helmet from 'helmet';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Apply security middleware
  app.use(helmet());
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
  }));
  
  // Enable CORS with strict configuration
  app.enableCors({
    origin: process.env.ALLOWED_ORIGINS?.split(','),
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-CSRF-Token'],
  });
  
  await app.listen(3000);
}
```

### Step 3: Implement Field-Level Encryption

```typescript
// employee.service.ts
import { EncryptionService } from './services/security/encryption.service';

@Injectable()
export class EmployeeService {
  constructor(private encryption: EncryptionService) {}
  
  async createEmployee(data: CreateEmployeeDto) {
    // Encrypt sensitive fields
    const encrypted = await this.encryption.encryptObject(data, [
      'ssn',
      'bankAccount',
      'medicalRecords',
      'salary',
    ]);
    
    // Save to database
    return this.employeeRepository.save(encrypted);
  }
  
  async getEmployee(id: string) {
    const employee = await this.employeeRepository.findOne(id);
    
    // Decrypt sensitive fields
    return this.encryption.decryptObject(employee, [
      'ssn',
      'bankAccount',
      'medicalRecords',
      'salary',
    ]);
  }
}
```

### Step 4: Implement Access Control

```typescript
// secure-resource.decorator.ts
import { SetMetadata } from '@nestjs/common';

export const SecureResource = (resource: string, action: string) =>
  SetMetadata('security', { resource, action });

// access-control.guard.ts
@Injectable()
export class AccessControlGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private accessControl: AccessControlService,
  ) {}
  
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const security = this.reflector.get<any>('security', context.getHandler());
    if (!security) return true;
    
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    
    return this.accessControl.checkAccess({
      user,
      resource: security.resource,
      action: security.action,
      resourceAttributes: request.resourceAttributes,
      environment: {
        ipAddress: request.ip,
        userAgent: request.headers['user-agent'],
      },
    });
  }
}

// Usage in controller
@Controller('employees')
@UseGuards(JwtAuthGuard, AccessControlGuard)
export class EmployeeController {
  @Get(':id')
  @SecureResource('employee', 'read')
  async getEmployee(@Param('id') id: string) {
    // Implementation
  }
  
  @Put(':id')
  @SecureResource('employee', 'update')
  async updateEmployee(@Param('id') id: string, @Body() data: any) {
    // Implementation
  }
}
```

### Step 5: Enable Audit Logging

```typescript
// audit.interceptor.ts
@Injectable()
export class AuditInterceptor implements NestInterceptor {
  constructor(private auditLog: AuditLogService) {}
  
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    const start = Date.now();
    
    return next.handle().pipe(
      tap(async (data) => {
        const duration = Date.now() - start;
        
        await this.auditLog.logDataAccess(
          user.id,
          user.email,
          user.roles.map(r => r.id),
          this.getAction(request.method),
          this.getResource(request.path),
          this.getResourceId(request.params),
          {
            duration,
            ipAddress: request.ip,
            userAgent: request.headers['user-agent'],
            dataClassification: this.getDataClassification(request.path),
          },
        );
      }),
    );
  }
}
```

## 🔍 Monitoring & Alerts

### Security Dashboard Setup

```typescript
// security-dashboard.controller.ts
@Controller('api/security/dashboard')
@UseGuards(JwtAuthGuard, RoleGuard(['security-admin']))
export class SecurityDashboardController {
  @Get('metrics')
  async getMetrics() {
    return {
      threatLevel: await this.security.getCurrentThreatLevel(),
      failedLogins: await this.security.getFailedLoginCount(24),
      activeThreats: await this.security.getActiveThreats(),
      complianceScore: await this.security.getComplianceScore(),
      vulnerabilities: await this.security.getVulnerabilities(),
    };
  }
  
  @Get('alerts')
  async getAlerts(@Query() filters: AlertFilters) {
    return this.security.getSecurityAlerts(filters);
  }
}
```

### Alert Configuration

```typescript
// alert.service.ts
@Injectable()
export class AlertService {
  async sendCriticalAlert(alert: SecurityAlert) {
    // Send to multiple channels based on severity
    const channels = this.getAlertChannels(alert.severity);
    
    await Promise.all([
      channels.includes('email') && this.sendEmail(alert),
      channels.includes('sms') && this.sendSms(alert),
      channels.includes('slack') && this.sendSlack(alert),
      channels.includes('pagerduty') && this.triggerPagerDuty(alert),
    ]);
  }
}
```

## 🧪 Testing Security

### Security Test Suite

```typescript
// security.e2e-spec.ts
describe('Security Tests', () => {
  it('should block SQL injection attempts', async () => {
    const response = await request(app.getHttpServer())
      .get('/api/employees?id=1; DROP TABLE employees;--')
      .expect(400);
    
    expect(response.body.error).toBe('Bad Request');
  });
  
  it('should enforce rate limiting', async () => {
    // Make 101 requests (limit is 100)
    for (let i = 0; i < 101; i++) {
      const response = await request(app.getHttpServer())
        .get('/api/employees');
      
      if (i === 100) {
        expect(response.status).toBe(429);
      }
    }
  });
  
  it('should encrypt sensitive data', async () => {
    const employee = await employeeService.create({
      name: 'John Doe',
      ssn: '123-45-6789',
    });
    
    // Check database directly
    const raw = await db.query('SELECT ssn FROM employees WHERE id = $1', [employee.id]);
    expect(raw.rows[0].ssn).not.toBe('123-45-6789');
    expect(raw.rows[0].ssn.encrypted).toBeDefined();
  });
});
```

## 🚨 Incident Response

### Automated Response Workflow

```typescript
// incident-response.service.ts
@Injectable()
export class IncidentResponseService {
  async handleSecurityIncident(incident: SecurityIncident) {
    // 1. Assess severity
    const severity = this.assessSeverity(incident);
    
    // 2. Contain threat
    if (severity >= SeverityLevel.HIGH) {
      await this.containThreat(incident);
    }
    
    // 3. Notify stakeholders
    await this.notifyStakeholders(incident, severity);
    
    // 4. Collect evidence
    const evidence = await this.collectEvidence(incident);
    
    // 5. Begin remediation
    await this.beginRemediation(incident, evidence);
    
    // 6. Document incident
    await this.documentIncident(incident, evidence);
  }
  
  private async containThreat(incident: SecurityIncident) {
    // Isolate affected systems
    await this.firewall.blockIp(incident.sourceIp);
    
    // Revoke compromised tokens
    await this.auth.revokeUserTokens(incident.affectedUsers);
    
    // Force password reset
    await this.auth.forcePasswordReset(incident.affectedUsers);
  }
}
```

## 📊 Compliance Reporting

### Automated Compliance Reports

```typescript
// compliance-report.service.ts
@Injectable()
export class ComplianceReportService {
  @Cron('0 0 1 * *') // Monthly
  async generateGdprReport() {
    const report = await this.auditLog.generateComplianceReport(
      'gdpr',
      startOfMonth(new Date()),
      endOfMonth(new Date()),
    );
    
    await this.storage.saveReport(report);
    await this.email.sendReport(report, ['dpo@hrofone.com']);
  }
  
  @Cron('0 0 1 */3 *') // Quarterly
  async generateSoc2Report() {
    const report = await this.auditLog.generateComplianceReport(
      'soc2',
      startOfQuarter(new Date()),
      endOfQuarter(new Date()),
    );
    
    await this.storage.saveReport(report);
    await this.email.sendReport(report, ['compliance@hrofone.com']);
  }
}
```

## 🔄 Maintenance

### Regular Security Tasks

1. **Daily**
   - Review security alerts
   - Check failed login attempts
   - Monitor system health

2. **Weekly**
   - Run vulnerability scans
   - Review access logs
   - Update threat intelligence

3. **Monthly**
   - Rotate encryption keys
   - Review user permissions
   - Generate compliance reports
   - Test backup restoration

4. **Quarterly**
   - Conduct penetration testing
   - Review security policies
   - Update incident response plan
   - Security training

## 🆘 Troubleshooting

### Common Issues

1. **High False Positive Rate**
   ```typescript
   // Adjust threat detection sensitivity
   await security.updateConfig({
     threatDetection: {
       sensitivity: 'medium',
       whitelist: ['trusted-ip-1', 'trusted-ip-2'],
     },
   });
   ```

2. **Performance Impact**
   ```typescript
   // Optimize encryption for bulk operations
   const batchEncrypted = await encryption.encryptBatch(records, {
     parallel: true,
     batchSize: 100,
   });
   ```

3. **Audit Log Storage**
   ```sql
   -- Archive old audit logs
   INSERT INTO audit_logs_archive 
   SELECT * FROM audit_logs 
   WHERE timestamp < NOW() - INTERVAL '90 days';
   
   DELETE FROM audit_logs 
   WHERE timestamp < NOW() - INTERVAL '90 days';
   ```

## 📚 Additional Resources

- [OWASP Security Guidelines](https://owasp.org)
- [NIST Cybersecurity Framework](https://www.nist.gov/cyberframework)
- [GDPR Compliance Checklist](https://gdpr.eu/checklist/)
- [SOC 2 Requirements](https://www.aicpa.org/soc2)

---

For support, contact the Data Guardian team at security@hrofone.com