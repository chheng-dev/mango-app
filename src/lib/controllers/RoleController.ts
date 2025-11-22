import { ApiResponse } from '@/types/api';
import { RoleModel, RoleSelect, RoleInsert } from '../models/RoleModel';
import { ModelController } from './ModelController';
import { Role } from '../types/role';

export class RoleController extends ModelController<RoleSelect, RoleInsert, RoleModel> {
  
  constructor() {
    super(new RoleModel());
  }

  async getAll(options?: { 
    page?: number; 
    limit?: number; 
    name?: string; 
    search?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }) {    
    const result = await this.model.getAllWithFilters({
      page: options?.page,
      limit: options?.limit,
      name: options?.name,
      search: options?.search,
      sortBy: options?.sortBy,
      sortOrder: options?.sortOrder
    });
    
    return this.convertResponse<RoleSelect[]>(result as any);
  }

  async getRoleBySlug(slug: string): Promise<ApiResponse<RoleSelect>> {
    const result = await this.model.findByField('slug', slug);
    return this.convertResponse<RoleSelect>(result as any);
  }

  async getById(id: number): Promise<ApiResponse<RoleSelect>> {
    const result = await this.model.getById(id);
    return this.convertResponse<RoleSelect>(result as any);
  }

  async getRoleWithPermissions(id: number, options?: { isSuperAdmin?: boolean }): Promise<ApiResponse<RoleSelect & { permissions: string[] }>> {
    const result = await this.model.findWithPermissions(id, options);
    return this.convertResponse<RoleSelect & { permissions: string[] }>(result as any);
  }

  async assignPermissionsToRole(roleId: number, permissionIds: number[]): Promise<ApiResponse<boolean>> {
    const result = await this.model.assignPermissions(roleId, permissionIds);
    return this.convertResponse<boolean>(result as any);
  }

  async updatePermissionsForRole(roleId: number, permissionIds: number[]): Promise<ApiResponse<boolean>> {
    const result = await this.model.updatePermissionsForRole(roleId, permissionIds);
    return this.convertResponse<boolean>(result as any);
  }

  async removePermissionsFromRole(roleId: number, permissionIds: number[]): Promise<ApiResponse<boolean>> {
    const result = await this.model.removePermissions(roleId, permissionIds);
    return this.convertResponse<boolean>(result as any);
  }

  async countPermissionsForRole(roleId: number): Promise<ApiResponse<number>> {
    try {
      const count = await this.model.getPermissionCount(roleId);
      return {
        success: true,
        data: count,
        message: 'Permission count retrieved successfully'
      };
    } catch (error) {
      console.error('Error counting permissions for role:', error);
      return {
        success: false,
        error: 'Failed to count permissions for role'
      };
    }
  }

  async countUsersForRole(roleId: number): Promise<ApiResponse<number>> {
    try {
      const count = await this.model.getUserCount(roleId);
      return {
        success: true,
        data: count,
        message: 'User count retrieved successfully'
      };
    } catch (error) {
      console.error('Error counting users for role:', error);
      return {
        success: false,
        error: 'Failed to count users for role'
      };
    }
  }

  protected validateCreateData(data: RoleInsert): ApiResponse<any> | null {
    const errors = this.validateRequiredFields(data, ['name']);
    if (errors.length) return { success: false, error: errors.map(e => e.message).join(', ') };

    if (data.slug && !this.isValidSlug(data.slug)) {
      return { success: false, error: 'Slug can only contain lowercase letters, numbers, hyphens, and underscores' };
    }

    return null;
  }

  protected validateUpdateData(data: Partial<RoleInsert>): ApiResponse<any> | null {
    if (data.name !== undefined) {
      const errors = this.validateRequiredFields({ name: data.name }, ['name']);
      if (errors.length) return { success: false, error: errors.map(e => e.message).join(', ') };
    }

    if (data.slug && !this.isValidSlug(data.slug)) {
      return { success: false, error: 'Slug can only contain lowercase letters, numbers, hyphens, and underscores' };
    }

    return null;
  }

  protected beforeCreate(data: RoleInsert): RoleInsert {
    return {
      ...data,
      slug: data.slug || this.generateSlug(data.name),
      isActive: data.isActive ?? true
    };
  }

  protected beforeUpdate(id: number, data: Partial<RoleInsert>): Partial<RoleInsert> {
    const processedData = { ...data };
    if (processedData.name && !processedData.slug) {
      processedData.slug = this.generateSlug(processedData.name);
    }
    return processedData;
  }

  protected async canDelete(id: number): Promise<{ allowed: boolean; reason?: string }> {
    const roleResult = await this.getById(id);
    if (!roleResult.success || !roleResult.data) {
      return { allowed: false, reason: 'Role not found' };
    }

    const adminSlugs = ['admin', 'super-admin', 'root', 'system'];
    if (adminSlugs.includes(roleResult.data.slug || '')) {
      return { allowed: false, reason: 'System roles cannot be deleted' };
    }

    return { allowed: true };
  }   

  // Helper methods
  private generateSlug(name: string): string {
    return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
  }

  private isValidSlug(slug: string): boolean {
    return /^[a-z0-9_-]+$/.test(slug);
  }

  // Override success messages
  protected getCreateSuccessMessage() { return 'Role created successfully'; }
  protected getUpdateSuccessMessage() { return 'Role updated successfully'; }
  protected getDeleteSuccessMessage() { return 'Role deleted successfully'; }
}

export const roleController = new RoleController();
