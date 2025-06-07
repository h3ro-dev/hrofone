#!/usr/bin/env node

/**
 * Workflow CLI - Command-line interface for executing workflows
 */

import * as fs from 'fs';
import * as path from 'path';
import * as yaml from 'js-yaml';
import { program } from 'commander';
import chalk from 'chalk';

// Simplified workflow types
interface WorkflowDefinition {
  metadata: {
    name: string;
    version: string;
    description: string;
  };
  triggers: any[];
  variables: Record<string, any>;
  steps: WorkflowStep[];
  notifications?: any;
  analytics?: any;
}

interface WorkflowStep {
  id: string;
  name: string;
  action?: string;
  parallel?: any[];
  sequential?: any[];
  condition?: string;
  params?: Record<string, any>;
  onError?: string;
}

class WorkflowRunner {
  private stepResults: Map<string, any> = new Map();
  private variables: Record<string, any> = {};

  async runWorkflow(workflowPath: string, triggerData: Record<string, any> = {}) {
    console.log(chalk.blue('🚀 Starting Workflow Execution'));
    console.log(chalk.gray(`Loading workflow from: ${workflowPath}`));

    // Load workflow
    const yamlContent = fs.readFileSync(workflowPath, 'utf8');
    const workflow = yaml.load(yamlContent) as WorkflowDefinition;

    console.log(chalk.green(`\n📋 Workflow: ${workflow.metadata.name}`));
    console.log(chalk.gray(`   Version: ${workflow.metadata.version}`));
    console.log(chalk.gray(`   Description: ${workflow.metadata.description}\n`));

    // Initialize variables
    this.variables = this.resolveVariables(workflow.variables || {}, triggerData);

    // Execute steps
    const startTime = Date.now();
    let completedSteps = 0;
    
    for (const step of workflow.steps) {
      try {
        console.log(chalk.yellow(`\n▶️  Step ${completedSteps + 1}/${workflow.steps.length}: ${step.name}`));
        
        // Check condition
        if (step.condition && !this.evaluateCondition(step.condition)) {
          console.log(chalk.gray('   ⏭️  Skipped (condition not met)'));
          continue;
        }

        // Execute step
        await this.executeStep(step);
        completedSteps++;
        
        console.log(chalk.green('   ✅ Completed'));
      } catch (error) {
        console.log(chalk.red(`   ❌ Failed: ${error.message}`));
        
        if (step.onError !== 'continue') {
          throw error;
        }
      }
    }

    const duration = Date.now() - startTime;
    console.log(chalk.green(`\n✨ Workflow completed successfully!`));
    console.log(chalk.gray(`   Duration: ${(duration / 1000).toFixed(2)}s`));
    console.log(chalk.gray(`   Steps completed: ${completedSteps}/${workflow.steps.length}`));
  }

  private async executeStep(step: WorkflowStep): Promise<any> {
    if (step.parallel) {
      return await this.executeParallel(step.parallel);
    } else if (step.sequential) {
      return await this.executeSequential(step.sequential);
    } else if (step.action) {
      return await this.executeAction(step.action, step.params || {});
    }
  }

  private async executeParallel(actions: any[]): Promise<any[]> {
    console.log(chalk.gray('   Running actions in parallel...'));
    const promises = actions.map(action => this.simulateAction(action));
    return await Promise.all(promises);
  }

  private async executeSequential(actions: any[]): Promise<any[]> {
    console.log(chalk.gray('   Running actions sequentially...'));
    const results: any[] = [];
    for (const action of actions) {
      results.push(await this.simulateAction(action));
    }
    return results;
  }

  private async executeAction(actionName: string, params: Record<string, any>): Promise<any> {
    const resolvedParams = this.resolveParams(params);
    console.log(chalk.gray(`   Action: ${actionName}`));
    console.log(chalk.gray(`   Params: ${JSON.stringify(resolvedParams, null, 2)}`));
    
    // Simulate action execution
    return await this.simulateAction({ action: actionName, params: resolvedParams });
  }

  private async simulateAction(action: any): Promise<any> {
    // Simulate different action types
    const actionName = action.action || action;
    
    // Add a small delay to simulate work
    await new Promise(resolve => setTimeout(resolve, 100));

    // Return simulated results based on action type
    if (actionName.includes('create')) {
      return { id: Math.random().toString(36).substr(2, 9), created: true };
    } else if (actionName.includes('send')) {
      return { sent: true, timestamp: new Date().toISOString() };
    } else if (actionName.includes('schedule')) {
      return { scheduled: true, meetingId: Math.random().toString(36).substr(2, 9) };
    } else {
      return { success: true };
    }
  }

