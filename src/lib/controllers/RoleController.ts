import { BaseController, ApiResponse } from './BaseController';
import { Role } from '../db/schemas/roles';
import { RoleWithUsers, RoleSelect } from '../models/RoleModel';
import { roleService } from '../services/RoleService';
import { userService } from '../services/UserService';

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
  permissions?: number[];
}

type RoleUpdateDataWithoutPermissions = Omit<RoleUpdateData, 'permissions'>;

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

      const result = await roleService.removePermissions(roleId, permissionIds);

      if (!result.success) {
        return {
          success: false,
          error: result.error || 'Failed to remove permissions'
        };
      }

      return {
        success: true,
        data: true,
        message: 'Permissions removed successfully'
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
   * Replace all permissions for a role
   */
  async replacePermissionsForRole(roleId: number, permissionIds: number[]): Promise<ApiResponse<boolean>> {
    try {
      if (!Array.isArray(permissionIds)) {
        return {
          success: false,
          error: 'Permission IDs must be an array'
        };
      }

      const result = await roleService.replacePermissions(roleId, permissionIds);

      if (!result.success) {
        return {
          success: false,
          error: result.error || 'Failed to replace permissions'
        };
      }

      return {
        success: true,
        data: true,
        message: 'Permissions updated successfully'
      };
    } catch (error) {
      console.error('Replace permissions for role error:', error);
      return {
        success: false,
        error: 'Failed to replace permissions'
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
   * Validate role update data
   */
  protected validateUpdateData(data: RoleUpdateData): ApiResponse<Role> | null {
    // For updates, only validate if name is provided and not empty
    if (data.name !== undefined) {
      const errors = this.validateRequiredFields({ name: data.name }, ['name']);
      
      if (errors.length > 0) {
        return {
          success: false,
          error: errors.map(e => e.message).join(', ')
        };
      }
    }

    // Validate slug format if provided
    if (data.slug !== undefined && data.slug !== null) {
      if (typeof data.slug === 'string' && data.slug.length > 0) {
        // Check if slug contains only valid characters
        const slugPattern = /^[a-z0-9_-]+$/;
        if (!slugPattern.test(data.slug)) {
          return {
            success: false,
            error: 'Slug can only contain lowercase letters, numbers, hyphens, and underscores'
          };
        }
      }
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
   * Override update method to handle permissions
   */
  async update(id: number, data: RoleUpdateData): Promise<ApiResponse<RoleSelect>> {
    try {
      if (isNaN(id)) {
        return {
          success: false,
          error: 'Invalid ID'
        };
      }

      const { permissions, ...roleData } = data;

      // Validate role data (without permissions)
      const validationError = this.validateUpdateData(roleData as RoleUpdateDataWithoutPermissions);
      if (validationError) {
        return validationError;
      }

      // Process role data before update
      const processedRoleData = await this.beforeUpdate(id, roleData as RoleUpdateDataWithoutPermissions);

      // Update role data directly through service
      const result = await this.service.update(id, processedRoleData);
      
      if (!result.success) {
        return {
          success: false,
          error: result.error || 'Failed to update role'
        };
      }

      // Handle permissions separately if provided
      if (permissions && Array.isArray(permissions)) {
        const permissionResult = await this.service.replacePermissions(id, permissions);
        
        if (!permissionResult.success) {
          return {
            success: false,
            error: permissionResult.error || 'Failed to update permissions'
          };
        }
      }

      return {
        success: true,
        data: result.data,
        message: this.getUpdateSuccessMessage()
      };

    } catch (error) {
      console.error('RoleController update error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to update role'
      };
    }
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

  /**
   * Get users available for role assignment
   */
  async getUsersForRoleAssignment(roleId: number, params?: {
    page?: number;
    limit?: number;
    query?: string;
    excludeAssigned?: boolean;
  }): Promise<ApiResponse<any[]>> {
    try {
      // First, verify the role exists
      const roleResult = await this.getById(roleId);
      if (!roleResult.success || !roleResult.data) {
        return {
          success: false,
          error: 'Role not found'
        };
      }

      // Get all users
      const usersResult = await userService.findManyLegacy({
        page: params?.page || 1,
        limit: params?.limit || 50,
        query: params?.query,
        isActive: true // Only get active users
      });

      if (!usersResult.success || !usersResult.data) {
        return {
          success: false,
          error: 'Failed to fetch users'
        };
      }

      let users = usersResult.data.users;

      // If excludeAssigned is true, filter out users already assigned to this role
      if (params?.excludeAssigned) {
        // Get users with roles to check current assignments
        const usersWithRoles = await Promise.all(
          users.map(async (user) => {
            const userWithRolesResult = await userService.getUserWithRoles(user.id);
            if (userWithRolesResult.success && userWithRolesResult.data) {
              return userWithRolesResult.data;
            }
            return { ...user, roles: [] };
          })
        );

        // Filter out users who already have this role
        users = usersWithRoles.filter((user: any) => {
          return !user.roles?.some((role: any) => role.id === roleId);
        });
      }

      // Remove sensitive fields from users
      const sanitizedUsers = users.map((user: any) => ({
        id: user.id,
        name: user.name,
        email: user.email,
        code: user.code,
        isActive: user.isActive,
        isVerified: user.isVerified,
        createdAt: user.createdAt,
        roles: user.roles || []
      }));

      return {
        success: true,
        data: sanitizedUsers,
        pagination: usersResult.data.pagination,
        message: 'Users retrieved successfully'
      };
    } catch (error) {
      console.error('Get users for role assignment error:', error);
      return {
        success: false,
        error: 'Failed to get users for role assignment'
      };
    }
  }

  /**
   * Get users currently assigned to a role
   */
  async getUsersAssignedToRole(roleId: number, params?: {
    page?: number;
    limit?: number;
    query?: string;
  }): Promise<ApiResponse<any[]>> {
    try {
      // Get role with its assigned users
      const roleWithUsersResult = await roleService.getRoleWithUsers?.(roleId);

      if (!roleWithUsersResult?.success || !roleWithUsersResult.data) {
        // Fallback: get role with permissions and try to find users through user-role relationships
        const roleResult = await this.getById(roleId);
        if (!roleResult.success || !roleResult.data) {
          return {
            success: false,
            error: 'Role not found'
          };
        }

        // Return empty list if we can't get users directly
        return {
          success: true,
          data: [],
          pagination: {
            page: params?.page || 1,
            limit: params?.limit || 50,
            total: 0,
            totalPages: 0
          },
          message: 'No users currently assigned to this role'
        };
      }

      let users = roleWithUsersResult.data.users || [];

      // Apply query filter if provided
      if (params?.query) {
        const query = params.query.toLowerCase();
        users = users.filter((user: any) => 
          user.name?.toLowerCase().includes(query) ||
          user.email?.toLowerCase().includes(query) ||
          user.code?.toLowerCase().includes(query)
        );
      }

      // Apply pagination
      const page = params?.page || 1;
      const limit = params?.limit || 50;
      const offset = (page - 1) * limit;
      const paginatedUsers = users.slice(offset, offset + limit);

      // Remove sensitive fields
      const sanitizedUsers = paginatedUsers.map((user: any) => ({
        id: user.id,
        name: user.name,
        email: user.email,
        code: user.code,
        isActive: user.isActive,
        isVerified: user.isVerified,
        createdAt: user.createdAt
      }));

      return {
        success: true,
        data: sanitizedUsers,
        pagination: {
          page,
          limit,
          total: users.length,
          totalPages: Math.ceil(users.length / limit)
        },
        message: 'Role users retrieved successfully'
      };
    } catch (error) {
      console.error('Get users assigned to role error:', error);
      return {
        success: false,
        error: 'Failed to get users assigned to role'
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

  /**
   * Remove users from role
   */
  async removeUsersFromRole(roleId: number, userIds: number[]): Promise<ApiResponse<boolean>> {
    try {
      if (!Array.isArray(userIds) || userIds.length === 0) {
        return {
          success: false,
          error: 'User IDs array is required and cannot be empty'
        };
      } 
      const result = await roleService.removeUsersFromRole(roleId, userIds);

      if (!result.success) {
        return {
          success: false,
          error: result.error || 'Failed to remove users from role'
        };
      }

      return {
        success: true,
        data: true,
        message: 'Users removed from role successfully'
      };
    } catch (error) {
      console.error('Remove users from role error:', error);
      return {
        success: false,
        error: 'Failed to remove users from role'
      };
    } 
  }
}

export const roleController = new RoleController();
