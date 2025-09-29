import { db } from '../db';
import { users } from '../db/schema';
import { eq, and, or, like, inArray } from 'drizzle-orm';
import { ApiResponse } from '@/types/api';

/**
 * UserService - Clean business logic for user operations
 * Used by API routes for complex operations not handled by UserController
 */
export class UserService {
  
  // Authentication
  async authenticateUser(email: string, password: string): Promise<ApiResponse<any>> {
    try {
      const user = await db.select().from(users).where(eq(users.email, email.toLowerCase())).limit(1);
      if (!user.length) return { success: false, error: 'Invalid credentials' };

      // In a real app, you'd verify the hashed password here
      const isValid = user[0].passwordHash === password; // Simplified for demo

      if (!isValid) return { success: false, error: 'Invalid credentials' };
      if (!user[0].isActive) return { success: false, error: 'Account is inactive' };

      // Remove sensitive data
      const { passwordHash, passwordConfirmation, ...safeUser } = user[0];
      return { success: true, data: safeUser };
    } catch (error) {
      console.error('authenticateUser error:', error);
      return { success: false, error: 'Authentication failed' };
    }
  }

  // Registration
  async registerUser(data: { name: string; email: string; code: string; password: string; passwordConfirmation: string }): Promise<ApiResponse<any>> {
    try {
      // Basic validation
      if (data.password !== data.passwordConfirmation) {
        return { success: false, error: 'Passwords do not match' };
      }

      // Check if email already exists
      const existingEmail = await db.select().from(users).where(eq(users.email, data.email.toLowerCase())).limit(1);
      if (existingEmail.length) return { success: false, error: 'Email already exists' };

      // Check if code already exists
      const existingCode = await db.select().from(users).where(eq(users.code, data.code.toUpperCase())).limit(1);
      if (existingCode.length) return { success: false, error: 'Code already exists' };

      // In a real app, you'd hash the password here
      const passwordHash = data.password; // Simplified for demo

      const newUser = await db.insert(users).values({
        name: data.name.trim(),
        email: data.email.toLowerCase().trim(),
        code: data.code.toUpperCase().trim(),
        passwordHash,
        passwordConfirmation: data.passwordConfirmation,
        isActive: true,
        isVerified: false
      }).returning();

      if (!newUser.length) return { success: false, error: 'Failed to create user' };

      // Remove sensitive data
      const { passwordHash: _, passwordConfirmation: __, ...safeUser } = newUser[0];
      return { success: true, data: safeUser, message: 'User created successfully' };
    } catch (error) {
      console.error('registerUser error:', error);
      return { success: false, error: 'Registration failed' };
    }
  }

  // Password operations
  async updatePassword(userId: number, currentPassword: string, newPassword: string): Promise<ApiResponse<any>> {
    try {
      // Get user and verify current password
      const user = await db.select().from(users).where(eq(users.id, userId)).limit(1);
      if (!user.length) return { success: false, error: 'User not found' };

      // Verify current password
      const isValid = user[0].passwordHash === currentPassword; // Simplified
      if (!isValid) return { success: false, error: 'Current password is incorrect' };

      // Update password
      const updated = await db.update(users)
        .set({ 
          passwordHash: newPassword, // In real app, hash this
          passwordConfirmation: newPassword,
          updatedAt: new Date() 
        })
        .where(eq(users.id, userId))
        .returning();

      if (!updated.length) return { success: false, error: 'Failed to update password' };

      return { success: true, message: 'Password updated successfully' };
    } catch (error) {
      console.error('updatePassword error:', error);
      return { success: false, error: 'Failed to update password' };
    }
  }

  // User verification
  async verifyUser(userId: number): Promise<ApiResponse<any>> {
    try {
      const updated = await db.update(users)
        .set({ isVerified: true, updatedAt: new Date() })
        .where(eq(users.id, userId))
        .returning();

      if (!updated.length) return { success: false, error: 'User not found' };

      return { success: true, data: updated[0], message: 'User verified successfully' };
    } catch (error) {
      console.error('verifyUser error:', error);
      return { success: false, error: 'Failed to verify user' };
    }
  }

