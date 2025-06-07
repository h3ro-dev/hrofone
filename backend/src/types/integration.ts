export interface IntegrationConfig {
  id: string;
  name: string;
  type: string;
  credentials: {
    apiKey?: string;
    apiSecret?: string;
    accessToken?: string;
    refreshToken?: string;
    clientId?: string;
    clientSecret?: string;
    [key: string]: any;
  };
  settings?: {
    syncInterval?: number;
    webhookUrl?: string;
    [key: string]: any;
  };
}

export interface AuthToken {
  accessToken: string;
  refreshToken?: string;
  expiresAt?: Date;
  tokenType?: string;
}

export interface SyncResult {
  success: boolean;
  itemsSynced: number;
  errors: Array<{
    item: string;
    error: string;
  }>;
  timestamp: Date;
  duration: number;
}

export interface IntegrationConnector {
  name: string;
  version: string;
  type: string;
  
  // Authentication
  setAuthToken(token: AuthToken): void;
  authenticate(credentials: any): Promise<AuthToken>;
  refreshToken?(): Promise<AuthToken>;
  
  // Connection management
  testConnection(): Promise<boolean>;
  disconnect(): Promise<void>;
  
  // Data operations
  syncData(entity: EntityType): Promise<SyncResult>;
  fetchData(entity: EntityType, params?: any): Promise<any[]>;
  pushData(entity: EntityType, data: any[]): Promise<SyncResult>;
  
  // Webhook handling
  handleWebhook(payload: any): Promise<void>;
  validateWebhook?(headers: any, body: any): boolean;
  
  // Metadata
  getMetadata(): ConnectorMetadata;
  getSupportedEntities(): EntityType[];
}

export interface ConnectorMetadata {
  id: string;
  name: string;
  description: string;
  icon?: string;
  category: string;
  website?: string;
  supportedFeatures: string[];
}

export enum EntityType {
  EMPLOYEE = 'employee',
  PAYROLL = 'payroll',
  BENEFITS = 'benefits',
  TIME_OFF = 'time_off',
  TIME_TRACKING = 'time_tracking',
  EXPENSE = 'expense',
  DOCUMENT = 'document',
  COMPLIANCE = 'compliance',
  PERFORMANCE = 'performance',
  RECRUITMENT = 'recruitment'
}

export interface BaseEntity {
  id: string;
  externalId?: string;
  createdAt: Date;
  updatedAt: Date;
  syncedAt?: Date;
}

export interface Employee extends BaseEntity {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  employeeId: string;
  department?: string;
  position?: string;
  manager?: string;
  startDate: Date;
  endDate?: Date;
  status: 'active' | 'inactive' | 'terminated';
  personalInfo?: {
    dateOfBirth?: Date;
    ssn?: string;
    address?: {
      street: string;
      city: string;
      state: string;
      zipCode: string;
      country: string;
    };
  };
}

export interface PayrollData extends BaseEntity {
  employeeId: string;
  payPeriod: {
    startDate: Date;
    endDate: Date;
  };
  grossPay: number;
  netPay: number;
  deductions: Array<{
    type: string;
    amount: number;
    description?: string;
  }>;
  taxes: Array<{
    type: string;
    amount: number;
  }>;
  hoursWorked?: number;
  overtime?: number;
}

export interface IntegrationError extends Error {
  code: string;
  integration: string;
  retryable: boolean;
  details?: any;
}