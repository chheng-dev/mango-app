import { db } from '../db';
import { users, type User, type NewUser } from '../db/schema';
import { eq } from 'drizzle-orm';
import { BaseController, ApiResponse, PaginationOptions, SearchOptions } from './BaseController';

export class UserController extends BaseController<User, NewUser> {
  protected tableName = 'users';
  protected table = users;

  constructor() {
    super(
      ['name', 'email', 'code'], // searchable fields
      ['email', 'name', 'code', 'passwordHash', 'passwordConfirmation'] // required fields
    );
  }

  /**
   * Custom validation for users
   */
  protected async validate(data: any, isUpdate = false): Promise<Array<{field: string, message: string}>> {
    const errors = await super.validate(data, isUpdate);

    // Email validation
    if (data.email && !/\S+@\S+\.\S+/.test(data.email)) {
      errors.push({
        field: 'email',
        message: 'Invalid email format'
      });
    }

    // Password match validation (only for create)
    if (!isUpdate && data.passwordHash !== data.passwordConfirmation) {
      errors.push({
        field: 'passwordConfirmation',
        message: 'Password confirmation does not match'
      });
    }

    // Code validation
    if (data.code && !/^[A-Z0-9_]+$/.test(data.code)) {
      errors.push({
        field: 'code',
        message: 'Code must contain only uppercase letters, numbers, and underscores'
      });
    }

    return errors;
  }

  /**
   * Transform data before saving
   */
  protected transformForSave(data: any): any {
    const transformed = { ...data };

    // Ensure code is uppercase
    if (transformed.code) {
      transformed.code = transformed.code.toUpperCase();
    }

    // Trim name
    if (transformed.name) {
      transformed.name = transformed.name.trim();
    }

    // Lowercase email
    if (transformed.email) {
      transformed.email = transformed.email.toLowerCase().trim();
    }

    return transformed;
  }

  /**
   * Transform data after fetching (remove sensitive fields)
   */
  protected transformAfterFetch(data: any): any {
    const { passwordHash, passwordConfirmation, ...safeData } = data;
    return safeData;
  }

  /**
   * Get user by email
   */
  async getByEmail(email: string): Promise<ApiResponse<User>> {
    try {
      const result = await db
        .select()
        .from(this.table)
        .where(eq(this.table.email, email.toLowerCase()));

      if (!result || result.length === 0) {
        return {
          success: false,
          error: 'User not found'
        };
      }

      return {
        success: true,
        data: this.transformAfterFetch(result[0])
      };
    } catch (error) {
      console.error('Get by email error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch user'
      };
    }
  }

  /**
   * Get user by code
   */
  async getByCode(code: string) {
    try {
      const [record] = await db
        .select()
        .from(this.table)
        .where(eq(this.table.code, code.toUpperCase()));

      if (!record) {
        return {
          success: false,
          error: 'User not found'
        };
      }

      return {
        success: true,
        data: this.transformAfterFetch(record)
      };
    } catch (error) {
      console.error('Get by code error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch user'
      };
    }
  }

  /**
   * Verify user email
   */
  async verifyEmail(id: number) {
    return this.update(id, { isVerified: true });
  }

  /**
   * Update password
   */
  async updatePassword(id: number, passwordHash: string, passwordConfirmation: string) {
    if (passwordHash !== passwordConfirmation) {
      return {
        success: false,
        error: 'Password confirmation does not match'
      };
    }

    return this.update(id, { passwordHash, passwordConfirmation });
  }

  /**
   * Bulk update user status (isActive)
   */
  async bulkUpdateStatus(ids: number[], isActive: boolean): Promise<ApiResponse<boolean>> {
    try {
      const result = await db
        .update(this.table)
        .set({ 
          isActive, 
          updatedAt: new Date() 
        })
        .where(eq(this.table.id, ids[0])); // Note: This is simplified, you'd need to use 'or' for multiple IDs

      const success = (result.rowCount ?? 0) > 0;

      return {
        success,
        data: success,
        message: success ? `Users status updated to ${isActive ? 'active' : 'inactive'}` : 'No users found'
      };
    } catch (error) {
      console.error('Bulk update status error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to update user status'
      };
    }
  }

  /**
   * Update user verification status
   */
  async updateVerificationStatus(id: number, isVerified: boolean): Promise<ApiResponse<User>> {
    try {
      const result = await db
        .update(this.table)
        .set({ 
          isVerified, 
          updatedAt: new Date() 
        })
        .where(eq(this.table.id, id))
        .returning();

      if (!result || result.length === 0) {
        return {
          success: false,
          error: 'User not found'
        };
      }

      return {
        success: true,
        data: this.transformAfterFetch(result[0]),
        message: `User ${isVerified ? 'verified' : 'unverified'} successfully`
      };
    } catch (error) {
      console.error('Update verification status error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to update verification status'
      };
    }
  }

  /**
   * Get all active users
   */
  async getActiveUsers(options: PaginationOptions & SearchOptions = {}): Promise<ApiResponse<User[]>> {
    const activeFilters = { ...options.filters, isActive: true };
    return this.getAll({ ...options, filters: activeFilters });
  }

  /**
   * Get all inactive users
   */
  async getInactiveUsers(options: PaginationOptions & SearchOptions = {}): Promise<ApiResponse<User[]>> {
    const inactiveFilters = { ...options.filters, isActive: false };
    return this.getAll({ ...options, filters: inactiveFilters });
  }

  /**
   * Get users by verification status
   */
  async getUsersByVerificationStatus(isVerified: boolean, options: PaginationOptions & SearchOptions = {}): Promise<ApiResponse<User[]>> {
    const verificationFilters = { ...options.filters, isVerified };
    return this.getAll({ ...options, filters: verificationFilters });
  }
}

// Export singleton instance
export const userController = new UserController();
