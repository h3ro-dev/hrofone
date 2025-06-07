import { BaseConnector } from './BaseConnector';
import {
  AuthToken,
  SyncResult,
  EntityType,
  ConnectorMetadata,
  Employee,
  PayrollData
} from '../../../types/integration';

export class QuickBooksConnector extends BaseConnector {
  name = 'QuickBooks';
  version = '1.0.0';
  type = 'accounting';

  constructor() {
    super();
    this.baseUrl = 'https://sandbox-quickbooks.api.intuit.com/v3';
  }

  async authenticate(credentials: any): Promise<AuthToken> {
    // OAuth 2.0 flow for QuickBooks
    const { clientId, clientSecret, authorizationCode, redirectUri } = credentials;
    
    try {
      const response = await fetch('https://oauth.platform.intuit.com/oauth2/v1/tokens/bearer', {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Authorization': `Basic ${btoa(`${clientId}:${clientSecret}`)}`,
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: new URLSearchParams({
          grant_type: 'authorization_code',
          code: authorizationCode,
          redirect_uri: redirectUri
        })
      });

      if (!response.ok) {
        throw new Error('Authentication failed');
      }

      const data = await response.json();
      
      return {
        accessToken: data.access_token,
        refreshToken: data.refresh_token,
        expiresAt: new Date(Date.now() + data.expires_in * 1000),
        tokenType: data.token_type
      };
    } catch (error) {
      this.logger.error('Authentication failed', error);
      throw error;
    }
  }

  async refreshToken(): Promise<AuthToken> {
    if (!this.authToken?.refreshToken) {
      throw new Error('No refresh token available');
    }

    // Implement refresh token logic
    // Similar to authenticate but with refresh_token grant type
    throw new Error('Not implemented');
  }

  async testConnection(): Promise<boolean> {
    try {
      const response = await this.makeRequest('GET', '/company/1/companyinfo/1');
      return !!response;
    } catch (error) {
      this.logger.error('Connection test failed', error);
      return false;
    }
  }

  async syncData(entity: EntityType): Promise<SyncResult> {
    const startTime = Date.now();
    const errors: Array<{ item: string; error: string }> = [];
    let itemsSynced = 0;

    try {
      switch (entity) {
        case EntityType.EMPLOYEE:
          const employees = await this.fetchEmployees();
          itemsSynced = employees.length;
          break;
          
        case EntityType.PAYROLL:
          const payrollData = await this.fetchPayrollData();
          itemsSynced = payrollData.length;
          break;
          
        default:
          throw new Error(`Entity type ${entity} not supported`);
      }

      return {
        success: true,
        itemsSynced,
        errors,
        timestamp: new Date(),
        duration: Date.now() - startTime
      };
    } catch (error) {
      return {
        success: false,
        itemsSynced,
        errors: [...errors, { item: 'sync', error: error.message }],
        timestamp: new Date(),
        duration: Date.now() - startTime
      };
    }
  }

  async fetchData(entity: EntityType, params?: any): Promise<any[]> {
    switch (entity) {
      case EntityType.EMPLOYEE:
        return this.fetchEmployees(params);
      case EntityType.PAYROLL:
        return this.fetchPayrollData(params);
      default:
        throw new Error(`Entity type ${entity} not supported`);
    }
  }

  async pushData(entity: EntityType, data: any[]): Promise<SyncResult> {
    const startTime = Date.now();
    const errors: Array<{ item: string; error: string }> = [];
    let itemsSynced = 0;

    for (const item of data) {
      try {
        await this.createOrUpdateEntity(entity, item);
        itemsSynced++;
      } catch (error) {
        errors.push({ item: item.id || 'unknown', error: error.message });
      }
    }

    return {
      success: errors.length === 0,
      itemsSynced,
      errors,
      timestamp: new Date(),
      duration: Date.now() - startTime
    };
  }

  getMetadata(): ConnectorMetadata {
    return {
      id: 'quickbooks',
      name: 'QuickBooks',
      description: 'Connect to QuickBooks for accounting and payroll data',
      icon: 'quickbooks-icon.svg',
      category: 'accounting',
      website: 'https://quickbooks.intuit.com',
      supportedFeatures: [
        'oauth2',
        'webhooks',
        'real-time-sync',
        'bulk-operations'
      ]
    };
  }

  getSupportedEntities(): EntityType[] {
    return [
      EntityType.EMPLOYEE,
      EntityType.PAYROLL,
      EntityType.EXPENSE,
      EntityType.TIME_TRACKING
    ];
  }

  // Private helper methods
  private async fetchEmployees(params?: any): Promise<Employee[]> {
    try {
      const response = await this.makeRequest('GET', '/company/1/query', null, {
        query: "SELECT * FROM Employee WHERE Active = true",
        ...params
      });

      return response.QueryResponse.Employee.map((emp: any) => this.transformQuickBooksEmployee(emp));
    } catch (error) {
      this.logger.error('Failed to fetch employees', error);
      throw error;
    }
  }

  private async fetchPayrollData(params?: any): Promise<PayrollData[]> {
    // QuickBooks doesn't have direct payroll API in sandbox
    // This is a simplified example
    this.logger.warn('Payroll data fetch not fully implemented');
    return [];
  }

  private transformQuickBooksEmployee(qbEmployee: any): Employee {
    return {
      id: qbEmployee.Id,
      externalId: qbEmployee.Id,
      firstName: qbEmployee.GivenName || '',
      lastName: qbEmployee.FamilyName || '',
      email: qbEmployee.PrimaryEmailAddr?.Address || '',
      phone: qbEmployee.PrimaryPhone?.FreeFormNumber || '',
      employeeId: qbEmployee.EmployeeNumber || qbEmployee.Id,
      department: qbEmployee.Department || '',
      position: qbEmployee.JobTitle || '',
      startDate: new Date(qbEmployee.HiredDate || Date.now()),
      status: qbEmployee.Active ? 'active' : 'inactive',
      createdAt: new Date(qbEmployee.MetaData.CreateTime),
      updatedAt: new Date(qbEmployee.MetaData.LastUpdatedTime),
      syncedAt: new Date()
    };
  }

  private async createOrUpdateEntity(entity: EntityType, data: any): Promise<void> {
    // Implementation for creating or updating entities in QuickBooks
    switch (entity) {
      case EntityType.EMPLOYEE:
        await this.createOrUpdateEmployee(data);
        break;
      default:
        throw new Error(`Create/update not implemented for ${entity}`);
    }
  }

  private async createOrUpdateEmployee(employee: Employee): Promise<void> {
    const qbEmployee = {
      GivenName: employee.firstName,
      FamilyName: employee.lastName,
      PrimaryEmailAddr: {
        Address: employee.email
      },
      Active: employee.status === 'active'
    };

    if (employee.externalId) {
      // Update existing
      await this.makeRequest('POST', `/company/1/employee`, {
        ...qbEmployee,
        Id: employee.externalId,
        SyncToken: '1' // Would need to fetch actual sync token
      });
    } else {
      // Create new
      await this.makeRequest('POST', '/company/1/employee', qbEmployee);
    }
  }
}