import { BaseController, ApiResponse } from './BaseController';
import { Role } from '../db/schemas/roles';
import { roleService } from '../services/RoleService';

interface RoleCreateData {
  name: string;
  slug?: string;
  description?: string;
  isActive?: boolean;
}

interface RoleUpdateData {
  name?: string;
  slug?: string;
  description?: string;
  isActive?: boolean;
}

/**
 * RoleController - Service-based controller extending BaseController
 * Provides role-specific operations with inherited CRUD functionality
 */
export class RoleController extends BaseController<Role, RoleCreateData, RoleUpdateData, typeof roleService> {
  
  constructor() {
    super(roleService);
  }

  /**
   * Get role with permissions (role-specific method)
   */
  async getRoleWithPermissions(id: number): Promise<ApiResponse<any>> {
    try {
      const result = await roleService.getRoleWithPermissions(id);

      if (!result.success || !result.data) {
        return {
          success: false,
          error: result.error || 'Role not found'
        };
      }

      return {
        success: true,
        data: result.data
      };
    } catch (error) {
      console.error('Get role with permissions error:', error);
      return {
        success: false,
        error: 'Failed to get role with permissions'
      };
    }
  }

  /**
   * Assign permissions to role
   */
  async assignPermissionsToRole(roleId: number, permissionIds: number[]): Promise<ApiResponse<boolean>> {
    try {
      if (!Array.isArray(permissionIds) || permissionIds.length === 0) {
        return {
          success: false,
          error: 'Permission IDs array is required and cannot be empty'
        };
      }

      const result = await roleService.assignPermissions(roleId, permissionIds);

      if (!result.success) {
        return {
          success: false,
          error: result.error || 'Failed to assign permissions'
        };
      }

      return {
        success: true,
        data: true,
        message: 'Permissions assigned successfully'
      };
    } catch (error) {
      console.error('Assign permissions to role error:', error);
      return {
        success: false,
        error: 'Failed to assign permissions'
      };
    }
  }

  /**
   * Remove permissions from role
   */
  async removePermissionsFromRole(roleId: number, permissionIds: number[]): Promise<ApiResponse<boolean>> {
    try {
      if (!Array.isArray(permissionIds) || permissionIds.length === 0) {
        return {
          success: false,
          error: 'Permission IDs array is required and cannot be empty'
        };
      }

      // TODO: Implement removePermissions method in RoleService
      // For now, return a placeholder response
      return {
        success: false,
        error: 'Remove permissions functionality not yet implemented in RoleService'
      };
    } catch (error) {
      console.error('Remove permissions from role error:', error);
      return {
        success: false,
        error: 'Failed to remove permissions'
      };
    }
  }

  /**
   * Get all roles with permissions (enhanced version)
   */
  async getAllRoles(params?: {
    page?: number;
    limit?: number;
    query?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
    includePermissions?: boolean;
  }): Promise<ApiResponse<Role[]>> {
    try {
      const result = await this.getAll({
        page: params?.page,
        limit: params?.limit,
        query: params?.query,
        sortBy: params?.sortBy,
        sortOrder: params?.sortOrder
      });

      if (!result.success || !params?.includePermissions) {
        return result;
      }

      // Enhance with permissions if requested
      const roles = result.data || [];
      const rolesWithPermissions = await Promise.all(
        roles.map(async (role) => {
          const roleWithPermissionsResult = await roleService.getRoleWithPermissions(role.id);
          return roleWithPermissionsResult.success && roleWithPermissionsResult.data ? 
            roleWithPermissionsResult.data : role;
        })
      );

      return {
        success: true,
        data: rolesWithPermissions as Role[],
        pagination: result.pagination
      };
    } catch (error) {
      console.error('Get all roles error:', error);
      return {
        success: false,
        error: 'Failed to fetch roles'
      };
    }
  }

  // ==================== HOOK OVERRIDES ====================

  /**
   * Validate role creation data
   */
  protected validateCreateData(data: RoleCreateData): ApiResponse<Role> | null {
    const errors = this.validateRequiredFields(data, ['name']);
    
    if (errors.length > 0) {
      return {
        success: false,
        error: errors.map(e => e.message).join(', ')
      };
    }

    return null;
  }

  /**
   * Process data before role creation
   */
  protected async beforeCreate(data: RoleCreateData): Promise<RoleCreateData> {
    // Auto-generate slug if not provided
    if (!data.slug) {
      data.slug = this.generateSlug(data.name);
    }

    // Set default active status
    if (data.isActive === undefined) {
      data.isActive = true;
    }

    return data;
  }