  // User status management
  async updateUserStatus(userId: number, isActive: boolean): Promise<ApiResponse<any>> {
    try {
      const updated = await db.update(users)
        .set({ isActive, updatedAt: new Date() })
        .where(eq(users.id, userId))
        .returning();

      if (!updated.length) return { success: false, error: 'User not found' };

      const message = isActive ? 'User activated' : 'User deactivated';
      return { success: true, data: updated[0], message };
    } catch (error) {
      console.error('updateUserStatus error:', error);
      return { success: false, error: 'Failed to update user status' };
    }
  }

  // Bulk operations
  async bulkUpdateStatus(userIds: number[], isActive: boolean): Promise<ApiResponse<any>> {
    try {
      if (!userIds.length) return { success: false, error: 'No users provided' };

      const updated = await db.update(users)
        .set({ isActive, updatedAt: new Date() })
        .where(inArray(users.id, userIds));

      const message = `${userIds.length} users ${isActive ? 'activated' : 'deactivated'}`;
      return { success: true, data: true, message };
    } catch (error) {
      console.error('bulkUpdateStatus error:', error);
      return { success: false, error: 'Failed to update user statuses' };
    }
  }

  // User search with business logic
  async searchUsers(query: string, options: { limit?: number; includeInactive?: boolean } = {}): Promise<ApiResponse<any[]>> {
    try {
      const { limit = 10, includeInactive = false } = options;
      
      if (!query || query.trim().length < 2) {
        return { success: false, error: 'Search query must be at least 2 characters' };
      }

      const searchConditions = [
        like(users.name, `%${query}%`),
        like(users.email, `%${query}%`),
        like(users.code, `%${query}%`)
      ];

      let whereCondition = or(...searchConditions);
      
      if (!includeInactive) {
        whereCondition = and(or(...searchConditions), eq(users.isActive, true));
      }

      const results = await db.select()
        .from(users)
        .where(whereCondition)
        .limit(limit);

      // Remove sensitive data
      const safeResults = results.map(({ passwordHash, passwordConfirmation, ...user }) => user);

      return { success: true, data: safeResults };
    } catch (error) {
      console.error('searchUsers error:', error);
      return { success: false, error: 'Search failed' };
    }
  }

  async isEmailAvailable(email: string, excludeUserId?: number): Promise<boolean> {
    try {
      const userModel = new (await import('../models/UserModel')).UserModel();
      const exists = await userModel.emailExists(email, excludeUserId);
      return !exists; // Invert because emailExists returns true if exists, we want available
    } catch (error) {
      console.error('isEmailAvailable error:', error);
      return false;
    }
  }

  // Helper: Check code availability using UserModel
  async isCodeAvailable(code: string, excludeUserId?: number): Promise<boolean> {
    try {
      const userModel = new (await import('../models/UserModel')).UserModel();
      const exists = await userModel.codeExists(code, excludeUserId);
      return !exists; // Invert because codeExists returns true if exists, we want available
    } catch (error) {
      console.error('isCodeAvailable error:', error);
      return false;
    }
  }

  // Get user with roles using UserModel
  async getUserWithRoles(userId: number): Promise<ApiResponse<any>> {
    try {
      const userModel = new (await import('../models/UserModel')).UserModel();
      const result = await userModel.findWithRoles(userId);
      
      if (!result.success) {
        return { success: false, error: result.error || 'User not found' };
      }

      // Remove sensitive data
      const { passwordHash, passwordConfirmation, ...safeUser } = result.data!;
      
      return { 
        success: true, 
        data: safeUser
      };
    } catch (error) {
      console.error('getUserWithRoles error:', error);
      return { success: false, error: 'Failed to get user with roles' };
    }
  }
}

export const userService = new UserService();