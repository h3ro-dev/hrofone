import { 
  IntegrationConnector, 
  AuthToken, 
  SyncResult, 
  EntityType, 
  ConnectorMetadata 
} from '../../../types/integration';
import { Logger } from '../../../utils/logger';

export abstract class BaseConnector implements IntegrationConnector {
  abstract name: string;
  abstract version: string;
  abstract type: string;
  
  protected authToken: AuthToken | null = null;
  protected logger: Logger;
  protected baseUrl: string = '';
  protected headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  };

  constructor() {
    this.logger = new Logger(this.constructor.name);
  }

  // Authentication methods
  setAuthToken(token: AuthToken): void {
    this.authToken = token;
    this.updateAuthHeaders();
  }

  abstract authenticate(credentials: any): Promise<AuthToken>;

  async refreshToken(): Promise<AuthToken> {
    throw new Error('Token refresh not implemented for this connector');
  }

  // Connection management
  abstract testConnection(): Promise<boolean>;

  async disconnect(): Promise<void> {
    this.authToken = null;
    this.logger.info('Disconnected from integration');
  }

  // Data operations
  abstract syncData(entity: EntityType): Promise<SyncResult>;
  abstract fetchData(entity: EntityType, params?: any): Promise<any[]>;
  abstract pushData(entity: EntityType, data: any[]): Promise<SyncResult>;

  // Webhook handling
  async handleWebhook(payload: any): Promise<void> {
    this.logger.info('Webhook received', { payload });
    // Default implementation - override in specific connectors
  }

  validateWebhook(headers: any, body: any): boolean {
    // Default implementation - override in specific connectors
    return true;
  }

  // Metadata
  abstract getMetadata(): ConnectorMetadata;
  abstract getSupportedEntities(): EntityType[];

  // Helper methods
  protected updateAuthHeaders(): void {
    if (this.authToken) {
      this.headers['Authorization'] = `Bearer ${this.authToken.accessToken}`;
    }
  }

  protected async makeRequest(
    method: string,
    endpoint: string,
    data?: any,
    queryParams?: Record<string, any>
  ): Promise<any> {
    const url = new URL(`${this.baseUrl}${endpoint}`);
    
    if (queryParams) {
      Object.entries(queryParams).forEach(([key, value]) => {
        url.searchParams.append(key, value.toString());
      });
    }

    const options: RequestInit = {
      method,
      headers: this.headers,
    };

    if (data && ['POST', 'PUT', 'PATCH'].includes(method)) {
      options.body = JSON.stringify(data);
    }

    try {
      const response = await fetch(url.toString(), options);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      this.logger.error(`Request failed: ${method} ${endpoint}`, error);
      throw error;
    }
  }

  protected async handleRateLimit(retryAfter: number): Promise<void> {
    this.logger.warn(`Rate limit hit, waiting ${retryAfter}ms`);
    await new Promise(resolve => setTimeout(resolve, retryAfter));
  }

  protected transformData(data: any, mapping: Record<string, string>): any {
    const transformed: any = {};
    
    Object.entries(mapping).forEach(([sourceKey, targetKey]) => {
      const value = this.getNestedValue(data, sourceKey);
      if (value !== undefined) {
        this.setNestedValue(transformed, targetKey, value);
      }
    });
    
    return transformed;
  }

  private getNestedValue(obj: any, path: string): any {
    return path.split('.').reduce((curr, prop) => curr?.[prop], obj);
  }

  private setNestedValue(obj: any, path: string, value: any): void {
    const parts = path.split('.');
    const last = parts.pop()!;
    const target = parts.reduce((curr, prop) => {
      if (!curr[prop]) curr[prop] = {};
      return curr[prop];
    }, obj);
    target[last] = value;
  }
}