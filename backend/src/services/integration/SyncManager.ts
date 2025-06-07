import { IntegrationConnector, SyncResult, EntityType } from '../../types/integration';
import { Logger } from '../../utils/logger';

interface SyncHistory {
  integrationId: string;
  entityType: EntityType;
  lastSyncTime: Date;
  result: SyncResult;
}

export class SyncManager {
  private logger: Logger;
  private syncHistory: Map<string, SyncHistory>;
  private activeSyncs: Set<string>;

  constructor() {
    this.logger = new Logger('SyncManager');
    this.syncHistory = new Map();
    this.activeSyncs = new Set();
  }

  async sync(connector: IntegrationConnector, entityType: string): Promise<SyncResult> {
    const syncKey = `${connector.name}:${entityType}`;
    
    // Check if sync is already in progress
    if (this.activeSyncs.has(syncKey)) {
      throw new Error(`Sync already in progress for ${syncKey}`);
    }

    this.activeSyncs.add(syncKey);

    try {
      this.logger.info(`Starting sync for ${syncKey}`);
      
      // Perform the sync
      const result = await connector.syncData(entityType as EntityType);
      
      // Store sync history
      this.syncHistory.set(syncKey, {
        integrationId: connector.name,
        entityType: entityType as EntityType,
        lastSyncTime: new Date(),
        result
      });

      this.logger.info(`Sync completed for ${syncKey}`, {
        itemsSynced: result.itemsSynced,
        errors: result.errors.length
      });

      return result;
    } catch (error) {
      this.logger.error(`Sync failed for ${syncKey}`, error);
      throw error;
    } finally {
      this.activeSyncs.delete(syncKey);
    }
  }

  async getLastSyncTime(integrationId: string): Promise<Date | null> {
    for (const [key, history] of this.syncHistory) {
      if (history.integrationId === integrationId) {
        return history.lastSyncTime;
      }
    }
    return null;
  }

  getSyncHistory(integrationId?: string): SyncHistory[] {
    const history: SyncHistory[] = [];
    
    for (const record of this.syncHistory.values()) {
      if (!integrationId || record.integrationId === integrationId) {
        history.push(record);
      }
    }
    
    return history.sort((a, b) => 
      b.lastSyncTime.getTime() - a.lastSyncTime.getTime()
    );
  }

  isSyncing(integrationId: string, entityType?: string): boolean {
    if (entityType) {
      return this.activeSyncs.has(`${integrationId}:${entityType}`);
    }
    
    // Check if any sync is active for this integration
    for (const syncKey of this.activeSyncs) {
      if (syncKey.startsWith(`${integrationId}:`)) {
        return true;
      }
    }
    
    return false;
  }

  clearHistory(integrationId?: string): void {
    if (integrationId) {
      // Clear history for specific integration
      const keysToDelete: string[] = [];
      for (const [key, history] of this.syncHistory) {
        if (history.integrationId === integrationId) {
          keysToDelete.push(key);
        }
      }
      keysToDelete.forEach(key => this.syncHistory.delete(key));
    } else {
      // Clear all history
      this.syncHistory.clear();
    }
  }
}