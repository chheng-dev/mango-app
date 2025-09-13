import { BaseService, ServiceResponse, BusinessRuleResult } from './BaseService';
import { UserModel, UserSelect, UserInsert, UserWithRoles } from '../models/UserModel';
import { ValidationError } from '../models/BaseModel';

/**
 * UserService - Business Logic Layer for Users
 * 
 * RESPONSIBILITIES:
 * - User business logic and validation
 * - Email/code uniqueness rules
 * - Password policies
 * - User role management
 * - Account status management
 */
export class UserService extends BaseService<UserModel, UserSelect, UserInsert> {
  
  constructor() {
    const userModel = new UserModel();
    super(userModel, 'UserService');
  }

  // ==================== VALIDATION METHODS ====================

  protected validateData(data: Partial<UserInsert>, isUpdate = false): ValidationError[] {
    const errors: ValidationError[] = [];

    // Required field validation for create
    if (!isUpdate) {
      errors.push(...this.validateRequired(data, ['name', 'email', 'code']));
    }

    // Email validation
    if (data.email) {
      if (!this.validateEmail(data.email)) {
        errors.push({
          field: 'email',
          message: 'Invalid email format'
        });
      }
    }

    // Name validation
    if (data.name) {
      if (data.name.trim().length < 2) {
        errors.push({
          field: 'name',
          message: 'Name must be at least 2 characters long'
        });
      }

      if (data.name.trim().length > 200) {
        errors.push({
          field: 'name',
          message: 'Name cannot exceed 200 characters'
        });
      }
    }

    // Code validation
    if (data.code) {
      if (data.code.trim().length < 3) {
        errors.push({
          field: 'code',
          message: 'Code must be at least 3 characters long'
        });
      }

      if (data.code.trim().length > 100) {
        errors.push({
          field: 'code',
          message: 'Code cannot exceed 100 characters'
        });
      }

      // Code format validation (alphanumeric only)
      if (!/^[A-Z0-9]+$/.test(data.code.toUpperCase())) {
        errors.push({
          field: 'code',
          message: 'Code can only contain letters and numbers'
        });
      }
    }

    // Phone number validation
    if (data.phoneNumber) {
      if (data.phoneNumber.length > 20) {
        errors.push({
          field: 'phoneNumber',
          message: 'Phone number cannot exceed 20 characters'
        });
      }
    }

    return errors;
  }

  protected async validateBusinessRules(data: Partial<UserInsert>, existingData?: UserSelect): Promise<BusinessRuleResult> {
    try {
      // Check for duplicate email
      if (data.email) {
        const excludeId = existingData?.id;
        const emailExists = await this.model.emailExists(data.email, excludeId);
        
        if (emailExists) {
          return {
            valid: false,
            message: 'A user with this email already exists'
          };
        }
      }

      // Check for duplicate code
      if (data.code) {
        const excludeId = existingData?.id;
        const codeExists = await this.model.codeExists(data.code, excludeId);
        
        if (codeExists) {
          return {
            valid: false,
            message: 'A user with this code already exists'
          };
        }
      }

      return { valid: true };
    } catch (error) {
      console.error('UserService business rule validation error:', error);
      return {
        valid: false,
        message: 'Failed to validate business rules'
      };
    }
  }

  // ==================== BUSINESS LOGIC METHODS ====================

  /**
   * Create user with validation and auto-generated fields
   */
  async createUser(data: UserInsert): Promise<ServiceResponse<UserSelect>> {
    return this.create(data);
  }

  /**
   * Update user with business rules
   */
  async updateUser(id: number, data: Partial<UserInsert>): Promise<ServiceResponse<UserSelect>> {
    return this.update(id, data);
  }

  /**
   * Find user by email with business logic
   */
  async findByEmail(email: string): Promise<ServiceResponse<UserSelect>> {
    try {
      if (!email || !this.validateEmail(email)) {
        return {
          success: false,
          error: 'Invalid email format'
        };
      }

      const result = await this.model.findByEmail(email);
      
      if (!result.success) {
        return {
          success: false,
          error: 'User not found'
        };
      }

      return {
        success: true,
        data: result.data
      };

    } catch (error) {
      console.error('UserService findByEmail error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to find user by email'
      };
    }
  }

  /**
   * Find user by code with business logic
   */
  async findByCode(code: string): Promise<ServiceResponse<UserSelect>> {
    try {
      if (!code || code.trim().length < 3) {
        return {
          success: false,
          error: 'Invalid code format'
        };
      }

      const result = await this.model.findByCode(code);
      
      if (!result.success) {
        return {
          success: false,
          error: 'User not found'
        };
      }

      return {
        success: true,
        data: result.data
      };

    } catch (error) {
      console.error('UserService findByCode error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to find user by code'
      };
    }
  }

  /**
   * Get user with roles and permissions
   */
  async getUserWithRoles(userId: number): Promise<ServiceResponse<UserWithRoles>> {
    try {
      const result = await this.model.findWithRoles(userId);
      
      if (!result.success) {
        return {
          success: false,
          error: result.error
        };
      }

      return {
        success: true,
        data: result.data as UserWithRoles
      };

    } catch (error) {
      console.error('UserService getUserWithRoles error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get user with roles'
      };
    }
  }

