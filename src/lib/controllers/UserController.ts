import { ApiResponse } from './BaseController';
import { User, NewUser } from '../db/schemas/users';
import { userService } from '../services/UserService';
import { authenticationService } from '../services/AuthenticationService';
import type { LoginResponse as AuthLoginResponse, RegisterData } from '../services/AuthenticationService';

export interface LoginResponse {
  user: User;
  token: string;
}

/**
 * UserController - Pure service-based controller
 * Delegates all operations to services for clean separation
 */
export class UserController {
  /**
   * User login
   */
  async login(email: string, password: string): Promise<ApiResponse<LoginResponse>> {
    const result = await authenticationService.login(email, password);
    
    // Convert SafeUser back to User for compatibility
    if (result.success && result.data) {
      return {
        ...result,
        data: {
          user: result.data.user as User,
          token: result.data.token
        }
      };
    }
    
    return result as ApiResponse<LoginResponse>;
  }

  /**
   * User registration
   */
  async register(userData: RegisterData): Promise<ApiResponse<LoginResponse>> {
    const result = await authenticationService.register(userData);
    
    // Convert SafeUser back to User for compatibility
    if (result.success && result.data) {
      return {
        ...result,
        data: {
          user: result.data.user as User,
          token: result.data.token
        }
      };
    }
    
    return result as ApiResponse<LoginResponse>;
  }

  /**
   * Get all users with pagination and filtering
   */
  async getAll(params?: {
    page?: number;
    limit?: number;
    query?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
    isActive?: boolean;
    isVerified?: boolean;
    includeRoles?: boolean;
  }): Promise<ApiResponse<User[]>> {
    try {
      const result = await userService.findManyLegacy({
        page: params?.page || 1,
        limit: params?.limit || 10,
        query: params?.query,
        sortBy: params?.sortBy,
        sortOrder: params?.sortOrder,
        isActive: params?.isActive,
        isVerified: params?.isVerified
      });

      let users = result.users;

      // Include roles if requested
      if (params?.includeRoles && users.length > 0) {
        users = await userService.includeRoles(users);
      }

      return {
        success: true,
        data: users,
        pagination: result.pagination
      };
    } catch (error) {
      console.error('Get all users error:', error);
      return {
        success: false,
        error: 'Failed to get users'
      };
    }
  }

  /**
   * Get user by ID
   */
  async getById(id: number): Promise<ApiResponse<User>> {
    try {
      const user = await userService.findById(id);

      if (!user) {
        return {
          success: false,
          error: 'User not found'
        };
      }

      return {
        success: true,
        data: user
      };
    } catch (error) {
      console.error('Get user by ID error:', error);
      return {
        success: false,
        error: 'Failed to get user'
      };
    }
  }

  /**
   * Get user by email
   */
  async getByEmail(email: string): Promise<ApiResponse<User>> {
    try {
      const user = await userService.findByEmail(email);

      if (!user) {
        return {
          success: false,
          error: 'User not found'
        };
      }

      return {
        success: true,
        data: user
      };
    } catch (error) {
      console.error('Get by email error:', error);
      return {
        success: false,
        error: 'Failed to get user'
      };
    }
  }

  /**
   * Get user by code
   */
  async getByCode(code: string): Promise<ApiResponse<User>> {
    try {
      const user = await userService.findByCode(code);

      if (!user) {
        return {
          success: false,
          error: 'User not found'
        };
      }

      return {
        success: true,
        data: user
      };
    } catch (error) {
      console.error('Get by code error:', error);
      return {
        success: false,
        error: 'Failed to get user'
      };
    }
  }

  /**
   * Create new user
   */
  async create(data: NewUser): Promise<ApiResponse<User>> {
    try {
      // Convert NewUser to RegisterData format
      const userData: RegisterData = {
        email: data.email || '',
        password: data.passwordHash || '',
        passwordConfirmation: data.passwordHash || '',
        name: data.name || '',
        code: data.code || ''
      };

      const result = await this.register(userData);
      
      if (result.success && result.data) {
        return {
          success: true,
          data: result.data.user,
          message: 'User created successfully'
        };
      }

      return {
        success: false,
        error: result.error || 'Failed to create user'
      };
    } catch (error) {
      console.error('Create user error:', error);
      return {
        success: false,
        error: 'Failed to create user'
      };
    }
  }

