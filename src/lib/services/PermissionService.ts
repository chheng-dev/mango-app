import { BaseService, ServiceResponse, BusinessRuleResult } from './BaseService';
import { ValidationError } from '../models/BaseModel';
import { PermissionInsert, PermissionModel, PermissionSelect } from '../models/PermissionModel';

/**
 * PermissionService - Business Logic Layer for Permissions
 * 
 * RESPONSIBILITIES:
 * - Permission business logic and validation
 * - Name/slug uniqueness rules
 * - Resource and action validation
 * - Permission categorization
 */
export class PermissionService extends BaseService<PermissionModel, PermissionSelect, PermissionInsert> {
  
  constructor() {
    const permissionModel = new PermissionModel();
    super(permissionModel, 'PermissionService');
  }

  // ==================== VALIDATION METHODS ====================

  protected validateData(data: Partial<PermissionInsert>, isUpdate = false): ValidationError[] {
    const errors: ValidationError[] = [];

    // Required field validation for create
    if (!isUpdate) {
      errors.push(...this.validateRequired(data, ['name', 'resource', 'action']));
    }

    // Name validation
    if (data.name) {
      if (data.name.trim().length < 2) {
        errors.push({
          field: 'name',
          message: 'Permission name must be at least 2 characters long'
        });
      }

      if (data.name.trim().length > 100) {
        errors.push({
          field: 'name',
          message: 'Permission name cannot exceed 100 characters'
        });
      }
    }

    // Resource validation
    if (data.resource) {
      if (data.resource.trim().length < 2) {
        errors.push({
          field: 'resource',
          message: 'Resource must be at least 2 characters long'
        });
      }

      if (data.resource.trim().length > 100) {
        errors.push({
          field: 'resource',
          message: 'Resource cannot exceed 100 characters'
        });
      }
    }

    // Action validation
    if (data.action) {
      if (data.action.trim().length < 2) {
        errors.push({
          field: 'action',
          message: 'Action must be at least 2 characters long'
        });
      }

      if (data.action.trim().length > 100) {
        errors.push({
          field: 'action',
          message: 'Action cannot exceed 100 characters'
        });
      }
    }

    // Slug validation
    if (data.slug) {
      if (data.slug.trim().length > 100) {
        errors.push({
          field: 'slug',
          message: 'Slug cannot exceed 100 characters'
        });
      }

      // Slug format validation (alphanumeric and underscores only)
      if (!/^[a-z0-9_]+$/.test(data.slug.toLowerCase())) {
        errors.push({
          field: 'slug',
          message: 'Slug can only contain lowercase letters, numbers, and underscores'
        });
      }
    }

    // Description validation
    if (data.description && data.description.length > 255) {
      errors.push({
        field: 'description',
        message: 'Description cannot exceed 255 characters'
      });
    }

    return errors;
  }

  protected async validateBusinessRules(data: Partial<PermissionInsert>, existingData?: PermissionSelect): Promise<BusinessRuleResult> {
    try {
      // Check for duplicate name (excluding current record)
      if (data.name) {
        const existingByName = await this.model.findByName(data.name);
        if (existingByName.success && existingByName.data && existingByName.data.id !== existingData?.id) {
          return {
            valid: false,
            message: 'Permission name already exists'
          };
        }
      }

      // Check for duplicate slug (excluding current record)
      if (data.slug) {
        const existingBySlug = await this.model.findBySlug(data.slug);
        if (existingBySlug.success && existingBySlug.data && existingBySlug.data.id !== existingData?.id) {
          return {
            valid: false,
            message: 'Permission slug already exists'
          };
        }
      }

      return { valid: true };

    } catch (error) {
      console.error('PermissionService validateBusinessRules error:', error);
      return {
        valid: false,
        message: 'Business rule validation failed'
      };
    }
  }

  // ==================== PERMISSION-SPECIFIC METHODS ====================

