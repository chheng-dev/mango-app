import { BaseController, ApiResponse } from './BaseController';
import { User, NewUser } from '../db/schemas/users';
import { db } from '../db';
import { users } from '../db/schemas/users';
import { eq } from 'drizzle-orm';
import { AuthService } from '../services/authService';

export interface LoginResponse {
  user: User;
  token: string;
}

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
   * User login - clean and simple
   */
  async login(email: string, password: string): Promise<ApiResponse<LoginResponse>> {
    try {
      // Find user by email
      const userResults = await db.select()
        .from(users)
        .where(eq(users.email, email))
        .limit(1);

      if (userResults.length === 0) {
        return { success: false, error: 'Invalid credentials' };
      }

      const user = userResults[0];

      // Authenticate user
      const isValid = await AuthService.authenticate(email, password, user.passwordHash);
      if (!isValid) {
        return { success: false, error: 'Invalid credentials' };
      }

      // Generate token
      const token = await AuthService.generateToken(
        user.id,
        user.email,
        user.code,
        user.isVerified || false
      );

      return {
        success: true,
        data: {
          user,
          token
        }
      };
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: 'Login failed' };
    }
  }

  /**
   * User registration - clean and simple
   */
  async register(userData: {
    email: string;
    password: string;
    passwordConfirmation: string;
    name: string;
    code: string;
  }): Promise<ApiResponse<LoginResponse>> {
    try {
      // Validate password strength
      const passwordValidation = AuthService.validatePassword(userData.password);
      if (!passwordValidation.isValid) {
        return { success: false, error: passwordValidation.errors.join(', ') };
      }

      // Check if passwords match
      if (userData.password !== userData.passwordConfirmation) {
        return { success: false, error: 'Passwords do not match' };
      }

      // Hash password
      const hashedPassword = await AuthService.hashPassword(userData.password);

      // Create user
      const newUser = await db.insert(users).values({
        email: userData.email,
        passwordHash: hashedPassword,
        passwordConfirmation: hashedPassword,
        name: userData.name,
        code: userData.code
      }).returning();

      if (newUser.length === 0) {
        return { success: false, error: 'Failed to create user' };
      }

      const user = newUser[0];

      // Generate token
      const token = await AuthService.generateToken(
        user.id,
        user.email,
        user.code,
        user.isVerified || false
      );

      return {
        success: true,
        data: {
          user,
          token
        }
      };
    } catch (error) {
      console.error('Registration error:', error);
      return { success: false, error: 'Registration failed' };
    }
  }

  /**
   * Get user by email
   */
  async getByEmail(email: string): Promise<ApiResponse<User>> {
    try {
      const result = await db
        .select()
        .from(users)
        .where(eq(users.email, email.toLowerCase()));

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
        error: 'Failed to get user'
      };
    }
  }

  /**
   * Get user by code
   */
  async getByCode(code: string): Promise<ApiResponse<User>> {
    try {
      const result = await db
        .select()
        .from(users)
        .where(eq(users.code, code.toUpperCase()));

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
      console.error('Get by code error:', error);
      return {
        success: false,
        error: 'Failed to get user'
      };
    }
  }

  /**
   * Update user password
   */
  async updatePassword(id: number, newPassword: string, passwordConfirmation: string): Promise<ApiResponse<User>> {
    try {
      if (newPassword !== passwordConfirmation) {
        return {
          success: false,
          error: 'Password confirmation does not match'
        };
      }

      // Validate password strength
      const passwordValidation = AuthService.validatePassword(newPassword);
      if (!passwordValidation.isValid) {
        return { success: false, error: passwordValidation.errors.join(', ') };
      }

      // Hash the new password
      const hashedPassword = await AuthService.hashPassword(newPassword);

      const result = await db
        .update(users)
        .set({ 
          passwordHash: hashedPassword,
          passwordConfirmation: hashedPassword,
          updatedAt: new Date() 
        })
        .where(eq(users.id, id))
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
        error: 'Failed to update password'
      };
    }
  }

  /**
   * Transform data after fetching (remove sensitive fields)
   */
  protected transformAfterFetch(data: any): any {
    const { passwordHash, passwordConfirmation, ...safeData } = data;
    return safeData;
  }

  /**
   * Transform data before saving (hash passwords, normalize email)
   */
  protected async transformBeforeSave(data: any): Promise<any> {
    const transformed = { ...data };

    // Lowercase email
    if (transformed.email) {
      transformed.email = transformed.email.toLowerCase().trim();
    }

    // Hash password if provided
    if (transformed.passwordHash && typeof transformed.passwordHash === 'string') {
      transformed.passwordHash = await AuthService.hashPassword(transformed.passwordHash);
    }

    // Hash password confirmation if provided
    if (transformed.passwordConfirmation && typeof transformed.passwordConfirmation === 'string') {
      transformed.passwordConfirmation = await AuthService.hashPassword(transformed.passwordConfirmation);
    }

    return transformed;
  }
}

export const userController = new UserController();
