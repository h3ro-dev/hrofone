/**
 * Workflow Engine - Core automation execution system
 * Parses and executes YAML-based workflow definitions
 */

import * as yaml from 'js-yaml';
import { EventEmitter } from 'events';
import { v4 as uuidv4 } from 'uuid';

// Workflow Types
export interface WorkflowDefinition {
  metadata: WorkflowMetadata;
  triggers: WorkflowTrigger[];
  variables: Record<string, any>;
  steps: WorkflowStep[];
  notifications?: NotificationConfig;
  analytics?: AnalyticsConfig;
}

export interface WorkflowMetadata {
  name: string;
  version: string;
  description: string;
  category: string;
  estimatedTime: string;
  tags: string[];
}

export interface WorkflowTrigger {
  type: 'webhook' | 'schedule' | 'manual' | 'event';
  source?: string;
  event?: string;
  schedule?: string;
  requiredFields?: string[];
}

export interface WorkflowStep {
  id: string;
  name: string;
  action?: string;
  parallel?: any[];
  sequential?: any[];
  condition?: string;
  params?: Record<string, any>;
  onError?: string;
  retry?: RetryConfig;
}

export interface RetryConfig {
  attempts: number;
  delay: number;
  backoff: 'linear' | 'exponential';
}

export interface NotificationConfig {
  onSuccess?: NotificationTarget[];
  onError?: NotificationTarget[];
  onTimeout?: NotificationTarget[];
}

export interface NotificationTarget {
  type: 'email' | 'slack' | 'webhook';
  to?: string | string[];
  channel?: string;
  url?: string;
  subject?: string;
  message?: string;
}

export interface AnalyticsConfig {
  track: string[];
  report_to: string;
}

// Execution Context
export interface WorkflowContext {
  workflowId: string;
  executionId: string;
  trigger: Record<string, any>;
  variables: Record<string, any>;
  stepResults: Map<string, any>;
  startTime: Date;
  currentStep?: string;
  errors: Error[];
}

// Action Registry
export interface WorkflowAction {
  execute(params: any, context: WorkflowContext): Promise<any>;
}

export class ActionRegistry {
  private actions: Map<string, WorkflowAction> = new Map();

  register(name: string, action: WorkflowAction): void {
    this.actions.set(name, action);
  }

  get(name: string): WorkflowAction | undefined {
    return this.actions.get(name);
  }

  has(name: string): boolean {
    return this.actions.has(name);
  }
}

// Main Workflow Engine
export class WorkflowEngine extends EventEmitter {
  private actionRegistry: ActionRegistry;
  private runningWorkflows: Map<string, WorkflowContext> = new Map();

  constructor() {
    super();
    this.actionRegistry = new ActionRegistry();
    this.registerDefaultActions();
  }

  /**
   * Parse workflow definition from YAML
   */
  async parseWorkflow(yamlContent: string): Promise<WorkflowDefinition> {
    try {
      const workflow = yaml.load(yamlContent) as WorkflowDefinition;
      this.validateWorkflow(workflow);
      return workflow;
    } catch (error) {
      throw new Error(`Failed to parse workflow: ${error.message}`);
    }
  }

  /**
   * Execute a workflow
   */
  async execute(
    workflow: WorkflowDefinition,
    triggerData: Record<string, any> = {}
  ): Promise<WorkflowContext> {
    const context: WorkflowContext = {
      workflowId: workflow.metadata.name,
      executionId: uuidv4(),
      trigger: triggerData,
      variables: this.resolveVariables(workflow.variables, triggerData),
      stepResults: new Map(),
      startTime: new Date(),
      errors: []
    };

    this.runningWorkflows.set(context.executionId, context);
    this.emit('workflow:start', context);

    try {
      // Execute workflow steps
      for (const step of workflow.steps) {
        await this.executeStep(step, context);
      }

      // Send success notifications
      if (workflow.notifications?.onSuccess) {
        await this.sendNotifications(workflow.notifications.onSuccess, context);
      }

      this.emit('workflow:complete', context);
    } catch (error) {
      context.errors.push(error);
      
      // Send error notifications
      if (workflow.notifications?.onError) {
        await this.sendNotifications(workflow.notifications.onError, context);
      }

      this.emit('workflow:error', { context, error });
      throw error;
    } finally {
      this.runningWorkflows.delete(context.executionId);
      
      // Track analytics
      if (workflow.analytics) {
        await this.trackAnalytics(workflow.analytics, context);
      }
    }

    return context;
  }

