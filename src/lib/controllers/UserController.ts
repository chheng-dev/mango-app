import { ApiResponse } from '@/types/api';
import { UserModel, UserSelect, UserInsert } from '../models/UserModel';
import { ModelController } from './ModelController';
import { PasswordService } from '../services/passwordService';

export interface UserCreateInput extends Omit<UserInsert, 'passwordHash' | 'passwordConfirmation'> {
  password?: string;
  passwordHash?: string;
  passwordConfirmation?: string;
}

export interface UserUpdateInput extends Partial<UserCreateInput> {
  roles?: number[];
}

export class UserController extends ModelController<UserSelect, UserInsert, UserModel> {
  constructor() {
    super(new UserModel());
  }

  async getAll(options?: { page?: number; limit?: number; query?: string; sortBy?: string; sortOrder?: 'asc' | 'desc'; filters?: Record<string, string | number | boolean>; isSuperAdmin?: boolean }) {
    const result = await this.model.list({ isSuperAdmin: options?.isSuperAdmin });
    return this.convertResponse<UserSelect[]>(result as any);
  }

  async getWithRoles(userId: number) {
    const result = await this.model.findByIdWithRoleId(userId);
    return this.convertResponse<UserSelect & { roleId?: number; roles?: number[] }>(result as any);
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

  async createWithPassword(data: UserCreateInput): Promise<ApiResponse<UserSelect>> {
    return this.create(data as UserInsert);
  }

  async updatePassword(id: number, newPassword: string): Promise<ApiResponse<UserSelect>> {
    const validation = PasswordService.validateStrength(newPassword);
    if (!validation.isValid) {
      return {
        success: false,
        error: validation.errors.join(', ')
      };
    }

    return this.update(id, { password: newPassword });
  }

  async bulkUpdateStatus(userIds: number[], isActive: boolean): Promise<ApiResponse<boolean>> {
    const result = await this.model.bulkUpdate(userIds, { isActive });
    return this.convertResponse<boolean>(result);
  }

  async getUserPermissions(userId: number): Promise<string[]> {
    return await this.model.getUserPermissions(userId);
  }

  async getUserRoles(userId: number): Promise<string[]> {
    return await this.model.getUserRoles(userId);
  }

  async isSuperAdmin(userId: number): Promise<boolean> {
    return await this.model.isSuperAdmin(userId);
  }

  protected validateCreateData(data: UserInsert): ApiResponse<any> | null {
    const hasPassword = 'password' in data && data.password;
    const hasPasswordHash = data.passwordHash;
    
    if (!hasPassword && !hasPasswordHash) {
      return {
        success: false,
        error: 'Password or passwordHash is required'
      };
    }

    const requiredFields = ['email', 'name'];
    const errors = this.validateRequiredFields(data, requiredFields);
    if (errors.length) {
      return { 
        success: false, 
        error: errors.map(e => e.message).join(', ') 
      };
    }

    // Validate email format
    const emailValidation = this.validateEmail(data.email);
    if (emailValidation) {
      return emailValidation;
    }

    if (hasPassword) {
      const passwordValidation = PasswordService.validateStrength(data.password as string);
      if (!passwordValidation.isValid) {
        return {
          success: false,
          error: passwordValidation.errors.join(', ')
        };
      }
    }

    return null;
  }

  protected validateUpdateData(data: Partial<UserInsert>): ApiResponse<any> | null {
    // Validate email if provided
    if (data.email) {
      const emailValidation = this.validateEmail(data.email);
      if (emailValidation) {
        return emailValidation;
      }
    }

    // Validate password if provided (plain text)
    if ('password' in data && data.password) {
      const passwordValidation = PasswordService.validateStrength(data.password as string);
      if (!passwordValidation.isValid) {
        return {
          success: false,
          error: passwordValidation.errors.join(', ')
        };
      }
    }

    return null;
  }

  private validateEmail(email: string): ApiResponse<any> | null {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email) ? null : { 
      success: false, 
      error: 'Invalid email format' 
    };
  }

  protected async beforeCreate(data: UserInsert): Promise<UserInsert> {
    const processedData = { 
      ...data,
      email: data.email.toLowerCase(),
      code: data.code || `USER_${Date.now()}`,
      isActive: data.isActive ?? true,
      isVerified: data.isVerified ?? false,
    };

    // Hash password if provided (for cases where password is provided instead of passwordHash)
    if ('password' in data && data.password) {
      processedData.passwordHash = await PasswordService.hash(data.password as string);
      processedData.passwordConfirmation = processedData.passwordHash;
      // Remove the plain password from the data
      delete (processedData as any).password;
    }
    // If passwordHash is provided directly, also set passwordConfirmation
    else if (processedData.passwordHash && !processedData.passwordConfirmation) {
      processedData.passwordConfirmation = processedData.passwordHash;
    }

    return processedData;
  }

  protected async beforeUpdate(id: number, data: Partial<UserInsert>): Promise<Partial<UserInsert>> {
    const processedData = { ...data };
    
    if (processedData.email) {
      processedData.email = processedData.email.toLowerCase();
    }

    // Hash password if provided (for cases where password is provided instead of passwordHash)
    if ('password' in data && data.password) {
      processedData.passwordHash = await PasswordService.hash(data.password as string);
      processedData.passwordConfirmation = processedData.passwordHash;
      // Remove the plain password from the data
      delete (processedData as any).password;
    }
    // If passwordHash is provided directly, also update passwordConfirmation
    else if (processedData.passwordHash && !processedData.passwordConfirmation) {
      processedData.passwordConfirmation = processedData.passwordHash;
    }

    return processedData;
  }

  protected canDelete(id: number): { allowed: boolean; reason?: string } {
    return { allowed: true };
  }

  async update(id: number, data: UserUpdateInput): Promise<ApiResponse<UserSelect>> {
    try {
      const { roles, ...userData } = data;
      
      const userResult = await super.update(id, userData);
      if (!userResult.success) {
        return userResult;
      }

      if (roles !== undefined) {
        const roleResult = await this.model.updateUserRoles(id, roles);
        if (!roleResult.success) {
          console.error('Failed to update user roles:', roleResult.error);
        }
      }

      return await this.getWithRoles(id);
    } catch (error) {
      console.error('UserController update error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to update user'
      };
    }
  }

}

export const userController = new UserController();
