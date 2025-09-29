import { ApiResponse } from '@/types/api';
import { PermissionModel, PermissionSelect, PermissionInsert } from '../models/PermissionModel';
import { ModelController } from './ModelController';

export class PermissionController extends ModelController<PermissionSelect, PermissionInsert, PermissionModel> {
  
  constructor() {
    super(new PermissionModel());
  }

  async getPermissionBySlug(slug: string): Promise<ApiResponse<PermissionSelect>> {
    const result = await this.model.findByField('slug', slug);
    return this.convertResponse<PermissionSelect>(result);
  }

  async getPermissionsByResource(resource: string): Promise<ApiResponse<PermissionSelect[]>> {
    const result = await this.model.getPermissionsByResource(resource);
    return this.convertResponse<PermissionSelect[]>(result);
  }

  async getPermissionsGroupedByResource(): Promise<ApiResponse<Record<string, PermissionSelect[]>>> {
    const result = await this.model.getPermissionsGroupedByResource();
    return this.convertResponse<Record<string, PermissionSelect[]>>(result);
  }

  protected validateCreateData(data: PermissionInsert): ApiResponse<any> | null {
    const errors = this.validateRequiredFields(data, ['name', 'resource', 'action']);
    if (errors.length) return { success: false, error: errors.map(e => e.message).join(', ') };

    if (data.slug && !this.isValidSlug(data.slug)) {
      return { success: false, error: 'Slug can only contain lowercase letters, numbers, hyphens, and underscores' };
    }

    return null;
  }

  protected validateUpdateData(data: Partial<PermissionInsert>): ApiResponse<any> | null {
    if (data.name !== undefined) {
      const errors = this.validateRequiredFields({ name: data.name }, ['name']);
      if (errors.length) return { success: false, error: errors.map(e => e.message).join(', ') };
    }

    if (data.slug && !this.isValidSlug(data.slug)) {
      return { success: false, error: 'Slug can only contain lowercase letters, numbers, hyphens, and underscores' };
    }

    return null;
  }

  protected beforeCreate(data: PermissionInsert): PermissionInsert {
    return {
      ...data,
      slug: data.slug || this.generateSlug(`${data.resource}_${data.action}`),
      description: data.description || `${data.action} permissions for ${data.resource}`
    };
  }

  protected beforeUpdate(id: number, data: Partial<PermissionInsert>): Partial<PermissionInsert> {
    const processedData = { ...data };
    if ((processedData.resource || processedData.action) && !processedData.slug) {
      if (processedData.resource && processedData.action) {
        processedData.slug = this.generateSlug(`${processedData.resource}_${processedData.action}`);
      }
    }
    return processedData;
  }

  protected async canDelete(id: number): Promise<{ allowed: boolean; reason?: string }> {
    return { allowed: true };
  }

  // Helper methods
  private generateSlug(value: string): string {
    return value.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '');
  }

  private isValidSlug(slug: string): boolean {
    return /^[a-z0-9_-]+$/.test(slug);
  }

  // Override success messages
  protected getCreateSuccessMessage() { return 'Permission created successfully'; }
  protected getUpdateSuccessMessage() { return 'Permission updated successfully'; }
  protected getDeleteSuccessMessage() { return 'Permission deleted successfully'; }
}

export const permissionController = new PermissionController();
