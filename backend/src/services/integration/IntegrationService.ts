import { EventEmitter } from 'events';
import { Logger } from '../../utils/logger';
import { IntegrationConnector, IntegrationConfig, SyncResult } from '../../types/integration';
import { ConnectorFactory } from './ConnectorFactory';
import { AuthManager } from './AuthManager';
import { SyncManager } from './SyncManager';
import { ErrorHandler } from './ErrorHandler';

export class IntegrationService extends EventEmitter {
  private connectors: Map<string, IntegrationConnector>;
  private authManager: AuthManager;
  private syncManager: SyncManager;
  private errorHandler: ErrorHandler;
  private logger: Logger;

  constructor() {
    super();
    this.connectors = new Map();
    this.authManager = new AuthManager();
    this.syncManager = new SyncManager();
    this.errorHandler = new ErrorHandler();
    this.logger = new Logger('IntegrationService');
  }

  /**
   * Register a new integration
   */
  async registerIntegration(config: IntegrationConfig): Promise<void> {
    try {
      this.logger.info(`Registering integration: ${config.name}`);
      
      // Create connector instance
      const connector = await ConnectorFactory.create(config);
      
      // Authenticate
      const authToken = await this.authManager.authenticate(connector, config);
      connector.setAuthToken(authToken);
      
      // Test connection
      const isConnected = await connector.testConnection();
      if (!isConnected) {
        throw new Error(`Failed to connect to ${config.name}`);
      }
      
      // Store connector
      this.connectors.set(config.id, connector);
      
      // Emit success event
      this.emit('integration:registered', {
        id: config.id,
        name: config.name,
        status: 'connected'
      });
      
      this.logger.info(`Successfully registered integration: ${config.name}`);
    } catch (error) {
      this.errorHandler.handle(error, config);
      throw error;
    }
  }

  /**
   * Sync data from an integration
   */
  async syncData(integrationId: string, entityType: string): Promise<SyncResult> {
    try {
      const connector = this.connectors.get(integrationId);
      if (!connector) {
        throw new Error(`Integration not found: ${integrationId}`);
      }
      
      this.logger.info(`Starting sync for ${integrationId} - ${entityType}`);
      
      // Perform sync
      const result = await this.syncManager.sync(connector, entityType);
      
      // Emit sync complete event
      this.emit('sync:complete', {
        integrationId,
        entityType,
        result
      });
      
      return result;
    } catch (error) {
      this.errorHandler.handle(error, { integrationId, entityType });
      throw error;
    }
  }

  /**
   * Handle incoming webhook
   */
  async handleWebhook(integrationId: string, payload: any): Promise<void> {
    try {
      const connector = this.connectors.get(integrationId);
      if (!connector) {
        throw new Error(`Integration not found: ${integrationId}`);
      }
      
      this.logger.info(`Processing webhook for ${integrationId}`);
      
      await connector.handleWebhook(payload);
      
      // Emit webhook processed event
      this.emit('webhook:processed', {
        integrationId,
        timestamp: new Date()
      });
    } catch (error) {
      this.errorHandler.handle(error, { integrationId, payload });
      throw error;
    }
  }

  /**
   * Get integration status
   */
  async getStatus(integrationId: string): Promise<any> {
    const connector = this.connectors.get(integrationId);
    if (!connector) {
      return { status: 'not_found' };
    }
    
    try {
      const isConnected = await connector.testConnection();
      return {
        status: isConnected ? 'connected' : 'disconnected',
        lastSync: await this.syncManager.getLastSyncTime(integrationId),
        metadata: connector.getMetadata()
      };
    } catch (error) {
      return {
        status: 'error',
        error: error.message
      };
    }
  }

  /**
   * Remove an integration
   */
  async removeIntegration(integrationId: string): Promise<void> {
    try {
      const connector = this.connectors.get(integrationId);
      if (connector) {
        await connector.disconnect();
        this.connectors.delete(integrationId);
        
        this.emit('integration:removed', { integrationId });
        this.logger.info(`Removed integration: ${integrationId}`);
      }
    } catch (error) {
      this.errorHandler.handle(error, { integrationId });
      throw error;
    }
  }

  /**
   * Get all registered integrations
   */
  getIntegrations(): Array<{ id: string; name: string; status: string }> {
    const integrations = [];
    for (const [id, connector] of this.connectors) {
      integrations.push({
        id,
        name: connector.name,
        status: 'connected'
      });
    }
    return integrations;
  }
}

export default new IntegrationService();