  /**
   * Update user
   */
  async update(id: number, data: Partial<NewUser>): Promise<ApiResponse<User>> {
    try {
      const user = await userService.update(id, data);

      if (!user) {
        return {
          success: false,
          error: 'User not found'
        };
      }

      return {
        success: true,
        data: user,
        message: 'User updated successfully'
      };
    } catch (error) {
      console.error('Update user error:', error);
      return {
        success: false,
        error: 'Failed to update user'
      };
    }
  }

  /**
   * Delete user (soft delete)
   */
  async delete(id: number): Promise<ApiResponse<boolean>> {
    try {
      const result = await this.updateStatus(id, false);
      
      if (result.success) {
        return {
          success: true,
          data: true,
          message: 'User deleted successfully'
        };
      }

      return {
        success: false,
        error: result.error || 'Failed to delete user'
      };
    } catch (error) {
      console.error('Delete user error:', error);
      return {
        success: false,
        error: 'Failed to delete user'
      };
    }
  }

  /**
   * Update user password
   */
  async updatePassword(id: number, newPassword: string, passwordConfirmation: string): Promise<ApiResponse<User>> {
    const result = await authenticationService.updatePassword(id, newPassword, passwordConfirmation);
    
    if (result.success && result.data) {
      return {
        ...result,
        data: result.data as User
      };
    }
    
    return result as ApiResponse<User>;
  }

  /**
   * Update user status
   */
  async updateStatus(id: number, isActive: boolean): Promise<ApiResponse<User>> {
    try {
      const user = await userService.update(id, { isActive });

      if (!user) {
        return {
          success: false,
          error: 'User not found'
        };
      }

      return {
        success: true,
        data: user,
        message: `User ${isActive ? 'activated' : 'deactivated'} successfully`
      };
    } catch (error) {
      console.error('Update status error:', error);
      return {
        success: false,
        error: 'Failed to update user status'
      };
    }
  }

  /**
   * Bulk update user status
   */
  async bulkUpdateStatus(ids: number[], isActive: boolean): Promise<ApiResponse<boolean>> {
    try {
      await userService.bulkUpdateStatus(ids, isActive);

      return {
        success: true,
        data: true,
        message: `${ids.length} users ${isActive ? 'activated' : 'deactivated'} successfully`
      };
    } catch (error) {
      console.error('Bulk update status error:', error);
      return {
        success: false,
        error: 'Failed to bulk update user status'
      };
    }
  }

  /**
   * Verify user email
   */
  async verifyEmail(userId: number): Promise<ApiResponse<User>> {
    const result = await authenticationService.verifyEmail(userId);
    
    if (result.success && result.data) {
      return {
        ...result,
        data: result.data as User
      };
    }
    
    return result as ApiResponse<User>;
  }

  /**
   * Search users
   */
  async searchUsers(query: string, limit: number = 10): Promise<ApiResponse<User[]>> {
    try {
      const results = await userService.search(query, limit);

      return {
        success: true,
        data: results,
        message: 'Users found successfully'
      };
    } catch (error) {
      console.error('Search users error:', error);
      return {
        success: false,
        error: 'Failed to search users'
      };
    }
  }

  /**
   * Get current user with roles
   */
  async getCurrentUser(userId: number): Promise<ApiResponse<User>> {
    try {
      const result = await this.getById(userId);
      if (!result.success) {
        console.error('Failed to get user by ID:', result.error);
        return result;
      }

      try {
        const userWithRoles = await userService.includeRoles([result.data!]);
        
        return {
          success: true,
          data: userWithRoles[0] || result.data!,
          message: 'Current user retrieved successfully'
        };
      } catch (roleError) {
        return {
          success: true,
          data: result.data!,
          message: 'Current user retrieved successfully (without roles)'
        };
      }
    } catch (error) {
      console.error('Get current user error:', error);
      return {
        success: false,
        error: 'Failed to get current user'
      };
    }
  }

  // Role management methods - keeping these simple for now
  // These could be moved to a separate RoleController later

  /**
   * Check if user has permission
   */
  async hasPermission(userId: number, permissionSlug: string): Promise<boolean> {
    try {
      // This should ideally be in a service too, but keeping simple for now
      const user = await userService.findById(userId);
      if (!user) return false;

      const userWithRoles = await userService.includeRoles([user]);
      const userPermissions = userWithRoles[0]?.permissions || [];
      
      return userPermissions.some((permission: any) => permission.slug === permissionSlug);
    } catch (error) {
      console.error('Check permission error:', error);
      return false;
    }
  }
}

export const userController = new UserController();
