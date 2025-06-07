/**
 * Data Guardian Security Configuration
 * Central configuration for all security policies and settings
 */

export const SecurityConfig = {
  // Encryption Configuration
  encryption: {
    algorithm: 'aes-256-gcm',
    keyRotationDays: 90,
    masterKeyLength: 32,
    ivLength: 16,
    saltLength: 64,
    pbkdf2Iterations: 100000,
  },

  // Authentication Configuration
  authentication: {
    sessionTimeout: 30 * 60 * 1000, // 30 minutes
    maxLoginAttempts: 5,
    lockoutDuration: 15 * 60 * 1000, // 15 minutes
    passwordPolicy: {
      minLength: 12,
      requireUppercase: true,
      requireLowercase: true,
      requireNumbers: true,
      requireSpecialChars: true,
      preventReuse: 12, // Last 12 passwords
      maxAge: 90, // Days
      minAge: 1, // Days
    },
    mfa: {
      required: true,
      methods: ['totp', 'sms', 'email', 'hardware'],
      backupCodes: 10,
      graceLogins: 3,
    },
  },

  // Access Control Configuration
  accessControl: {
    defaultDenyAll: true,
    roleHierarchyEnabled: true,
    dataClassificationLevels: {
      critical: 5,
      confidential: 4,
      sensitive: 3,
      internal: 2,
      public: 1,
    },
    sensitiveFields: {
      employee: ['ssn', 'bankAccount', 'medicalRecords', 'salary'],
      payroll: ['accountNumber', 'routingNumber', 'taxId', 'compensation'],
      benefits: ['insuranceId', 'medicalHistory', 'beneficiaries'],
      compliance: ['violations', 'investigations', 'audits'],
    },
  },

  // Rate Limiting Configuration
  rateLimit: {
    global: {
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 100,
    },
    auth: {
      windowMs: 15 * 60 * 1000,
      max: 5,
    },
    api: {
      windowMs: 1 * 60 * 1000, // 1 minute
      max: 60,
    },
    export: {
      windowMs: 60 * 60 * 1000, // 1 hour
      max: 10,
    },
  },

  // Security Headers Configuration
  headers: {
    hsts: {
      maxAge: 31536000,
      includeSubDomains: true,
      preload: true,
    },
    csp: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'strict-dynamic'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", 'data:', 'https:'],
      fontSrc: ["'self'"],
      connectSrc: ["'self'"],
      frameSrc: ["'none'"],
      objectSrc: ["'none'"],
    },
    cors: {
      origin: process.env.ALLOWED_ORIGINS?.split(',') || ['https://hrofone.com'],
      credentials: true,
      maxAge: 86400,
    },
  },

  // Audit Configuration
  audit: {
    retentionDays: 2555, // 7 years for compliance
    realTimeAlerts: true,
    criticalEventNotification: {
      email: true,
      sms: true,
      slack: true,
    },
    complianceReports: {
      gdpr: { frequency: 'monthly' },
      soc2: { frequency: 'quarterly' },
      hipaa: { frequency: 'monthly' },
      iso27001: { frequency: 'annually' },
    },
  },

  // Data Protection Configuration
  dataProtection: {
    pii: {
      encryptionRequired: true,
      maskingEnabled: true,
      retentionPolicy: 'as-needed',
      rightToErasure: true,
    },
    backups: {
      frequency: 'daily',
      retention: 30, // days
      encryption: true,
      offsite: true,
      testFrequency: 'monthly',
    },
    dlp: {
      enabled: true,
      scanUploads: true,
      blockSensitiveExports: true,
      watermarkDocuments: true,
    },
  },

  // Threat Detection Configuration
  threatDetection: {
    ids: {
      enabled: true,
      sensitivity: 'high',
      autoBlock: true,
      patterns: [
        'sql-injection',
        'xss',
        'csrf',
        'xxe',
        'path-traversal',
        'command-injection',
        'ldap-injection',
        'file-inclusion',
      ],
    },
    behaviorAnalysis: {
      enabled: true,
      baselineWindow: 30, // days
      anomalyThreshold: 0.85,
      mlModelUpdate: 'weekly',
    },
    geoBlocking: {
      enabled: true,
      allowedCountries: ['US', 'CA', 'GB', 'EU'],
      vpnDetection: true,
      torBlocking: true,
    },
  },

  // Incident Response Configuration
  incidentResponse: {
    teamContacts: {
      primary: '+1-800-SECURE-1',
      email: 'security@hrofone.com',
      slack: '#security-incidents',
    },
    automatedActions: {
      isolateAffectedSystems: true,
      revokeCompromisedTokens: true,
      forcePasswordReset: true,
      notifyAffectedUsers: true,
    },
    sla: {
      detection: 5, // minutes
      containment: 30, // minutes
      eradication: 120, // minutes
      recovery: 1440, // minutes (24 hours)
    },
  },

  // Compliance Configuration
  compliance: {
    frameworks: ['GDPR', 'CCPA', 'SOC2', 'HIPAA', 'ISO27001'],
    dataResidency: {
      enabled: true,
      regions: {
        EU: ['de', 'fr', 'ie'],
        US: ['us-east', 'us-west'],
        CA: ['ca-central'],
      },
    },
    privacyControls: {
      consentManagement: true,
      dataPortability: true,
      automatedDecisionMaking: false,
      profiling: false,
    },
  },

  // Security Monitoring Configuration
  monitoring: {
    siem: {
      enabled: true,
      provider: 'internal',
      logSources: ['application', 'infrastructure', 'network', 'endpoint'],
      correlationRules: true,
    },
    metrics: {
      securityScore: true,
      vulnerabilityTracking: true,
      complianceScore: true,
      riskAssessment: true,
    },
    alerting: {
      channels: ['email', 'sms', 'slack', 'pagerduty'],
      priorities: {
        critical: ['sms', 'pagerduty'],
        high: ['email', 'slack'],
        medium: ['email'],
        low: ['slack'],
      },
    },
  },

  // Vulnerability Management
  vulnerability: {
    scanning: {
      frequency: 'weekly',
      scope: ['code', 'dependencies', 'infrastructure', 'configuration'],
      autoRemediation: true,
    },
    patching: {
      criticalSla: 24, // hours
      highSla: 72, // hours
      mediumSla: 168, // hours (1 week)
      lowSla: 720, // hours (30 days)
    },
    penetrationTesting: {
      frequency: 'quarterly',
      scope: 'full',
      provider: 'third-party',
    },
  },

  // API Security Configuration
  api: {
    authentication: ['jwt', 'oauth2', 'apiKey'],
    rateLimiting: true,
    versioning: true,
    deprecationNotice: 180, // days
    security: {
      tlsVersion: '1.3',
      cipherSuites: 'HIGH:!aNULL:!MD5',
      certificatePinning: true,
      mutualTls: false,
    },
  },

  // Development Security
  development: {
    secureCoding: {
      training: 'mandatory',
      frequency: 'quarterly',
      staticAnalysis: true,
      codeReview: true,
    },
    dependencies: {
      scanning: true,
      autoUpdate: false,
      licenseCheck: true,
      vulnerabilityThreshold: 'medium',
    },
    secrets: {
      scanning: true,
      rotation: true,
      vaultIntegration: true,
    },
  },
};