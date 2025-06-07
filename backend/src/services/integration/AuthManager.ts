import { IntegrationConnector, IntegrationConfig, AuthToken } from '../../types/integration';
import { Logger } from '../../utils/logger';

export class AuthManager {
  private logger: Logger;
  private tokenCache: Map<string, AuthToken>;

  constructor() {
    this.logger = new Logger('AuthManager');
    this.tokenCache = new Map();
  }

  async authenticate(connector: IntegrationConnector, config: IntegrationConfig): Promise<AuthToken> {
    try {
      // Check if we have a cached token
      const cachedToken = this.tokenCache.get(config.id);
      if (cachedToken && this.isTokenValid(cachedToken)) {
        this.logger.info(`Using cached token for ${config.name}`);
        return cachedToken;
      }

      // If we have a refresh token, try to refresh
      if (cachedToken?.refreshToken && connector.refreshToken) {
        try {
          const newToken = await connector.refreshToken();
          this.tokenCache.set(config.id, newToken);
          return newToken;
        } catch (error) {
          this.logger.warn('Token refresh failed, re-authenticating', error);
        }
      }

      // Perform fresh authentication
      const token = await connector.authenticate(config.credentials);
      this.tokenCache.set(config.id, token);
      
      this.logger.info(`Successfully authenticated ${config.name}`);
      return token;
    } catch (error) {
      this.logger.error(`Authentication failed for ${config.name}`, error);
      throw error;
    }
  }

  private isTokenValid(token: AuthToken): boolean {
    if (!token.expiresAt) {
      return true; // No expiration means it's always valid
    }

    // Check if token expires in the next 5 minutes
    const expirationBuffer = 5 * 60 * 1000; // 5 minutes
    return new Date(token.expiresAt).getTime() > Date.now() + expirationBuffer;
  }

  clearToken(integrationId: string): void {
    this.tokenCache.delete(integrationId);
  }

  getToken(integrationId: string): AuthToken | undefined {
    return this.tokenCache.get(integrationId);
  }
}