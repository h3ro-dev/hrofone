import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';

export enum AuditAction {
  // Authentication events
  LOGIN_SUCCESS = 'AUTH_LOGIN_SUCCESS',
  LOGIN_FAILURE = 'AUTH_LOGIN_FAILURE',
  LOGOUT = 'AUTH_LOGOUT',
  PASSWORD_CHANGE = 'AUTH_PASSWORD_CHANGE',
  MFA_ENABLED = 'AUTH_MFA_ENABLED',
  MFA_DISABLED = 'AUTH_MFA_DISABLED',
  
  // Data access events
  DATA_READ = 'DATA_READ',
  DATA_CREATE = 'DATA_CREATE',
  DATA_UPDATE = 'DATA_UPDATE',
  DATA_DELETE = 'DATA_DELETE',
  DATA_EXPORT = 'DATA_EXPORT',
  DATA_DOWNLOAD = 'DATA_DOWNLOAD',
  
  // Permission events
  PERMISSION_GRANTED = 'PERM_GRANTED',
  PERMISSION_DENIED = 'PERM_DENIED',
  ROLE_ASSIGNED = 'ROLE_ASSIGNED',
  ROLE_REMOVED = 'ROLE_REMOVED',
  
  // Security events
  SECURITY_ALERT = 'SEC_ALERT',
  SUSPICIOUS_ACTIVITY = 'SEC_SUSPICIOUS',
  BREACH_ATTEMPT = 'SEC_BREACH_ATTEMPT',
  ENCRYPTION_KEY_ROTATION = 'SEC_KEY_ROTATION',
  
  // Compliance events
  COMPLIANCE_CHECK = 'COMP_CHECK',
  POLICY_VIOLATION = 'COMP_VIOLATION',
  DATA_RETENTION = 'COMP_RETENTION',
  GDPR_REQUEST = 'COMP_GDPR_REQUEST',
}

export enum AuditSeverity {
  INFO = 'INFO',
  WARNING = 'WARNING',
  ERROR = 'ERROR',
  CRITICAL = 'CRITICAL',
}

export interface AuditLogEntry {
  id: string;
  timestamp: Date;
  action: AuditAction;
  severity: AuditSeverity;
  userId?: string;
  userEmail?: string;
  userRoles?: string[];
  resourceType?: string;
  resourceId?: string;
  resourceName?: string;
  result: 'success' | 'failure';
  errorMessage?: string;
  metadata: {
    ipAddress?: string;
    userAgent?: string;
    location?: string;
    deviceId?: string;
    sessionId?: string;
    correlationId?: string;
    requestId?: string;
    duration?: number;
    dataClassification?: string;
    sensitiveFields?: string[];
    changes?: Record<string, { old: any; new: any }>;
    riskScore?: number;
    complianceFlags?: string[];
  };
  hash?: string; // For tamper detection
  previousHash?: string; // For blockchain-style integrity
}

@Injectable()
export class AuditLogService {
  private logQueue: AuditLogEntry[] = [];
  private lastHash: string = '';
  private readonly batchSize = 100;
  private readonly flushInterval = 5000; // 5 seconds

  constructor(private configService: ConfigService) {
    this.startBatchProcessor();
  }

  /**
   * Log an audit event
   */
  async log(entry: Omit<AuditLogEntry, 'id' | 'timestamp' | 'hash' | 'previousHash'>): Promise<void> {
    const auditEntry: AuditLogEntry = {
      ...entry,
      id: this.generateAuditId(),
      timestamp: new Date(),
      previousHash: this.lastHash,
    };

    // Calculate hash for tamper detection
    auditEntry.hash = this.calculateHash(auditEntry);
    this.lastHash = auditEntry.hash;

    // Add to queue for batch processing
    this.logQueue.push(auditEntry);

    // Process immediately if critical
    if (entry.severity === AuditSeverity.CRITICAL) {
      await this.processQueue();
    }
  }

  /**
   * Log a successful authentication
   */
  async logAuthentication(
    userId: string,
    userEmail: string,
    success: boolean,
    metadata: Partial<AuditLogEntry['metadata']>
  ): Promise<void> {
    await this.log({
      action: success ? AuditAction.LOGIN_SUCCESS : AuditAction.LOGIN_FAILURE,
      severity: success ? AuditSeverity.INFO : AuditSeverity.WARNING,
      userId: success ? userId : undefined,
      userEmail,
      result: success ? 'success' : 'failure',
      metadata: {
        ...metadata,
        riskScore: this.calculateRiskScore(metadata),
      },
    });
  }

