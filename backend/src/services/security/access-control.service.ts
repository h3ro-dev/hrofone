import { Injectable, ForbiddenException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export interface Role {
  id: string;
  name: string;
  permissions: Permission[];
  hierarchy: number; // Higher number = more privileges
}

export interface Permission {
  id: string;
  resource: string;
  action: string;
  conditions?: Record<string, any>;
}

export interface User {
  id: string;
  email: string;
  roles: Role[];
  attributes: Record<string, any>;
  department?: string;
  clearanceLevel?: number;
}

export interface AccessContext {
  user: User;
  resource: string;
  action: string;
  resourceAttributes?: Record<string, any>;
  environment?: {
    ipAddress?: string;
    timestamp?: Date;
    location?: string;
    deviceTrust?: boolean;
  };
}

@Injectable()
export class AccessControlService {
  private roles: Map<string, Role> = new Map();
  private dataClassifications: Map<string, number> = new Map();

  constructor(private configService: ConfigService) {
    this.initializeRoles();
    this.initializeDataClassifications();
  }

  private initializeRoles(): void {
    const roles: Role[] = [
      {
        id: 'super-admin',
        name: 'Super Administrator',
        hierarchy: 100,
        permissions: [
          { id: 'all', resource: '*', action: '*' }
        ]
      },
      {
        id: 'hr-admin',
        name: 'HR Administrator',
        hierarchy: 80,
        permissions: [
          { id: 'emp-all', resource: 'employee', action: '*' },
          { id: 'pay-all', resource: 'payroll', action: '*' },
          { id: 'ben-all', resource: 'benefits', action: '*' },
          { id: 'comp-read', resource: 'compliance', action: 'read' },
          { id: 'comp-update', resource: 'compliance', action: 'update' }
        ]
      },
      {
        id: 'hr-manager',
        name: 'HR Manager',
        hierarchy: 60,
        permissions: [
          { id: 'emp-read', resource: 'employee', action: 'read' },
          { id: 'emp-update', resource: 'employee', action: 'update' },
          { id: 'pay-read', resource: 'payroll', action: 'read' },
          { id: 'ben-read', resource: 'benefits', action: 'read' },
          { id: 'comp-read', resource: 'compliance', action: 'read' }
        ]
      },
      {
        id: 'employee',
        name: 'Employee',
        hierarchy: 20,
        permissions: [
          { 
            id: 'emp-read-self', 
            resource: 'employee', 
            action: 'read',
            conditions: { selfOnly: true }
          },
          { 
            id: 'pay-read-self', 
            resource: 'payroll', 
            action: 'read',
            conditions: { selfOnly: true }
          },
          { 
            id: 'ben-read-self', 
            resource: 'benefits', 
            action: 'read',
            conditions: { selfOnly: true }
          }
        ]
      },
      {
        id: 'auditor',
        name: 'Compliance Auditor',
        hierarchy: 70,
        permissions: [
          { id: 'audit-all', resource: 'audit-log', action: '*' },
          { id: 'comp-read', resource: 'compliance', action: 'read' },
          { id: 'sec-read', resource: 'security', action: 'read' },
          { 
            id: 'emp-read-audit', 
            resource: 'employee', 
            action: 'read',
            conditions: { auditMode: true }
          }
        ]
      }
    ];

    roles.forEach(role => this.roles.set(role.id, role));
  }

  private initializeDataClassifications(): void {
    // Data classification levels
    this.dataClassifications.set('ssn', 5); // Critical
    this.dataClassifications.set('bankAccount', 5);
    this.dataClassifications.set('medicalRecord', 5);
    this.dataClassifications.set('salary', 4); // Confidential
    this.dataClassifications.set('performanceReview', 4);
    this.dataClassifications.set('email', 3); // Sensitive
    this.dataClassifications.set('phone', 3);
    this.dataClassifications.set('address', 3);
    this.dataClassifications.set('employmentHistory', 3);
    this.dataClassifications.set('companyPolicy', 2); // Internal
    this.dataClassifications.set('jobPosting', 1); // Public
  }

  /**
   * Check if user has access using RBAC + ABAC
   */
  async checkAccess(context: AccessContext): Promise<boolean> {
    try {
      // Step 1: Role-based check
      const hasRolePermission = this.checkRolePermission(context);
      
      if (!hasRolePermission) {
        return false;
      }

      // Step 2: Attribute-based check
      const hasAttributePermission = this.checkAttributePermission(context);
      
      if (!hasAttributePermission) {
        return false;
      }

      // Step 3: Data classification check
      const hasClassificationAccess = this.checkDataClassification(context);
      
      if (!hasClassificationAccess) {
        return false;
      }

      // Step 4: Environmental checks
      const passesEnvironmentalChecks = this.checkEnvironmentalFactors(context);
      
      return passesEnvironmentalChecks;
    } catch (error) {
      console.error('Access control error:', error);
      return false;
    }
  }

  /**
   * Enforce access control (throws exception if denied)
   */
  async enforceAccess(context: AccessContext): Promise<void> {
    const hasAccess = await this.checkAccess(context);
    
    if (!hasAccess) {
      throw new ForbiddenException(
        `Access denied: User ${context.user.id} cannot ${context.action} ${context.resource}`
      );
    }
  }

  private checkRolePermission(context: AccessContext): boolean {
    const { user, resource, action } = context;
    
    for (const role of user.roles) {
      for (const permission of role.permissions) {
        // Check wildcard permissions
        if (permission.resource === '*' && permission.action === '*') {
          return true;
        }
        
        // Check specific permissions
        if (
          (permission.resource === resource || permission.resource === '*') &&
          (permission.action === action || permission.action === '*')
        ) {
          // Check permission conditions
          if (permission.conditions) {
            if (permission.conditions.selfOnly && 
                context.resourceAttributes?.ownerId !== user.id) {
              continue;
            }
            if (permission.conditions.departmentOnly && 
                context.resourceAttributes?.department !== user.department) {
              continue;
            }
          }
          return true;
        }
      }
    }
    
    return false;
  }

  private checkAttributePermission(context: AccessContext): boolean {
    const { user, resourceAttributes } = context;
    
    // Check clearance level
    if (resourceAttributes?.requiredClearance) {
      const userClearance = user.clearanceLevel || 0;
      if (userClearance < resourceAttributes.requiredClearance) {
        return false;
      }
    }
    
    // Check department restrictions
    if (resourceAttributes?.restrictedToDepartments) {
      const allowedDepts = resourceAttributes.restrictedToDepartments as string[];
      if (!user.department || !allowedDepts.includes(user.department)) {
        return false;
      }
    }
    
    // Check time-based restrictions
    if (resourceAttributes?.timeRestrictions) {
      const now = new Date();
      const restrictions = resourceAttributes.timeRestrictions;
      
      if (restrictions.startTime && now < new Date(restrictions.startTime)) {
        return false;
      }
      if (restrictions.endTime && now > new Date(restrictions.endTime)) {
        return false;
      }
    }
    
    return true;
  }

  private checkDataClassification(context: AccessContext): boolean {
    const { user, resourceAttributes } = context;
    
    if (!resourceAttributes?.dataType) {
      return true;
    }
    
    const requiredLevel = this.dataClassifications.get(resourceAttributes.dataType) || 0;
    const userMaxLevel = Math.max(...user.roles.map(r => r.hierarchy)) / 20; // Convert to 1-5 scale
    
    return userMaxLevel >= requiredLevel;
  }

  private checkEnvironmentalFactors(context: AccessContext): boolean {
    const { environment, resourceAttributes } = context;
    
    if (!environment || !resourceAttributes?.environmentalRequirements) {
      return true;
    }
    
    const requirements = resourceAttributes.environmentalRequirements;
    
    // Check IP restrictions
    if (requirements.allowedIPs && environment.ipAddress) {
      const allowed = requirements.allowedIPs as string[];
      if (!allowed.includes(environment.ipAddress)) {
        return false;
      }
    }
    
    // Check device trust
    if (requirements.requireTrustedDevice && !environment.deviceTrust) {
      return false;
    }
    
    // Check location restrictions
    if (requirements.allowedLocations && environment.location) {
      const allowed = requirements.allowedLocations as string[];
      if (!allowed.includes(environment.location)) {
        return false;
      }
    }
    
    // Check time-of-day restrictions
    if (requirements.businessHoursOnly) {
      const hour = new Date().getHours();
      if (hour < 8 || hour > 18) {
        return false;
      }
    }
    
    return true;
  }

  /**
   * Get effective permissions for a user
   */
  getEffectivePermissions(user: User): Permission[] {
    const permissions: Permission[] = [];
    const seen = new Set<string>();
    
    for (const role of user.roles) {
      for (const permission of role.permissions) {
        const key = `${permission.resource}:${permission.action}`;
        if (!seen.has(key)) {
          seen.add(key);
          permissions.push(permission);
        }
      }
    }
    
    return permissions;
  }

  /**
   * Check if user has a specific role
   */
  hasRole(user: User, roleId: string): boolean {
    return user.roles.some(role => role.id === roleId);
  }

  /**
   * Get highest privilege level for user
   */
  getUserPrivilegeLevel(user: User): number {
    return Math.max(0, ...user.roles.map(role => role.hierarchy));
  }
}