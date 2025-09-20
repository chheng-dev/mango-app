import { BaseController, ApiResponse, ValidationError } from './BaseController';
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

interface UserCreateData {
  email: string;
  name: string;
  code: string;
  passwordHash: string;
  passwordConfirmation: string;
  isActive?: boolean;
  isVerified?: boolean;
}

interface UserUpdateData {
  email?: string;
  name?: string;
  code?: string;
  passwordHash?: string;
  passwordConfirmation?: string;
  isActive?: boolean;
  isVerified?: boolean;
  phoneNumber?: string;
  dob?: Date;
}

/**
 * UserController - Service-based controller extending BaseController
 * Provides user-specific operations with inherited CRUD functionality
 */
export class UserController extends BaseController<User, UserCreateData, UserUpdateData, typeof userService> {
  
  constructor() {
    super(userService);
  }
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
      const newUserData: UserCreateData = {
        email: userData.email.toLowerCase(),
        name: userData.name,
        code: userData.code || `USER_${Date.now()}`,
        passwordHash: hashedPassword,
        passwordConfirmation: hashedPassword,
        isActive: true,
        isVerified: false,
      };

      // Create user using the base class method
      const createUserResult = await this.create(newUserData);
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
   * Get all users with enhanced functionality (includes roles option)
   */
  async getAllUsers(params?: {
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
   * Get user by email (user-specific method)
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
   * Get user by code (user-specific method)
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
   * Create user from legacy NewUser format
   */
  async createFromLegacy(data: NewUser): Promise<ApiResponse<User>> {
    try {
      // Hash the password if it's not already hashed
      const hashedPassword = data.passwordHash?.startsWith('$') ? 
        data.passwordHash : 
        await PasswordService.hash(data.passwordHash || '');

      // Convert NewUser to UserCreateData format
      const userData: UserCreateData = {
        email: data.email || '',
        name: data.name || '',
        code: data.code || `USER_${Date.now()}`,
        passwordHash: hashedPassword,
        passwordConfirmation: hashedPassword,
        isActive: data.isActive ?? true,
        isVerified: data.isVerified ?? false
      };

      return await this.create(userData);
    } catch (error) {
      console.error('Create user from legacy error:', error);
      return {
        success: false,
        error: 'Failed to create user'
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
   * Search users (enhanced version of base search)
   */
  async searchUsers(query: string, options: { 
    limit?: number;
    includeInactive?: boolean;
    includeRoles?: boolean;
  } = {}): Promise<ApiResponse<User[]>> {
    try {
      const { limit = 10, includeInactive = false, includeRoles = false } = options;
      
      const result = await userService.searchUsers(query, { 
        limit,
        includeInactive,
        includeRoles
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
        const userWithRolesResult = await userService.getUserWithRoles(userId);
        
        if (userWithRolesResult.success && userWithRolesResult.data) {
          return {
            success: true,
            data: userWithRolesResult.data as User,
            message: 'Current user retrieved successfully'
          };
        }

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

  /**
   * Get user with roles and permissions
   */
  async getUserWithRoles(userId: number): Promise<ApiResponse<any>> {
    try {
      const result = await userService.getUserWithRoles(userId);
      
      if (!result.success) {
        return {
          success: false,
          error: result.error || 'Failed to get user with roles'
        };
      }

      return {
        success: true,
        data: result.data,
        message: 'User with roles retrieved successfully'
      };
    } catch (error) {
      console.error('Get user with roles error:', error);
      return {
        success: false,
        error: 'Failed to get user with roles'
      };
    }
  }

  async hasPermission(userId: number, permissionSlug: string): Promise<boolean> {
    try {
      const userResult = await userService.getUserWithRoles(userId);
      if (!userResult.success || !userResult.data) return false;

      // Get flattened permissions from roles
      return userResult.data.roles.some(role =>
        role.permissions.some(permission => permission.name === permissionSlug)
      );
    } catch (error) {
      console.error('Check permission error:', error);
      return false;
    }
  }

  /**
   * Get users available for role assignment
   */
  async getUsersForRoleAssignment(params?: {
    page?: number;
    limit?: number;
    query?: string;
    excludeRoleId?: number;
    isActive?: boolean;
  }): Promise<ApiResponse<any[]>> {
    try {
      const result = await this.getAllUsers({
        page: params?.page || 1,
        limit: params?.limit || 50,
        query: params?.query,
        isActive: params?.isActive ?? true, // Default to active users only
        includeRoles: true
      });

      if (!result.success || !result.data) {
        return {
          success: false,
          error: result.error || 'Failed to fetch users'
        };
      }

      let users = result.data;

      // Filter out users already assigned to the specified role
      if (params?.excludeRoleId) {
        users = users.filter(user => {
          const userRoles = (user as any).roles || [];
          return !userRoles.some((role: any) => role.id === params.excludeRoleId);
        });
      }

      // Remove sensitive fields from users
      const sanitizedUsers = users.map(user => ({
        id: user.id,
        name: user.name,
        email: user.email,
        code: user.code,
        isActive: user.isActive,
        isVerified: user.isVerified,
        createdAt: user.createdAt,
        roles: (user as any).roles || []
      }));

      return {
        success: true,
        data: sanitizedUsers,
        pagination: result.pagination,
        message: 'Users retrieved successfully'
      };
    } catch (error) {
      console.error('Get users for role assignment error:', error);
      return {
        success: false,
        error: 'Failed to get users for role assignment'
      };
    }
  }

  // ==================== HOOK OVERRIDES ====================

  /**
   * Validate user creation data
   */
  protected validateCreateData(data: UserCreateData): ApiResponse<User> | null {
    const errors = this.validateRequiredFields(data, ['email', 'name', 'code']);
    
    if (errors.length > 0) {
      return {
        success: false,
        error: errors.map(e => e.message).join(', ')
      };
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(data.email)) {
      return {
        success: false,
        error: 'Invalid email format'
      };
    }

    return null;
  }

  /**
   * Process data before user creation
   */
  protected async beforeCreate(data: UserCreateData): Promise<UserCreateData> {
    // Ensure email is lowercase
    data.email = data.email.toLowerCase();
    
    // Generate code if not provided
    if (!data.code) {
      data.code = `USER_${Date.now()}`;
    }

    // Set default values
    if (data.isActive === undefined) {
      data.isActive = true;
    }

    if (data.isVerified === undefined) {
      data.isVerified = false;
    }

    return data;
  }

  /**
   * Process data before user update
   */
  protected async beforeUpdate(id: number, data: UserUpdateData): Promise<UserUpdateData> {
    // Ensure email is lowercase if being updated
    if (data.email) {
      data.email = data.email.toLowerCase();
    }

    return data;
  }

  /**
   * Check if user can be deleted
   */
  protected async canDelete(id: number): Promise<{ allowed: boolean; reason?: string }> {
    try {
      // Get user details to check if it's a system user
      const user = await this.getById(id);
      if (user.success && user.data) {
        // Prevent deletion of system users (you can customize this logic)
        const systemEmails = ['admin@system.com', 'root@system.com'];
        if (systemEmails.includes(user.data.email)) {
          return {
            allowed: false,
            reason: 'System users cannot be deleted'
          };
        }
      }

      return { allowed: true };
    } catch (error) {
      return {
        allowed: false,
        reason: 'Unable to verify user deletion requirements'
      };
    }
  }

  /**
   * Get success messages
   */
  protected getCreateSuccessMessage(): string {
    return 'User created successfully';
  }

  protected getUpdateSuccessMessage(): string {
    return 'User updated successfully';
  }

  protected getDeleteSuccessMessage(): string {
    return 'User deleted successfully';
  }
}

export const userController = new UserController();