  /**
   * Create permission with auto-generated slug
   */
  async createPermission(data: PermissionInsert): Promise<ServiceResponse<PermissionSelect>> {
    return this.create(data);
  }

  /**
   * Update permission
   */
  async updatePermission(id: number, data: Partial<PermissionInsert>): Promise<ServiceResponse<PermissionSelect>> {
    return this.update(id, data);
  }

  /**
   * Find permission by slug
   */
  async findBySlug(slug: string): Promise<ServiceResponse<PermissionSelect>> {
    try {
      const result = await this.model.findBySlug(slug);
      
      if (!result.success) {
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
      console.error('PermissionService findBySlug error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to find permission by slug'
      };
    }
  }

  /**
   * Get permissions by resource
   */
  async getPermissionsByResource(resource: string): Promise<ServiceResponse<PermissionSelect[]>> {
    try {
      const result = await this.model.findByResource(resource);
      
      if (!result.success) {
        return {
          success: false,
          error: result.error || 'Failed to get permissions'
        };
      }

      return {
        success: true,
        data: result.data || []
      };

    } catch (error) {
      console.error('PermissionService getPermissionsByResource error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get permissions by resource'
      };
    }
  }

  /**
   * Search permissions with enhanced business logic
   */
  async searchPermissions(query: string, options: {
    limit?: number;
    includeInactive?: boolean;
  } = {}): Promise<ServiceResponse<PermissionSelect[]>> {
    try {
      const { limit = 20, includeInactive = false } = options;

      if (!query || query.trim().length < 2) {
        return {
          success: false,
          error: 'Search query must be at least 2 characters long'
        };
      }

      const filters: any = {};
      if (!includeInactive) {
        // Assuming there might be an isActive field in the future
        // filters.isActive = true;
      }

      const result = await this.getAll({
        query: query.trim(),
        limit,
        page: 1,
        filters
      });

      if (!result.success) {
        return result;
      }

      return {
        success: true,
        data: result.data || []
      };

    } catch (error) {
      console.error('PermissionService searchPermissions error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to search permissions'
      };
    }
  }

  // ==================== LIFECYCLE HOOKS ====================

  protected async beforeCreate(data: PermissionInsert): Promise<PermissionInsert> {
    // Generate slug if not provided
    if (!data.slug) {
      data.slug = this.generateSlug(`${data.resource}_${data.action}`);
    }

    this.logOperation('beforeCreate', { resource: data.resource, action: data.action });
    return data;
  }

  protected async beforeUpdate(data: Partial<PermissionInsert>, existingData: PermissionSelect): Promise<Partial<PermissionInsert>> {
    // Regenerate slug if resource or action changed
    if ((data.resource && data.resource !== existingData.resource) || 
        (data.action && data.action !== existingData.action)) {
      const resource = data.resource || existingData.resource;
      const action = data.action || existingData.action;
      data.slug = this.generateSlug(`${resource}_${action}`);
    }

    this.logOperation('beforeUpdate', { id: existingData.id, changes: Object.keys(data) });
    return data;
  }

  protected async canDelete(data: PermissionSelect): Promise<BusinessRuleResult> {
    try {
      // Check if permission is assigned to any roles
      // This would require checking the role_permissions table
      // For now, we'll allow deletion but this should be implemented
      
      this.logOperation('canDelete', { id: data.id, name: data.name });
      return { valid: true };

    } catch (error) {
      console.error('PermissionService canDelete error:', error);
      return {
        valid: false,
        message: 'Cannot determine if permission can be deleted'
      };
    }
  }

  protected async afterDelete(data: PermissionSelect): Promise<void> {
    this.logOperation('afterDelete', { id: data.id, name: data.name });
  }

  /**
   * Generate URL-friendly slug from text
   */
  private generateSlug(text: string): string {
    return text
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '') // Remove special characters
      .replace(/[\s-]+/g, '_') // Replace spaces and hyphens with underscores
      .replace(/^_+|_+$/g, ''); // Remove leading/trailing underscores
  }
}

export const permissionService = new PermissionService();
