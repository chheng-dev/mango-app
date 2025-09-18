import { BaseController, ApiResponse } from './BaseController';
import { Permission } from '../db/schemas/permissions';
import { permissionService } from '../services/PermissionService';

interface PermissionCreateData {
  name: string;
  slug?: string;
  resource: string;
  action: string;
  description?: string;
}

interface PermissionUpdateData {
  name?: string;
  slug?: string;
  resource?: string;
  action?: string;
  description?: string;
}

/**
 * PermissionController - Service-based controller extending BaseController
 * Provides permission-specific operations with inherited CRUD functionality
 */
export class PermissionController extends BaseController<Permission, PermissionCreateData, PermissionUpdateData, typeof permissionService> {
  
  constructor() {
    super(permissionService);
  }

  /**
   * Get permissions by resource (permission-specific method)
   */
  async getPermissionsByResource(resource: string): Promise<ApiResponse<Permission[]>> {
    try {
      const result = await permissionService.getPermissionsByResource(resource);

      return this.formatServiceResponse(result);
    } catch (error) {
      console.error('Get permissions by resource error:', error);
      return {
        success: false,
        error: 'Failed to get permissions by resource'
      };
    }
  }

  /**
   * Get permission by slug (permission-specific method)
   */
  async getPermissionBySlug(slug: string): Promise<ApiResponse<Permission>> {
    try {
      const result = await permissionService.findBySlug(slug);

      if (!result.success || !result.data) {
        return {
          success: false,
          error: result.error || 'Permission not found'
        };
      }

      return {
        success: true,
        data: result.data
      };
    } catch (error) {
      console.error('Get permission by slug error:', error);
      return {
        success: false,
        error: 'Failed to get permission'
      };
    }
  }

  /**
   * Enhanced search for permissions (overrides base search)
   */
  async searchPermissions(query: string, limit: number = 20): Promise<ApiResponse<Permission[]>> {
    try {
      if (!query || query.trim().length < 2) {
        return {
          success: false,
          error: 'Search query must be at least 2 characters long'
        };
      }

      const result = await permissionService.searchPermissions(query.trim(), { 
        limit,
        includeInactive: false
      });

      return this.formatServiceResponse(result, 'Permissions found successfully');
    } catch (error) {
      console.error('Search permissions error:', error);
      return {
        success: false,
        error: 'Failed to search permissions'
      };
    }
  }

  // ==================== HOOK OVERRIDES ====================

  /**
   * Validate permission creation data
   */
  protected validateCreateData(data: PermissionCreateData): ApiResponse<Permission> | null {
    const errors = this.validateRequiredFields(data, ['name', 'resource', 'action']);
    
    if (errors.length > 0) {
      return {
        success: false,
        error: errors.map(e => e.message).join(', ')
      };
    }

    return null;
  }

  /**
   * Process data before permission creation
   */
  protected async beforeCreate(data: PermissionCreateData): Promise<PermissionCreateData> {
    // Auto-generate slug if not provided
    if (!data.slug) {
      data.slug = this.generateSlug(`${data.resource}_${data.action}`);
    }

    // Ensure description is properly set
    if (!data.description) {
      data.description = `${data.action} permissions for ${data.resource}`;
    }

    return data;
  }

  /**
   * Process data before permission update
   */
  protected async beforeUpdate(id: number, data: PermissionUpdateData): Promise<PermissionUpdateData> {
    if ((data.resource || data.action) && !data.slug) {
      // Get existing permission to merge resource/action
      const existing = await this.getById(id);
      if (existing.success && existing.data) {
        const resource = data.resource || existing.data.resource;
        const action = data.action || existing.data.action;
        data.slug = this.generateSlug(`${resource}_${action}`);
      }
    }

    return data;
  }

  /**
   * Check if permission can be deleted
   */
  protected async canDelete(id: number): Promise<{ allowed: boolean; reason?: string }> {
    // Check if permission is assigned to any roles (this would require role-permission lookup)
    // For now, allow all deletions but this should be enhanced
    return { allowed: true };
  }

  /**
   * Get success messages
   */
  protected getCreateSuccessMessage(): string {
    return 'Permission created successfully';
  }

  protected getUpdateSuccessMessage(): string {
    return 'Permission updated successfully';
  }

  protected getDeleteSuccessMessage(): string {
    return 'Permission deleted successfully';
  }

  // ==================== ADDITIONAL UTILITY METHODS ====================

  /**
   * Get all unique resources
   */
  async getUniqueResources(): Promise<ApiResponse<string[]>> {
    try {
      const result = await (permissionService as any).model?.getUniqueResources?.() || 
                     await permissionService.getAll({ limit: 1000 });

      if (!result.success) {
        return {
          success: false,
          error: result.error || 'Failed to get resources'
        };
      }

      // Extract unique resources from data
      const resources = Array.isArray(result.data) ? 
        [...new Set(result.data.map((p: Permission) => p.resource))] :
        result.data || [];

      return {
        success: true,
        data: resources
      };
    } catch (error) {
      console.error('Get unique resources error:', error);
      return {
        success: false,
        error: 'Failed to get unique resources'
      };
    }
  }

  /**
   * Get all unique actions for a resource
   */
  async getUniqueActionsForResource(resource: string): Promise<ApiResponse<string[]>> {
    try {
      const result = await this.getPermissionsByResource(resource);

      if (!result.success) {
        return {
          success: false,
          error: result.error || 'Failed to get actions'
        };
      }

      const actions = [...new Set(result.data?.map((p: Permission) => p.action) || [])];

      return {
        success: true,
        data: actions
      };
    } catch (error) {
      console.error('Get unique actions error:', error);
      return {
        success: false,
        error: 'Failed to get unique actions for resource'
      };
    }
  }

  /**
   * Get permissions grouped by resource
   */
  async getPermissionsGroupedByResource(): Promise<ApiResponse<Record<string, Permission[]>>> {
    try {
      const result = await this.getAll({ limit: 1000 }); // Get all permissions

      if (!result.success) {
        return {
          success: false,
          error: result.error || 'Failed to get permissions'
        };
      }

      const grouped = (result.data || []).reduce((acc: Record<string, Permission[]>, permission: Permission) => {
        if (!acc[permission.resource]) {
          acc[permission.resource] = [];
        }
        acc[permission.resource].push(permission);
        return acc;
      }, {});

      return {
        success: true,
        data: grouped
      };
    } catch (error) {
      console.error('Get permissions grouped by resource error:', error);
      return {
        success: false,
        error: 'Failed to group permissions by resource'
      };
    }
  }
}

// Create singleton instance for easy access
export const permissionController = new PermissionController();
