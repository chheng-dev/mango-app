import { ApiResponse } from '@/types/api';
import { UserModel, UserSelect, UserInsert } from '../models/UserModel';
import { ModelController } from './ModelController';

export class UserController extends ModelController<UserSelect, UserInsert, UserModel> {
  constructor() {
    super(new UserModel());
  }

  async getByEmail(email: string): Promise<ApiResponse<UserSelect>> {
    const result = await this.model.findByEmail(email);
    return this.convertResponse<UserSelect>(result);
  }

  async getByCode(code: string): Promise<ApiResponse<UserSelect>> {
    const result = await this.model.findByCode(code);
    return this.convertResponse<UserSelect>(result);
  }

  async getCurrentUser(id: number): Promise<ApiResponse<UserSelect>> {
    const result = await this.model.getCurrentUser(id);
    return this.convertResponse<UserSelect>(result);
  }

  async updateStatus(id: number, isActive: boolean): Promise<ApiResponse<UserSelect>> {
    return this.update(id, { isActive });
  }

  async bulkUpdateStatus(userIds: number[], isActive: boolean): Promise<ApiResponse<boolean>> {
    const result = await this.model.bulkUpdate(userIds, { isActive });
    return this.convertResponse<boolean>(result);
  }

  protected validateCreateData(data: UserInsert): ApiResponse<any> | null {
    const errors = this.validateRequiredFields(data, ['email', 'name', 'passwordHash']);
    if (errors.length) {
      return { 
        success: false, 
        error: errors.map(e => e.message).join(', ') 
      };
    }
    return this.validateEmail(data.email);
  }

  protected validateUpdateData(data: Partial<UserInsert>): ApiResponse<any> | null {
    return data.email ? this.validateEmail(data.email) : null;
  }

  private validateEmail(email: string): ApiResponse<any> | null {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email) ? null : { 
      success: false, 
      error: 'Invalid email format' 
    };
  }

  protected beforeCreate(data: UserInsert): UserInsert {
    return { 
      ...data,
      email: data.email.toLowerCase(),
      code: data.code || `USER_${Date.now()}`,
      isActive: data.isActive ?? true,
      isVerified: data.isVerified ?? false
    };
  }

  protected beforeUpdate(id: number, data: Partial<UserInsert>): Partial<UserInsert> {
    const processedData = { ...data };
    if (processedData.email) {
      processedData.email = processedData.email.toLowerCase();
    }
    return processedData;
  }

  protected canDelete(id: number): { allowed: boolean; reason?: string } {
    return { allowed: true };
  }


}

export const userController = new UserController();
