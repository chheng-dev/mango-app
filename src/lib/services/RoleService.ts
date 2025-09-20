import { BaseService, ServiceResponse, BusinessRuleResult } from './BaseService';
import { RoleModel, RoleSelect, RoleInsert, RoleWithPermissions, RoleWithUsers } from '../models/RoleModel';
import { ValidationError } from '../models/BaseModel';
import { db } from '../db';
import { userRoles } from '../db/schemas/user_roles';
import { users } from '../db/schemas/users';
import { eq, and, inArray } from 'drizzle-orm';

export class RoleService extends BaseService<RoleModel, RoleSelect, RoleInsert> {
  
  constructor() {
    const roleModel = new RoleModel();
    super(roleModel, 'RoleService');
  }

  protected validateData(data: Partial<RoleInsert>, isUpdate = false): ValidationError[] {
    const errors: ValidationError[] = [];

    if (!isUpdate) {
      errors.push(...this.validateRequired(data, ['name']));
    }

    if (data.name) {
      if (data.name.trim().length < 2) {
        errors.push({
          field: 'name',
          message: 'Role name must be at least 2 characters long'
        });
      }

      if (data.name.trim().length > 100) {
        errors.push({
          field: 'name',
          message: 'Role name cannot exceed 100 characters'
        });
      }

      const reservedNames = ['admin', 'super-admin', 'root', 'system'];
      if (reservedNames.includes(data.name.toLowerCase())) {
        errors.push({
          field: 'name',
          message: 'This role name is reserved and cannot be used'
        });
      }
    }

    if (data.description && data.description.length > 255) {
      errors.push({
        field: 'description',
        message: 'Description cannot exceed 255 characters'
      });
    }

    return errors;
  }

  protected async validateBusinessRules(data: Partial<RoleInsert>, existingData?: RoleSelect): Promise<BusinessRuleResult> {
    try {
      if (data.name) {
        const excludeId = existingData?.id;
        const nameExists = await this.model.existsByName(data.name, excludeId);
        
        if (nameExists) {
          return {
            valid: false,
            message: 'A role with this name already exists'
          };
        }
      }

      return { valid: true };
    } catch (error) {
      console.error('RoleService business rule validation error:', error);
      return {
        valid: false,
        message: 'Failed to validate business rules'
      };
    }
  }

  async createRole(data: RoleInsert): Promise<ServiceResponse<RoleSelect>> {
    return this.create(data);
  }

  async updateRole(id: number, data: Partial<RoleInsert>): Promise<ServiceResponse<RoleSelect>> {
    return this.update(id, data);
  }

  async getRoleWithPermissions(roleId: number): Promise<ServiceResponse<RoleWithPermissions>> {
    try {
      const result = await this.model.findWithPermissions(roleId);
      
      if (!result.success) {
        return {
          success: false,
          error: result.error
        };
      }

      return {
        success: true,
        data: result.data
      };
    } catch (error) {
      console.error('RoleService getRoleWithPermissions error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get role with permissions'
      };
    }
  }

  /**
   * Get role with its assigned users for user management
   */
  async getRoleWithUsers(roleId: number): Promise<ServiceResponse<RoleWithUsers>> {
    try {
      const result = await this.model.findWithUsers(roleId);
      
      if (!result.success) {
        return {
          success: false,
          error: result.error || 'Failed to fetch role with users'
        };
      }

      return {
        success: true,
        data: result.data
      };
    } catch (error) {
      console.error('RoleService getRoleWithUsers error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch role with users'
      };
    }
  }

