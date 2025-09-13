import { BaseService, ServiceResponse, BusinessRuleResult } from './BaseService';
import { RoleModel, RoleSelect, RoleInsert, RoleWithPermissions } from '../models/RoleModel';
import { ValidationError } from '../models/BaseModel';

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
