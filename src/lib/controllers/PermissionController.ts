import { ApiResponse } from '@/types/api';
import { PermissionModel, PermissionSelect, PermissionInsert } from '../models/PermissionModel';
import { ModelController } from './ModelController';
import { generatePermissionSlug, isValidSlug, generatePermissionDescription } from '../types/permission';
import { createPermissionSchema, updatePermissionSchema } from '../validations/permission-schemas';

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
    const validation = createPermissionSchema.safeParse(data);
    if (!validation.success) {
      return {
        success: false,
        error: validation.error.issues.map(issue => issue.message).join(', ')
      };
    }
    return null;
  }

  protected validateUpdateData(data: Partial<PermissionInsert>): ApiResponse<any> | null {
    const validation = updatePermissionSchema.safeParse(data);
    if (!validation.success) {
      return {
        success: false,
        error: validation.error.issues.map(issue => issue.message).join(', ')
      };
    }
    return null;
  }

  protected beforeCreate(data: PermissionInsert): PermissionInsert {
    return {
      ...data,
      slug: data.slug || generatePermissionSlug(data.resource, data.action),
      description: data.description || generatePermissionDescription(data.resource, data.action)
    };
  }

  protected beforeUpdate(id: number, data: Partial<PermissionInsert>): Partial<PermissionInsert> {
    const processedData = { ...data };
    if ((processedData.resource || processedData.action) && !processedData.slug) {
      if (processedData.resource && processedData.action) {
        processedData.slug = generatePermissionSlug(processedData.resource, processedData.action);
      }
    }
    return processedData;
  }

  protected async canDelete(id: number): Promise<{ allowed: boolean; reason?: string }> {
    return { allowed: true };
  }

  // Helper methods moved to centralized helpers in types/permission.ts

  // Override success messages
  protected getCreateSuccessMessage() { return 'Permission created successfully'; }
  protected getUpdateSuccessMessage() { return 'Permission updated successfully'; }
  protected getDeleteSuccessMessage() { return 'Permission deleted successfully'; }
}

export const permissionController = new PermissionController();