  private resolveVariables(variables: Record<string, any>, triggerData: Record<string, any>): Record<string, any> {
    const resolved: Record<string, any> = {};
    
    for (const [key, value] of Object.entries(variables)) {
      if (typeof value === 'object' && !Array.isArray(value)) {
        resolved[key] = {};
        for (const [subKey, subValue] of Object.entries(value)) {
          resolved[key][subKey] = this.resolveTemplate(subValue, { trigger: triggerData });
        }
      } else {
        resolved[key] = this.resolveTemplate(value, { trigger: triggerData });
      }
    }
    
    return resolved;
  }

  private resolveParams(params: Record<string, any>): Record<string, any> {
    const resolved: Record<string, any> = {};
    
    for (const [key, value] of Object.entries(params)) {
      resolved[key] = this.resolveTemplate(value, {
        ...this.variables,
        stepResults: Object.fromEntries(this.stepResults)
      });
    }
    
    return resolved;
  }

  private resolveTemplate(template: any, context: any): any {
    if (typeof template !== 'string') {
      return template;
    }
    
    return template.replace(/\${([^}]+)}/g, (match, path) => {
      const value = this.getValueByPath(context, path);
      return value !== undefined ? value : match;
    });
  }

  private getValueByPath(obj: any, path: string): any {
    return path.split('.').reduce((current, key) => {
      if (current && typeof current === 'object') {
        return current[key];
      }
      return undefined;
    }, obj);
  }

  private evaluateCondition(condition: string): boolean {
    // Simple condition evaluation for demo
    const resolved = this.resolveTemplate(condition, {
      ...this.variables,
      stepResults: Object.fromEntries(this.stepResults)
    });
    
    // For demo purposes, just check if the condition contains 'true'
    return resolved.includes('true');
  }
}

// CLI Commands
program
  .name('workflow-cli')
  .description('Execute automation workflows from YAML definitions')
  .version('1.0.0');

program
  .command('run <workflow>')
  .description('Execute a workflow')
  .option('-t, --trigger <data>', 'Trigger data in JSON format', '{}')
  .option('-w, --watch', 'Watch for file changes and re-run')
  .action(async (workflowPath: string, options: any) => {
    const runner = new WorkflowRunner();
    
    const run = async () => {
      try {
        const triggerData = JSON.parse(options.trigger);
        await runner.runWorkflow(workflowPath, triggerData);
      } catch (error) {
        console.error(chalk.red(`\n❌ Error: ${error.message}`));
        process.exit(1);
      }
    };

    await run();

    if (options.watch) {
      console.log(chalk.blue('\n👁️  Watching for changes...'));
      fs.watchFile(workflowPath, async () => {
        console.log(chalk.blue('\n🔄 File changed, re-running workflow...'));
        await run();
      });
    }
  });

program
  .command('validate <workflow>')
  .description('Validate a workflow definition')
  .action(async (workflowPath: string) => {
    try {
      const yamlContent = fs.readFileSync(workflowPath, 'utf8');
      const workflow = yaml.load(yamlContent) as WorkflowDefinition;
      
      console.log(chalk.green('✅ Workflow is valid!'));
      console.log(chalk.gray(`   Name: ${workflow.metadata.name}`));
      console.log(chalk.gray(`   Steps: ${workflow.steps.length}`));
    } catch (error) {
      console.error(chalk.red(`❌ Invalid workflow: ${error.message}`));
      process.exit(1);
    }
  });

program
  .command('list')
  .description('List available workflow templates')
  .action(() => {
    const templatesDir = path.join(__dirname, '../templates');
    
    try {
      const files = fs.readdirSync(templatesDir)
        .filter(f => f.endsWith('.yaml') || f.endsWith('.yml'));
      
      console.log(chalk.blue('📋 Available Workflow Templates:\n'));
      
      for (const file of files) {
        const content = fs.readFileSync(path.join(templatesDir, file), 'utf8');
        const workflow = yaml.load(content) as WorkflowDefinition;
        
        console.log(chalk.green(`  ${file}`));
        console.log(chalk.gray(`    ${workflow.metadata.description}`));
        console.log();
      }
    } catch (error) {
      console.error(chalk.red('❌ Error listing templates'));
    }
  });

// Parse command line arguments
program.parse(process.argv);