  /**
   * Log data access
   */
  async logDataAccess(
    userId: string,
    userEmail: string,
    userRoles: string[],
    action: 'read' | 'create' | 'update' | 'delete',
    resourceType: string,
    resourceId: string,
    metadata: Partial<AuditLogEntry['metadata']>
  ): Promise<void> {
    const actionMap = {
      read: AuditAction.DATA_READ,
      create: AuditAction.DATA_CREATE,
      update: AuditAction.DATA_UPDATE,
      delete: AuditAction.DATA_DELETE,
    };

    await this.log({
      action: actionMap[action],
      severity: this.getDataAccessSeverity(action, metadata.dataClassification),
      userId,
      userEmail,
      userRoles,
      resourceType,
      resourceId,
      result: 'success',
      metadata,
    });
  }

  /**
   * Log security alert
   */
  async logSecurityAlert(
    alertType: 'suspicious_activity' | 'breach_attempt' | 'policy_violation',
    description: string,
    metadata: Partial<AuditLogEntry['metadata']>
  ): Promise<void> {
    const actionMap = {
      suspicious_activity: AuditAction.SUSPICIOUS_ACTIVITY,
      breach_attempt: AuditAction.BREACH_ATTEMPT,
      policy_violation: AuditAction.POLICY_VIOLATION,
    };

    await this.log({
      action: actionMap[alertType],
      severity: AuditSeverity.CRITICAL,
      result: 'failure',
      errorMessage: description,
      metadata: {
        ...metadata,
        alertDescription: description,
        alertTimestamp: new Date().toISOString(),
      },
    });

    // Trigger immediate alert
    await this.sendSecurityAlert(alertType, description, metadata);
  }

  /**
   * Query audit logs with filters
   */
  async query(filters: {
    startDate?: Date;
    endDate?: Date;
    userId?: string;
    action?: AuditAction;
    severity?: AuditSeverity;
    resourceType?: string;
    result?: 'success' | 'failure';
    limit?: number;
    offset?: number;
  }): Promise<{ entries: AuditLogEntry[]; total: number }> {
    // This would query from the database
    // For now, returning mock implementation
    return {
      entries: [],
      total: 0,
    };
  }

  /**
   * Generate compliance report
   */
  async generateComplianceReport(
    reportType: 'gdpr' | 'soc2' | 'hipaa',
    startDate: Date,
    endDate: Date
  ): Promise<any> {
    const relevantActions = this.getComplianceRelevantActions(reportType);
    
    const entries = await this.query({
      startDate,
      endDate,
      action: relevantActions[0], // Would need to handle multiple actions
    });

    return {
      reportType,
      period: { start: startDate, end: endDate },
      summary: {
        totalEvents: entries.total,
        criticalEvents: entries.entries.filter(e => e.severity === AuditSeverity.CRITICAL).length,
        failedAccess: entries.entries.filter(e => e.result === 'failure').length,
        dataBreaches: 0,
        complianceViolations: entries.entries.filter(e => 
          e.action === AuditAction.POLICY_VIOLATION
        ).length,
      },
      entries: entries.entries,
      generatedAt: new Date(),
      signature: this.signReport(entries),
    };
  }

  /**
   * Verify audit log integrity
   */
  async verifyIntegrity(startId?: string, endId?: string): Promise<{
    valid: boolean;
    errors: string[];
  }> {
    const errors: string[] = [];
    // Would fetch logs from database and verify hash chain
    
    return {
      valid: errors.length === 0,
      errors,
    };
  }

  private generateAuditId(): string {
    return `AUDIT-${Date.now()}-${crypto.randomBytes(8).toString('hex')}`;
  }

  private calculateHash(entry: AuditLogEntry): string {
    const content = JSON.stringify({
      id: entry.id,
      timestamp: entry.timestamp,
      action: entry.action,
      userId: entry.userId,
      resourceId: entry.resourceId,
      result: entry.result,
      previousHash: entry.previousHash,
    });

    return crypto
      .createHmac('sha256', this.configService.get<string>('AUDIT_HASH_SECRET') || 'default-secret')
      .update(content)
      .digest('hex');
  }