  /**
   * Execute a single workflow step
   */
  private async executeStep(
    step: WorkflowStep,
    context: WorkflowContext
  ): Promise<any> {
    context.currentStep = step.id;
    this.emit('step:start', { step, context });

    try {
      // Check condition
      if (step.condition && !this.evaluateCondition(step.condition, context)) {
        this.emit('step:skipped', { step, context });
        return;
      }

      let result: any;

      // Execute based on step type
      if (step.parallel) {
        result = await this.executeParallel(step.parallel, context);
      } else if (step.sequential) {
        result = await this.executeSequential(step.sequential, context);
      } else if (step.action) {
        result = await this.executeAction(step.action, step.params || {}, context);
      }

      // Store result
      context.stepResults.set(step.id, result);
      this.emit('step:complete', { step, context, result });

      return result;
    } catch (error) {
      this.emit('step:error', { step, context, error });

      // Handle error based on configuration
      if (step.onError === 'continue') {
        context.errors.push(error);
        return;
      } else if (step.onError === 'retry' && step.retry) {
        return await this.retryStep(step, context, error);
      }

      throw error;
    }
  }

  /**
   * Execute actions in parallel
   */
  private async executeParallel(
    actions: any[],
    context: WorkflowContext
  ): Promise<any[]> {
    const promises = actions.map(action => {
      if (typeof action === 'object' && action.action) {
        return this.executeAction(action.action, action.params || {}, context);
      }
      return this.executeStep(action, context);
    });

    return await Promise.all(promises);
  }

  /**
   * Execute actions sequentially
   */
  private async executeSequential(
    actions: any[],
    context: WorkflowContext
  ): Promise<any[]> {
    const results: any[] = [];

    for (const action of actions) {
      if (typeof action === 'object' && action.action) {
        results.push(
          await this.executeAction(action.action, action.params || {}, context)
        );
      } else {
        results.push(await this.executeStep(action, context));
      }
    }

    return results;
  }

  /**
   * Execute a single action
   */
  private async executeAction(
    actionName: string,
    params: Record<string, any>,
    context: WorkflowContext
  ): Promise<any> {
    const action = this.actionRegistry.get(actionName);
    
    if (!action) {
      throw new Error(`Action not found: ${actionName}`);
    }

    // Resolve parameters with variable substitution
    const resolvedParams = this.resolveParams(params, context);
    
    return await action.execute(resolvedParams, context);
  }

  /**
   * Retry a failed step
   */
  private async retryStep(
    step: WorkflowStep,
    context: WorkflowContext,
    lastError: Error
  ): Promise<any> {
    const retry = step.retry!;
    let attempt = 1;
    let delay = retry.delay;

    while (attempt <= retry.attempts) {
      try {
        await this.sleep(delay);
        return await this.executeStep(step, context);
      } catch (error) {
        if (attempt === retry.attempts) {
          throw error;
        }

        if (retry.backoff === 'exponential') {
          delay *= 2;
        }

        attempt++;
      }
    }

    throw lastError;
  }

  /**
   * Evaluate conditional expressions
   */
  private evaluateCondition(condition: string, context: WorkflowContext): boolean {
    try {
      // Simple expression evaluation
      // In production, use a proper expression evaluator
      const expression = this.resolveTemplate(condition, context);
      return eval(expression);
    } catch (error) {
      console.error(`Failed to evaluate condition: ${condition}`, error);
      return false;
    }
  }

  /**
   * Resolve variables with trigger data
   */
  private resolveVariables(
    variables: Record<string, any>,
    triggerData: Record<string, any>
  ): Record<string, any> {
    const resolved: Record<string, any> = {};

    for (const [key, value] of Object.entries(variables)) {
      resolved[key] = this.resolveValue(value, { trigger: triggerData });
    }

    return resolved;
  }

  /**
   * Resolve parameters with context data
   */
  private resolveParams(
    params: Record<string, any>,
    context: WorkflowContext
  ): Record<string, any> {
    const resolved: Record<string, any> = {};

    for (const [key, value] of Object.entries(params)) {
      resolved[key] = this.resolveValue(value, context);
    }

    return resolved;
  }

  /**
   * Resolve a single value (handles templates)
   */
  private resolveValue(value: any, context: any): any {
    if (typeof value === 'string') {
      return this.resolveTemplate(value, context);
    } else if (Array.isArray(value)) {
      return value.map(v => this.resolveValue(v, context));
    } else if (typeof value === 'object' && value !== null) {
      const resolved: Record<string, any> = {};
      for (const [k, v] of Object.entries(value)) {
        resolved[k] = this.resolveValue(v, context);
      }
      return resolved;
    }

    return value;
  }