  /**
   * Process data before role update
   */
  protected async beforeUpdate(id: number, data: RoleUpdateData): Promise<RoleUpdateData> {
    // If name is being updated, regenerate slug if not explicitly provided
    if (data.name && !data.slug) {
      data.slug = this.generateSlug(data.name);
    }

    return data;
  }

  /**
   * Check if role can be deleted
   */
  protected async canDelete(id: number): Promise<{ allowed: boolean; reason?: string }> {
    try {
      // Check if role has assigned users (this would need user-role lookup)
      // For now, prevent deletion of admin roles based on slug
      const role = await this.getById(id);
      if (role.success && role.data) {
        const adminSlugs = ['admin', 'super-admin', 'root', 'system'];
        if (adminSlugs.includes(role.data.slug || '')) {
          return {
            allowed: false,
            reason: 'System roles cannot be deleted'
          };
        }
      }

      return { allowed: true };
    } catch (error) {
      return {
        allowed: false,
        reason: 'Unable to verify role deletion requirements'
      };
    }
  }

  /**
   * Get success messages
   */
  protected getCreateSuccessMessage(): string {
    return 'Role created successfully';
  }

  protected getUpdateSuccessMessage(): string {
    return 'Role updated successfully';
  }

  protected getDeleteSuccessMessage(): string {
    return 'Role deleted successfully';
  }

  // ==================== ADDITIONAL UTILITY METHODS ====================

  /**
   * Get role by slug (role-specific method)
   */
  async getRoleBySlug(slug: string): Promise<ApiResponse<Role>> {
    try {
      // Use search functionality to find by slug since findBySlug doesn't exist
      const result = await this.search(slug, 10);

      if (!result.success || !result.data || result.data.length === 0) {
        return {
          success: false,
          error: 'Role not found'
        };
      }

      // Find exact slug match
      const role = result.data.find(r => r.slug === slug);
      if (!role) {
        return {
          success: false,
          error: 'Role not found'
        };
      }

      return {
        success: true,
        data: role
      };
    } catch (error) {
      console.error('Get role by slug error:', error);
      return {
        success: false,
        error: 'Failed to get role'
      };
    }
  }

  /**
   * Get active roles only
   */
  async getActiveRoles(params?: {
    page?: number;
    limit?: number;
    query?: string;
  }): Promise<ApiResponse<Role[]>> {
    try {
      // Use the inherited getAll method and filter for active roles
      const result = await this.getAll({
        page: params?.page || 1,
        limit: params?.limit || 50,
        query: params?.query
      });

      if (!result.success || !result.data) {
        return {
          success: false,
          error: result.error || 'Failed to get roles'
        };
      }

      // Filter for active roles only
      const activeRoles = result.data.filter(role => role.isActive === true);

      return {
        success: true,
        data: activeRoles,
        message: 'Active roles retrieved successfully',
        pagination: result.pagination
      };
    } catch (error) {
      console.error('Get active roles error:', error);
      return {
        success: false,
        error: 'Failed to get active roles'
      };
    }
  }

  /**
   * Toggle role active status
   */
  async toggleRoleStatus(id: number): Promise<ApiResponse<Role>> {
    try {
      const roleResult = await this.getById(id);
      if (!roleResult.success || !roleResult.data) {
        return {
          success: false,
          error: 'Role not found'
        };
      }

      const currentStatus = roleResult.data.isActive;
      return await this.update(id, { isActive: !currentStatus });
    } catch (error) {
      console.error('Toggle role status error:', error);
      return {
        success: false,
        error: 'Failed to toggle role status'
      };
    }
  }

  async assignUsersToRole(roleId: number, userIds: number[]): Promise<ApiResponse<boolean>> {
    try {
      if (!Array.isArray(userIds) || userIds.length === 0) {
        return {
          success: false,
          error: 'User IDs array is required and cannot be empty'
        };
      } 
      const result = await roleService.assignUsersToRole(roleId, userIds);

      if (!result.success) {
        return {
          success: false,
          error: result.error || 'Failed to assign users to role'
        };
      }

      return {
        success: true,
        data: true,
        message: 'Users assigned to role successfully'
      };
    } catch (error) {
      console.error('Assign users to role error:', error);
      return {
        success: false,
        error: 'Failed to assign users to role'
      };
    } 
  }
}

export const roleController = new RoleController();