  private calculateRiskScore(metadata: Partial<AuditLogEntry['metadata']>): number {
    let score = 0;

    // New location
    if (metadata.location && this.isNewLocation(metadata.location, metadata.userId)) {
      score += 30;
    }

    // Unusual time
    const hour = new Date().getHours();
    if (hour < 6 || hour > 22) {
      score += 20;
    }

    // Unknown device
    if (metadata.deviceId && this.isNewDevice(metadata.deviceId, metadata.userId)) {
      score += 25;
    }

    // Multiple failed attempts
    if (this.hasRecentFailedAttempts(metadata.ipAddress)) {
      score += 40;
    }

    return Math.min(100, score);
  }

  private getDataAccessSeverity(
    action: string,
    dataClassification?: string
  ): AuditSeverity {
    if (!dataClassification) return AuditSeverity.INFO;

    const classificationLevels: Record<string, number> = {
      critical: 5,
      confidential: 4,
      sensitive: 3,
      internal: 2,
      public: 1,
    };

    const level = classificationLevels[dataClassification.toLowerCase()] || 1;

    if (action === 'delete' && level >= 4) return AuditSeverity.WARNING;
    if (action === 'update' && level >= 5) return AuditSeverity.WARNING;
    if (level >= 5) return AuditSeverity.INFO;

    return AuditSeverity.INFO;
  }

  private getComplianceRelevantActions(reportType: string): AuditAction[] {
    const mappings: Record<string, AuditAction[]> = {
      gdpr: [
        AuditAction.DATA_READ,
        AuditAction.DATA_UPDATE,
        AuditAction.DATA_DELETE,
        AuditAction.DATA_EXPORT,
        AuditAction.GDPR_REQUEST,
      ],
      soc2: [
        AuditAction.LOGIN_SUCCESS,
        AuditAction.LOGIN_FAILURE,
        AuditAction.PERMISSION_DENIED,
        AuditAction.SECURITY_ALERT,
        AuditAction.BREACH_ATTEMPT,
      ],
      hipaa: [
        AuditAction.DATA_READ,
        AuditAction.DATA_UPDATE,
        AuditAction.DATA_DELETE,
        AuditAction.PERMISSION_DENIED,
      ],
    };

    return mappings[reportType] || [];
  }

  private signReport(data: any): string {
    return crypto
      .createHmac('sha256', this.configService.get<string>('REPORT_SIGNING_KEY') || 'default-key')
      .update(JSON.stringify(data))
      .digest('hex');
  }

  private async sendSecurityAlert(
    alertType: string,
    description: string,
    metadata: any
  ): Promise<void> {
    // Would send to security team via email/slack/pagerduty
    console.error(`SECURITY ALERT [${alertType}]: ${description}`, metadata);
  }

  private isNewLocation(location: string, userId?: string): boolean {
    // Would check against user's location history
    return false;
  }

  private isNewDevice(deviceId: string, userId?: string): boolean {
    // Would check against user's device history
    return false;
  }

  private hasRecentFailedAttempts(ipAddress?: string): boolean {
    // Would check recent failed login attempts from IP
    return false;
  }

  private startBatchProcessor(): void {
    setInterval(async () => {
      if (this.logQueue.length > 0) {
        await this.processQueue();
      }
    }, this.flushInterval);
  }

  private async processQueue(): Promise<void> {
    if (this.logQueue.length === 0) return;

    const batch = this.logQueue.splice(0, this.batchSize);
    
    try {
      // Would persist to database
      console.log(`Processing ${batch.length} audit log entries`);
      
      // For critical events, also store in separate high-priority storage
      const criticalEvents = batch.filter(e => e.severity === AuditSeverity.CRITICAL);
      if (criticalEvents.length > 0) {
        await this.storeCriticalEvents(criticalEvents);
      }
    } catch (error) {
      // Re-queue on failure
      this.logQueue.unshift(...batch);
      console.error('Failed to process audit log batch:', error);
    }
  }

  private async storeCriticalEvents(events: AuditLogEntry[]): Promise<void> {
    // Store critical events in separate storage for faster access
    console.log(`Storing ${events.length} critical events`);
  }
}