  /**
   * Resolve template strings
   */
  private resolveTemplate(template: string, context: any): string {
    return template.replace(/\${([^}]+)}/g, (match, path) => {
      const value = this.getValueByPath(context, path);
      return value !== undefined ? String(value) : match;
    });
  }

  /**
   * Get value from object by path
   */
  private getValueByPath(obj: any, path: string): any {
    return path.split('.').reduce((current, key) => {
      if (current && typeof current === 'object') {
        return current[key];
      }
      return undefined;
    }, obj);
  }

  /**
   * Send notifications
   */
  private async sendNotifications(
    targets: NotificationTarget[],
    context: WorkflowContext
  ): Promise<void> {
    for (const target of targets) {
      try {
        const notification = this.actionRegistry.get(`${target.type}.send`);
        if (notification) {
          await notification.execute(target, context);
        }
      } catch (error) {
        console.error(`Failed to send notification:`, error);
      }
    }
  }

  /**
   * Track analytics
   */
  private async trackAnalytics(
    config: AnalyticsConfig,
    context: WorkflowContext
  ): Promise<void> {
    const analytics = {
      workflowId: context.workflowId,
      executionId: context.executionId,
      duration: Date.now() - context.startTime.getTime(),
      stepsCompleted: context.stepResults.size,
      errors: context.errors.length,
      metrics: {}
    };

    // Collect configured metrics
    for (const metric of config.track) {
      switch (metric) {
        case 'workflow_duration':
          analytics.metrics[metric] = analytics.duration;
          break;
        case 'steps_completed':
          analytics.metrics[metric] = analytics.stepsCompleted;
          break;
        case 'error_rate':
          analytics.metrics[metric] = analytics.errors > 0 ? 1 : 0;
          break;
      }
    }

    // Send to analytics service
    const analyticsAction = this.actionRegistry.get('analytics.track');
    if (analyticsAction) {
      await analyticsAction.execute({
        destination: config.report_to,
        data: analytics
      }, context);
    }
  }

  /**
   * Validate workflow definition
   */
  private validateWorkflow(workflow: WorkflowDefinition): void {
    if (!workflow.metadata?.name) {
      throw new Error('Workflow must have a name');
    }

    if (!workflow.steps || workflow.steps.length === 0) {
      throw new Error('Workflow must have at least one step');
    }

    // Validate step IDs are unique
    const stepIds = new Set<string>();
    for (const step of workflow.steps) {
      if (!step.id) {
        throw new Error('All steps must have an ID');
      }
      if (stepIds.has(step.id)) {
        throw new Error(`Duplicate step ID: ${step.id}`);
      }
      stepIds.add(step.id);
    }
  }

  /**
   * Register default built-in actions
   */
  private registerDefaultActions(): void {
    // Email action
    this.actionRegistry.register('email.send', {
      async execute(params, context) {
        console.log('Sending email:', params);
        // Implement actual email sending
        return { sent: true, messageId: uuidv4() };
      }
    });

    // Slack action
    this.actionRegistry.register('slack.message', {
      async execute(params, context) {
        console.log('Sending Slack message:', params);
        // Implement actual Slack messaging
        return { sent: true, ts: Date.now() };
      }
    });

    // Database action
    this.actionRegistry.register('database.create', {
      async execute(params, context) {
        console.log('Creating database record:', params);
        // Implement actual database operations
        return { id: uuidv4(), ...params.data };
      }
    });

    // Add more default actions as needed
  }

  /**
   * Utility sleep function
   */
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Register custom action
   */
  registerAction(name: string, action: WorkflowAction): void {
    this.actionRegistry.register(name, action);
  }

  /**
   * Get running workflows
   */
  getRunningWorkflows(): WorkflowContext[] {
    return Array.from(this.runningWorkflows.values());
  }

  /**
   * Cancel a running workflow
   */
  async cancelWorkflow(executionId: string): Promise<boolean> {
    const context = this.runningWorkflows.get(executionId);
    if (!context) {
      return false;
    }

    this.emit('workflow:cancelled', context);
    this.runningWorkflows.delete(executionId);
    return true;
  }
}

// Export singleton instance
export const workflowEngine = new WorkflowEngine();