  async assignPermissions(roleId: number, permissionIds: number[]): Promise<ServiceResponse<any>> {
    try {
      const roleExists = await this.model.exists(roleId);
      if (!roleExists) {
        return {
          success: false,
          error: 'Role not found'
        };
      }

      if (permissionIds.length === 0) {
        return {
          success: false,
          error: 'At least one permission must be specified'
        };
      }

      const currentRole = await this.model.findWithPermissions(roleId);
      if (currentRole.success && currentRole.data) {
        const existingPermissionIds = currentRole.data.permissions.map(p => p.id);
        const duplicates = permissionIds.filter(id => existingPermissionIds.includes(id));
        
        if (duplicates.length > 0) {
          return {
            success: false,
            error: `Permissions already assigned: ${duplicates.join(', ')}`
          };
        }
      }

      const result = await this.model.assignPermissions(roleId, permissionIds);

      if (!result.success) {
        return result;
      }

      this.logOperation('assignPermissions', { roleId, permissionIds });

      return {
        success: true,
        data: result.data,
        message: `Successfully assigned ${permissionIds.length} permissions to role`
      };

    } catch (error) {
      console.error('RoleService assignPermissions error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to assign permissions'
      };
    }
  }

  protected async beforeCreate(data: RoleInsert): Promise<RoleInsert> {
    if (data.name && !data.slug) {
      data.slug = this.generateSlug(data.name);
    }

    return data;
  }

  protected async beforeUpdate(data: Partial<RoleInsert>, existingData: RoleSelect): Promise<Partial<RoleInsert>> {
    if (data.name && data.name !== existingData.name) {
      data.slug = this.generateSlug(data.name);
    }

    return data;
  }

  protected async canDelete(data: RoleSelect): Promise<BusinessRuleResult> {
    try {
      const permissionCount = await this.model.getPermissionCount(data.id);
      
      if (permissionCount > 0) {
        return {
          valid: false,
          message: `Cannot delete role with ${permissionCount} permissions assigned. Remove permissions first.`
        };
      }

      return { valid: true };
    } catch (error) {
      console.error('RoleService canDelete error:', error);
      return {
        valid: false,
        message: 'Unable to verify if role can be deleted'
      };
    }
  }

  async assignUsersToRole(roleId: number, userIds: number[]): Promise<ServiceResponse<any>> {
    try {
      // Check if role exists
      const roleExists = await this.model.exists(roleId);
      if (!roleExists) {
        return {
          success: false,
          error: 'Role not found'
        };
      }

      if (userIds.length === 0) {
        return {
          success: false,
          error: 'At least one user ID must be specified'
        };
      }

      // Check if users exist
      const existingUsers = await db
        .select({ id: users.id })
        .from(users)
        .where(inArray(users.id, userIds));

      if (existingUsers.length !== userIds.length) {
        return {
          success: false,
          error: 'One or more users not found'
        };
      }

      // Remove existing assignments for these users to this role
      await db
        .delete(userRoles)
        .where(
          and(
            eq(userRoles.roleId, roleId),
            inArray(userRoles.userId, userIds)
          )
        );

      // Create new assignments
      const assignments = userIds.map(userId => ({
        userId,
        roleId,
        assignedAt: new Date(),
        isActive: true
      }));

      const result = await db.insert(userRoles).values(assignments).returning();

      this.logOperation('assignUsersToRole', { roleId, userIds });

      return {
        success: true,
        data: result,
        message: `Successfully assigned ${userIds.length} users to role`
      };

    } catch (error) {
      console.error('RoleService assignUsersToRole error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to assign users to role'
      };
    }
  }

  /**
   * Remove users from role
   */
  async removeUsersFromRole(roleId: number, userIds: number[]): Promise<ServiceResponse<any>> {
    try {
      // Check if role exists
      const roleExists = await this.model.exists(roleId);
      if (!roleExists) {
        return {
          success: false,
          error: 'Role not found'
        };
      }

      if (userIds.length === 0) {
        return {
          success: false,
          error: 'At least one user ID must be specified'
        };
      }

      // Remove assignments
      const result = await db
        .delete(userRoles)
        .where(
          and(
            eq(userRoles.roleId, roleId),
            inArray(userRoles.userId, userIds)
          )
        )
        .returning();

      this.logOperation('removeUsersFromRole', { roleId, userIds });

      return {
        success: true,
        data: result,
        message: `Successfully removed ${userIds.length} users from role`
      };

    } catch (error) {
      console.error('RoleService removeUsersFromRole error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to remove users from role'
      };
    }
  }