  /**
   * Get users with legacy format for backward compatibility
   */
  async findManyLegacy(params: {
    page: number;
    limit: number;
    query?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
    isActive?: boolean;
    isVerified?: boolean;
  }): Promise<ServiceResponse<{ users: UserSelect[]; pagination: any }>> {
    try {
      const filters: any = {};
      if (params.isActive !== undefined) filters.isActive = params.isActive;
      if (params.isVerified !== undefined) filters.isVerified = params.isVerified;

      const result = await this.getAll({
        page: params.page,
        limit: params.limit,
        query: params.query,
        sortBy: params.sortBy,
        sortOrder: params.sortOrder,
        filters
      });

      if (!result.success) {
        return {
          success: false,
          error: result.error || 'Failed to fetch users'
        };
      }

      // Return in the expected legacy format
      return {
        success: true,
        data: {
          users: result.data || [],
          pagination: result.pagination
        }
      };

    } catch (error) {
      console.error('UserService findManyLegacy error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch users'
      };
    }
  }

  /**
   * Bulk update user status with validation
   */
  async bulkUpdateStatus(ids: number[], isActive: boolean): Promise<ServiceResponse<boolean>> {
    try {
      if (!ids || ids.length === 0) {
        return {
          success: false,
          error: 'No user IDs provided'
        };
      }

      // Validate all IDs exist
      for (const id of ids) {
        const exists = await this.model.exists(id);
        if (!exists) {
          return {
            success: false,
            error: `User with ID ${id} not found`
          };
        }
      }

      // Use model's bulk update method
      const result = await this.model.bulkUpdate(ids, { isActive, updatedAt: new Date() });
      
      if (!result.success) {
        return {
          success: false,
          error: result.error || 'Failed to update users'
        };
      }

      this.logOperation('bulkUpdateStatus', { ids, isActive });

      return {
        success: true,
        data: true,
        message: `Successfully updated ${ids.length} users`
      };

    } catch (error) {
      console.error('UserService bulkUpdateStatus error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to update user status'
      };
    }
  }

  /**
   * Update user password with validation
   */
  async updatePassword(userId: number, newPassword: string): Promise<ServiceResponse<UserSelect>> {
    try {
      // Validate password strength (basic example)
      if (!newPassword || newPassword.length < 8) {
        return {
          success: false,
          error: 'Password must be at least 8 characters long'
        };
      }

      // In a real app, you'd hash the password here
      // const hashedPassword = await bcrypt.hash(newPassword, 10);
      const hashedPassword = newPassword; // Simplified for demo

      const result = await this.model.updatePassword(userId, hashedPassword);
      
      if (!result.success) {
        return result;
      }

      this.logOperation('passwordUpdated', { userId });

      return {
        success: true,
        data: result.data,
        message: 'Password updated successfully'
      };

    } catch (error) {
      console.error('UserService updatePassword error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to update password'
      };
    }
  }

  // ==================== LIFECYCLE HOOKS ====================

  protected async beforeCreate(data: UserInsert): Promise<UserInsert> {
    // Normalize email to lowercase
    if (data.email) {
      data.email = data.email.toLowerCase().trim();
    }

    // Normalize code to uppercase
    if (data.code) {
      data.code = data.code.toUpperCase().trim();
    }

    // Trim name
    if (data.name) {
      data.name = data.name.trim();
    }

    return data;
  }

  protected async beforeUpdate(data: Partial<UserInsert>, existingData: UserSelect): Promise<Partial<UserInsert>> {
    // Normalize email to lowercase
    if (data.email) {
      data.email = data.email.toLowerCase().trim();
    }

    // Normalize code to uppercase
    if (data.code) {
      data.code = data.code.toUpperCase().trim();
    }

    // Trim name
    if (data.name) {
      data.name = data.name.trim();
    }

    return data;
  }

  protected async canDelete(data: UserSelect): Promise<BusinessRuleResult> {
    try {
      // Check if user has active roles
      const userWithRoles = await this.model.findWithRoles(data.id);
      
      if (userWithRoles.success && userWithRoles.data) {
        const userRolesData = userWithRoles.data as UserWithRoles;
        if (userRolesData.roles && userRolesData.roles.length > 0) {
          return {
            valid: false,
            message: `Cannot delete user with ${userRolesData.roles.length} active roles. Remove roles first.`
          };
        }
      }

      return { valid: true };
    } catch (error) {
      console.error('UserService canDelete error:', error);
      return {
        valid: false,
        message: 'Unable to verify if user can be deleted'
      };
    }
  }

  protected async afterDelete(data: UserSelect): Promise<void> {
    this.logOperation('userDeleted', { userId: data.id, userEmail: data.email });
  }

  // ==================== UTILITY METHODS ====================

  /**
   * Search users with enhanced business logic
   */
  async searchUsers(query: string, options: {
    limit?: number;
    includeInactive?: boolean;
    includeRoles?: boolean;
  } = {}): Promise<ServiceResponse<UserSelect[] | UserWithRoles[]>> {
    try {
      const { limit = 10, includeInactive = false, includeRoles = false } = options;

      if (!query || query.trim().length < 2) {
        return {
          success: false,
          error: 'Search query must be at least 2 characters long'
        };
      }

      const filters: any = {};
      if (!includeInactive) {
        filters.isActive = true;
      }

      const result = await this.getAll({
        query: query.trim(),
        limit,
        page: 1,
        filters
      });

      if (!result.success || !result.data) {
        return result;
      }

      // Include roles if requested
      if (includeRoles) {
        const userIds = result.data.map(user => user.id);
        const usersWithRoles = await this.model.findManyWithRoles(userIds);
        
        if (usersWithRoles.success) {
          return {
            success: true,
            data: usersWithRoles.data
          };
        }
      }

      return {
        success: true,
        data: result.data
      };

    } catch (error) {
      console.error('UserService searchUsers error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to search users'
      };
    }
  }
}

export const userService = new UserService();
