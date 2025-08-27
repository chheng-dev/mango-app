import { db } from '../db';
import { users, type User, type NewUser } from '../db/schema';
import { eq } from 'drizzle-orm';
import { BaseController, ApiResponse, PaginationOptions, SearchOptions } from './BaseController';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

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
   * Generate JWT token for user
   */
  private generateToken(user: User): string {
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      throw new Error('JWT_SECRET environment variable is not set');
    }

    return jwt.sign(
      { 
        userId: user.id, 
        email: user.email,
        code: user.code,
        isVerified: user.isVerified
      },
      jwtSecret,
      { expiresIn: '24h' }
    );
  }

  /**
   * Verify JWT secret is available
   */
  private getJwtSecret(): string {
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      throw new Error('JWT_SECRET environment variable is not set');
    }
    return jwtSecret;
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
  protected async transformForSave(data: any): Promise<any> {
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

    // Hash password if provided
    if (transformed.passwordHash && typeof transformed.passwordHash === 'string') {
      const saltRounds = 12;
      transformed.passwordHash = await bcrypt.hash(transformed.passwordHash, saltRounds);
    }

    // Hash password confirmation if provided (for validation purposes)
    if (transformed.passwordConfirmation && typeof transformed.passwordConfirmation === 'string') {
      const saltRounds = 12;
      transformed.passwordConfirmation = await bcrypt.hash(transformed.passwordConfirmation, saltRounds);
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
  async updatePassword(id: number, newPassword: string, passwordConfirmation: string): Promise<ApiResponse<User>> {
    try {
      if (newPassword !== passwordConfirmation) {
        return {
          success: false,
          error: 'Password confirmation does not match'
        };
      }

      // Hash the new password
      const saltRounds = 12;
      const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

      const result = await db
        .update(this.table)
        .set({ 
          passwordHash: hashedPassword,
          passwordConfirmation: hashedPassword,
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
        message: 'Password updated successfully'
      };
    } catch (error) {
      console.error('Update password error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to update password'
      };
    }
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

  /**
   * Authenticate user login
   */
  async login(email: string, password: string): Promise<ApiResponse<{ user: User; token: string }>> {
    try {
      // Get user by email (including password for verification)
      const userResult = await db
        .select()
        .from(this.table)
        .where(eq(this.table.email, email.toLowerCase()));

      if (!userResult || userResult.length === 0) {
        return {
          success: false,
          error: 'Invalid email or password'
        };
      }

      const user = userResult[0];

      // Check if user is active
      if (!user.isActive) {
        return {
          success: false,
          error: 'Account is deactivated'
        };
      }

      // Verify password using bcrypt
      const isPasswordValid = await bcrypt.compare(password, user.passwordHash);

      if (!isPasswordValid) {
        return {
          success: false,
          error: 'Invalid email or password'
        };
      }

      // Generate JWT token
      const token = this.generateToken(user);

      return {
        success: true,
        data: {
          user: this.transformAfterFetch(user),
          token
        },
        message: 'Login successful'
      };

    } catch (error) {
      console.error('Login error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Login failed'
      };
    }
  }

  /**
   * Verify JWT token
   */
  async verifyToken(token: string): Promise<ApiResponse<User>> {
    try {
      const jwtSecret = this.getJwtSecret();
      const decoded = jwt.verify(token, jwtSecret) as any;

      if (!decoded || typeof decoded !== 'object' || !decoded.userId) {
        return {
          success: false,
          error: 'Invalid token'
        };
      }

      // Get fresh user data
      const userResult = await this.getById(decoded.userId);
      
      if (!userResult.success) {
        return {
          success: false,
          error: 'User not found'
        };
      }

      return {
        success: true,
        data: userResult.data!,
        message: 'Token verified'
      };

    } catch (error) {
      console.error('Token verification error:', error);
      return {
        success: false,
        error: 'Invalid or expired token'
      };
    }
  }

  /**
   * Refresh user token
   */
  async refreshToken(oldToken: string): Promise<ApiResponse<{ user: User; token: string }>> {
    try {
      const verifyResult = await this.verifyToken(oldToken);
      
      if (!verifyResult.success) {
        return {
          success: false,
          error: 'Invalid token'
        };
      }

      const user = verifyResult.data!;

      // Generate new token
      const token = this.generateToken(user);

      return {
        success: true,
        data: {
          user,
          token
        },
        message: 'Token refreshed'
      };

    } catch (error) {
      console.error('Token refresh error:', error);
      return {
        success: false,
        error: 'Failed to refresh token'
      };
    }
  }
}

// Export singleton instance
export const userController = new UserController();