  /**
   * Remove permissions from role
   */
  async removePermissions(roleId: number, permissionIds: number[]): Promise<ServiceResponse<any>> {
    try {
      if (!Array.isArray(permissionIds) || permissionIds.length === 0) {
        return {
          success: false,
          error: 'Permission IDs array is required and cannot be empty'
        };
      }

      // Validate role exists
      const role = await this.getById(roleId);
      if (!role.success || !role.data) {
        return {
          success: false,
          error: 'Role not found'
        };
      }

      // Validate business rules
      const businessCheck = await this.validatePermissionRemoval(roleId, permissionIds);
      if (!businessCheck.valid) {
        return {
          success: false,
          error: businessCheck.message || 'Business rule validation failed'
        };
      }

      const result = await this.model.removePermissions(roleId, permissionIds);

      if (!result.success) {
        return {
          success: false,
          error: result.error || 'Failed to remove permissions'
        };
      }

      this.logOperation('removePermissions', { roleId, permissionIds });

      return {
        success: true,
        data: result.data,
        message: `Successfully removed ${permissionIds.length} permissions from role`
      };

    } catch (error) {
      console.error('RoleService removePermissions error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to remove permissions'
      };
    }
  }

  /**
   * Replace all permissions for a role
   */
  async replacePermissions(roleId: number, permissionIds: number[]): Promise<ServiceResponse<any>> {
    try {
      // Validate role exists and get current permissions
      const roleWithPermissions = await this.model.findWithPermissions(roleId);
      if (!roleWithPermissions.success || !roleWithPermissions.data) {
        return {
          success: false,
          error: 'Role not found'
        };
      }

      const currentPermissionIds = roleWithPermissions.data.permissions.map((p: any) => p.id);

      // Remove all current permissions if any exist
      if (currentPermissionIds.length > 0) {
        const removeResult = await this.removePermissions(roleId, currentPermissionIds);
        if (!removeResult.success) {
          return {
            success: false,
            error: `Failed to remove existing permissions: ${removeResult.error}`
          };
        }
      }

      // Assign new permissions if any provided
      if (permissionIds.length > 0) {
        const assignResult = await this.assignPermissions(roleId, permissionIds);
        if (!assignResult.success) {
          return {
            success: false,
            error: `Failed to assign new permissions: ${assignResult.error}`
          };
        }
      }

      this.logOperation('replacePermissions', { roleId, oldPermissions: currentPermissionIds, newPermissions: permissionIds });

      return {
        success: true,
        data: null,
        message: `Successfully replaced permissions for role. Removed ${currentPermissionIds.length}, added ${permissionIds.length}`
      };

    } catch (error) {
      console.error('RoleService replacePermissions error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to replace permissions'
      };
    }
  }

  /**
   * Validate permission removal business rules
   */
  private async validatePermissionRemoval(roleId: number, permissionIds: number[]): Promise<BusinessRuleResult> {
    try {
      // Get role details
      const role = await this.getById(roleId);
      if (!role.success || !role.data) {
        return {
          valid: false,
          message: 'Role not found'
        };
      }

      // Check if role is system role (admin, super-admin, etc.)
      const systemRoles = ['admin', 'super-admin', 'root', 'system'];
      if (systemRoles.includes(role.data.slug || '')) {
        return {
          valid: false,
          message: 'Cannot remove permissions from system roles'
        };
      }

      // Additional business rule: Check if removing permissions would leave role without essential permissions
      // This would require checking which permissions are currently assigned and ensuring core permissions remain
      
      return { valid: true };
    } catch (error) {
      return {
        valid: false,
        message: 'Failed to validate permission removal'
      };
    }
  }

  private generateSlug(name: string): string {
    return name
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '') // Remove special characters
      .replace(/[\s_-]+/g, '-') // Replace spaces and underscores with hyphens
      .replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens
  }
}

export const roleService = new RoleService();
