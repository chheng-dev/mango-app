import { ApiResponse } from '@/types/api';
import { PermissionInsert, PermissionModel, PermissionSelect } from '../models/PermissionModel';
import { createPermissionSchema, updatePermissionSchema } from '../validations/permission-schemas';
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
    return this.convertResponse<PermissionSelect[]>(result as any);
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

  protected async canDelete(id: number): Promise<{ allowed: boolean; reason?: string }> {
    return { allowed: true };
  }

  protected getCreateSuccessMessage() { return 'Permission created successfully'; }
  protected getUpdateSuccessMessage() { return 'Permission updated successfully'; }
  protected getDeleteSuccessMessage() { return 'Permission deleted successfully'; }
}

export const permissionController = new PermissionController();
