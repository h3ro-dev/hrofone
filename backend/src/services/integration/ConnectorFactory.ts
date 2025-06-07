import { IntegrationConfig, IntegrationConnector } from '../../types/integration';
import { QuickBooksConnector } from './connectors/QuickBooksConnector';
// Import other connectors as they are implemented
// import { GustoConnector } from './connectors/GustoConnector';
// import { ADPConnector } from './connectors/ADPConnector';

export class ConnectorFactory {
  private static connectorMap: Map<string, new () => IntegrationConnector> = new Map([
    ['quickbooks', QuickBooksConnector],
    // Add other connectors here as they are implemented
    // ['gusto', GustoConnector],
    // ['adp', ADPConnector],
  ]);

  static async create(config: IntegrationConfig): Promise<IntegrationConnector> {
    const ConnectorClass = this.connectorMap.get(config.type.toLowerCase());
    
    if (!ConnectorClass) {
      throw new Error(`Unsupported integration type: ${config.type}`);
    }

    const connector = new ConnectorClass();
    
    // Perform any async initialization if needed
    // For now, just return the instance
    return connector;
  }

  static getSupportedTypes(): string[] {
    return Array.from(this.connectorMap.keys());
  }

  static isSupported(type: string): boolean {
    return this.connectorMap.has(type.toLowerCase());
  }
}