export class Logger {
  private context: string;

  constructor(context: string) {
    this.context = context;
  }

  info(message: string, data?: any): void {
    console.log(`[${new Date().toISOString()}] [INFO] [${this.context}] ${message}`, data || '');
  }

  warn(message: string, data?: any): void {
    console.warn(`[${new Date().toISOString()}] [WARN] [${this.context}] ${message}`, data || '');
  }

  error(message: string, error?: any): void {
    console.error(`[${new Date().toISOString()}] [ERROR] [${this.context}] ${message}`, error || '');
  }

  debug(message: string, data?: any): void {
    console.debug(`[${new Date().toISOString()}] [DEBUG] [${this.context}] ${message}`, data || '');
  }
}