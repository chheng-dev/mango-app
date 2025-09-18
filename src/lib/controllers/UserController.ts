import { ApiResponse } from './BaseController';
import { User, NewUser } from '../db/schemas/users';
import { userService } from '../services/UserService';
import { PasswordService } from '../services/passwordService';
import { jwtService } from '../auth/jwt';

export interface LoginResponse {
  user: User;
  token: string;
}

export interface RegisterData {
  email: string;
  password: string;
  passwordConfirmation: string;
  name: string;
  code?: string;
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
    try {
      // Find user by email
      const userResult = await userService.findByEmail(email);
      if (!userResult.success || !userResult.data) {
        return {
          success: false,
          error: 'Invalid credentials'
        };
      }

      const user = userResult.data;

      // Check if user is active
      if (!user.isActive) {
        return {
          success: false,
          error: 'Account is deactivated'
        };
      }

      // Verify password
      const isValidPassword = await PasswordService.compare(password, user.passwordHash);
      if (!isValidPassword) {
        return {
          success: false,
          error: 'Invalid credentials'
        };
      }

      // Generate JWT token
      const token = jwtService.generateAccessToken({
        userId: user.id,
        email: user.email,
        code: user.code,
        isVerified: user.isVerified || false,
      });

      return {
        success: true,
        data: {
          user,
          token
        },
        message: 'Login successful'
      };
    } catch (error) {
      console.error('Login error:', error);
      return {
        success: false,
        error: 'Login failed'
      };
    }
  }

  /**
   * User registration
   */
  async register(userData: RegisterData): Promise<ApiResponse<LoginResponse>> {
    try {
      // Validate password confirmation
      if (userData.password !== userData.passwordConfirmation) {
        return {
          success: false,
          error: 'Password confirmation does not match'
        };
      }

      // Check if user already exists
      const existingUserResult = await userService.findByEmail(userData.email);
      if (existingUserResult.success && existingUserResult.data) {
        return {
          success: false,
          error: 'Email already exists'
        };
      }

      // Hash password
      const hashedPassword = await PasswordService.hash(userData.password);

      // Create user data
      const newUserData: NewUser = {
        email: userData.email.toLowerCase(),
        name: userData.name,
        code: userData.code || `USER_${Date.now()}`,
        passwordHash: hashedPassword,
        passwordConfirmation: hashedPassword,
        isActive: true,
        isVerified: false,
      };

      // Create user
      const createUserResult = await userService.createUser(newUserData);
      if (!createUserResult.success || !createUserResult.data) {
        return {
          success: false,
          error: createUserResult.error || 'Failed to create user'
        };
      }

      const user = createUserResult.data;

      // Generate JWT token
      const token = jwtService.generateAccessToken({
        userId: user.id,
        email: user.email,
        code: user.code,
        isVerified: user.isVerified || false,
      });

      return {
        success: true,
        data: {
          user,
          token
        },
        message: 'Registration successful'
      };
    } catch (error) {
      console.error('Registration error:', error);
      return {
        success: false,
        error: 'Registration failed'
      };
    }
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

      if (!result.success || !result.data) {
        return {
          success: false,
          error: result.error || 'Failed to get users'
        };
      }

      let users = result.data.users;

      // Include roles if requested
      if (params?.includeRoles && users.length > 0) {
        // Use getUserWithRoles for each user
        const usersWithRoles = await Promise.all(
          users.map(async (user) => {
            const userWithRolesResult = await userService.getUserWithRoles(user.id);
            return userWithRolesResult.success && userWithRolesResult.data ? 
              userWithRolesResult.data : user;
          })
        );
        users = usersWithRoles as User[];
      }

      return {
        success: true,
        data: users,
        pagination: result.data.pagination
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
      const result = await userService.getById(id);

      if (!result.success || !result.data) {
        return {
          success: false,
          error: result.error || 'User not found'
        };
      }

      return {
        success: true,
        data: result.data
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
      const result = await userService.findByEmail(email);

      if (!result.success || !result.data) {
        return {
          success: false,
          error: result.error || 'User not found'
        };
      }

      return {
        success: true,
        data: result.data
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
      const result = await userService.findByCode(code);

      if (!result.success || !result.data) {
        return {
          success: false,
          error: result.error || 'User not found'
        };
      }

      return {
        success: true,
        data: result.data
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
      const result = await userService.updateUser(id, data);

      if (!result.success || !result.data) {
        return {
          success: false,
          error: result.error || 'User not found'
        };
      }

      return {
        success: true,
        data: result.data,
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
    try {
      // Validate password confirmation
      if (newPassword !== passwordConfirmation) {
        return {
          success: false,
          error: 'Password confirmation does not match'
        };
      }

      // Validate password strength
      const validation = PasswordService.validateStrength(newPassword);
      if (!validation.isValid) {
        return {
          success: false,
          error: validation.errors.join(', ')
        };
      }

      // Hash new password
      const hashedPassword = await PasswordService.hash(newPassword);

      // Update user password
      const result = await userService.updateUser(id, {
        passwordHash: hashedPassword,
        passwordConfirmation: hashedPassword
      });

      if (!result.success || !result.data) {
        return {
          success: false,
          error: result.error || 'User not found'
        };
      }

      return {
        success: true,
        data: result.data,
        message: 'Password updated successfully'
      };
    } catch (error) {
      console.error('Update password error:', error);
      return {
        success: false,
        error: 'Failed to update password'
      };
    }
  }

  /**
   * Update user status
   */
  async updateStatus(id: number, isActive: boolean): Promise<ApiResponse<User>> {
    try {
      const result = await userService.updateUser(id, { isActive });

      if (!result.success || !result.data) {
        return {
          success: false,
          error: result.error || 'User not found'
        };
      }

      return {
        success: true,
        data: result.data,
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
      const result = await userService.bulkUpdateStatus(ids, isActive);

      if (!result.success) {
        return {
          success: false,
          error: result.error || 'Failed to bulk update user status'
        };
      }

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
    try {
      const result = await userService.updateUser(userId, { isVerified: true });

      if (!result.success || !result.data) {
        return {
          success: false,
          error: result.error || 'User not found'
        };
      }

      return {
        success: true,
        data: result.data,
        message: 'Email verified successfully'
      };
    } catch (error) {
      console.error('Verify email error:', error);
      return {
        success: false,
        error: 'Failed to verify email'
      };
    }
  }

  /**
   * Search users
   */
  async searchUsers(query: string, limit: number = 10): Promise<ApiResponse<User[]>> {
    try {
      const result = await userService.searchUsers(query, { 
        limit,
        includeInactive: false,
        includeRoles: false
      });

      if (!result.success) {
        return {
          success: false,
          error: result.error || 'Failed to search users'
        };
      }

      return {
        success: true,
        data: result.data || [],
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
        // Try to get user with roles using getUserWithRoles
        const userWithRolesResult = await userService.getUserWithRoles(userId);
        
        if (userWithRolesResult.success && userWithRolesResult.data) {
          return {
            success: true,
            data: userWithRolesResult.data as User,
            message: 'Current user retrieved successfully'
          };
        }

        // If roles failed, return user without roles
        return {
          success: true,
          data: result.data!,
          message: 'Current user retrieved successfully (without roles)'
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

  async hasPermission(userId: number, permissionSlug: string): Promise<boolean> {
    try {
      const userResult = await userService.getUserWithRoles(userId);
      if (!userResult.success || !userResult.data) return false;

      const userPermissions = userResult.data.permissions || [];
      
      return userPermissions.some((permission: any) => permission.slug === permissionSlug);
    } catch (error) {
      console.error('Check permission error:', error);
      return false;
    }
  }
}

export const userController = new UserController();
