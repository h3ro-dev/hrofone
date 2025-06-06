import { Logger } from '../../utils/logger';
import { IntegrationError } from '../../types/integration';

interface ErrorContext {
  integrationId?: string;
  entityType?: string;
  operation?: string;
  [key: string]: any;
}

interface RetryConfig {
  maxRetries: number;
  baseDelay: number;
  maxDelay: number;
  exponentialBase: number;
}

export class ErrorHandler {
  private logger: Logger;
  private errorHistory: Array<{
    timestamp: Date;
    error: Error;
    context: ErrorContext;
  }>;
  private retryConfig: RetryConfig;

  constructor() {
    this.logger = new Logger('ErrorHandler');
    this.errorHistory = [];
    this.retryConfig = {
      maxRetries: 3,
      baseDelay: 1000, // 1 second
      maxDelay: 30000, // 30 seconds
      exponentialBase: 2
    };
  }

  handle(error: any, context: ErrorContext): void {
    // Log the error
    this.logger.error(`Integration error: ${error.message}`, {
      error,
      context
    });

    // Store error history
    this.errorHistory.push({
      timestamp: new Date(),
      error,
      context
    });

    // Limit error history size
    if (this.errorHistory.length > 100) {
      this.errorHistory = this.errorHistory.slice(-100);
    }

    // Analyze error for actionable insights
    this.analyzeError(error, context);
  }

  async retryWithBackoff<T>(
    operation: () => Promise<T>,
    context: ErrorContext
  ): Promise<T> {
    let lastError: Error;
    
    for (let attempt = 0; attempt <= this.retryConfig.maxRetries; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error as Error;
        
        if (attempt === this.retryConfig.maxRetries) {
          this.handle(error, { ...context, finalAttempt: true });
          throw error;
        }

        if (!this.isRetryableError(error)) {
          this.handle(error, { ...context, retryable: false });
          throw error;
        }

        const delay = this.calculateBackoffDelay(attempt);
        this.logger.warn(
          `Retrying operation after ${delay}ms (attempt ${attempt + 1}/${this.retryConfig.maxRetries})`,
          context
        );
        
        await this.sleep(delay);
      }
    }

    throw lastError!;
  }

  private isRetryableError(error: any): boolean {
    // Network errors
    if (error.code === 'ECONNREFUSED' || error.code === 'ETIMEDOUT') {
      return true;
    }

    // HTTP status codes that are retryable
    if (error.status) {
      const retryableStatuses = [408, 429, 500, 502, 503, 504];
      return retryableStatuses.includes(error.status);
    }

    // Integration-specific errors (check for IntegrationError properties)
    if (error.retryable !== undefined) {
      return error.retryable;
    }

    // Rate limit errors
    if (error.message?.toLowerCase().includes('rate limit')) {
      return true;
    }

    return false;
  }

  private calculateBackoffDelay(attempt: number): number {
    const delay = Math.min(
      this.retryConfig.baseDelay * Math.pow(this.retryConfig.exponentialBase, attempt),
      this.retryConfig.maxDelay
    );
    
    // Add jitter to prevent thundering herd
    const jitter = Math.random() * 0.1 * delay;
    return Math.floor(delay + jitter);
  }

  private async sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private analyzeError(error: any, context: ErrorContext): void {
    // Authentication errors
    if (
      error.status === 401 ||
      error.message?.toLowerCase().includes('unauthorized') ||
      error.message?.toLowerCase().includes('authentication')
    ) {
      this.logger.warn('Authentication error detected. Token may need refresh.', context);
    }

    // Rate limiting
    if (
      error.status === 429 ||
      error.message?.toLowerCase().includes('rate limit')
    ) {
      const retryAfter = error.headers?.['retry-after'];
      this.logger.warn(`Rate limit hit. Retry after: ${retryAfter}`, context);
    }

    // Permission errors
    if (
      error.status === 403 ||
      error.message?.toLowerCase().includes('forbidden') ||
      error.message?.toLowerCase().includes('permission')
    ) {
      this.logger.warn('Permission error. Check integration scopes.', context);
    }
  }

  getErrorHistory(integrationId?: string): Array<any> {
    if (!integrationId) {
      return this.errorHistory;
    }

    return this.errorHistory.filter(
      entry => entry.context.integrationId === integrationId
    );
  }

  clearErrorHistory(): void {
    this.errorHistory = [];
  }
}