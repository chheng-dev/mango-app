import { ApiResponse } from '../controllers/BaseController';
import { userService } from './UserService';
import { rolePermissionService } from './RolePermissionService';
import { UserSelect, UserWithRoles } from '../models/UserModel';

export class UserManagementService {
  /**
   * Get users with advanced filtering for admin interface
   */
  async getUsers(params: {
    page?: number;
    limit?: number;
    query?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
    isActive?: boolean;
    isVerified?: boolean;
    includeRoles?: boolean;
    roleId?: number;
  }): Promise<ApiResponse<any[]>> {
    try {
      const page = params.page || 1;
      const limit = params.limit || 10;

      const result = await userService.findManyLegacy({
        page,
        limit,
        query: params.query,
        sortBy: params.sortBy,
        sortOrder: params.sortOrder,
        isActive: params.isActive,
        isVerified: params.isVerified
      });

      if (!result.success || !result.data) {
        return {
          success: false,
          error: result.error || 'Failed to fetch users'
        };
      }

      let users: any[] = result.data.users.map((user: any) => this.removeSensitiveFields(user));

      // Include roles if requested
      if (params.includeRoles && users.length > 0) {
        const usersWithRoles = await Promise.all(
          result.data.users.map(async (user: any) => {
            const userWithRolesResult = await userService.getUserWithRoles(user.id);
            if (userWithRolesResult.success && userWithRolesResult.data) {
              return userWithRolesResult.data;
            }
            return user;
          })
        );
        users = usersWithRoles.map((user: any) => this.removeSensitiveFields(user));
      }

      return {
        success: true,
        data: users,
        pagination: result.pagination
      };
    } catch (error) {
      console.error('Get users error:', error);
      return { success: false, error: 'Failed to get users' };
    }
  }

  /**
   * Get user dashboard statistics
   */
  async getUserStats(): Promise<ApiResponse<{
    total: number;
    active: number;
    inactive: number;
    verified: number;
    unverified: number;
  }>> {
    try {
      // Get all users to calculate statistics
      const allUsersResult = await userService.getAll({ 
        page: 1, 
        limit: 10000 // Large limit to get all users
      });

      if (!allUsersResult.success || !allUsersResult.data) {
        return { 
          success: false, 
          error: 'Failed to fetch users for statistics' 
        };
      }

      const users = allUsersResult.data;
      
      const stats = {
        total: users.length,
        active: users.filter(user => user.isActive === true).length,
        inactive: users.filter(user => user.isActive === false).length,
        verified: users.filter(user => user.isVerified === true).length,
        unverified: users.filter(user => user.isVerified === false).length
      };

      return {
        success: true,
        data: stats
      };
    } catch (error) {
      console.error('Get user stats error:', error);
      return { success: false, error: 'Failed to get user statistics' };
    }
  }

  /**
   * Bulk operations for admin
   */
  async bulkAssignRole(userIds: number[], roleId: number, assignedBy: number): Promise<ApiResponse<boolean>> {
    try {
      const results = await Promise.all(
        userIds.map(userId => rolePermissionService.assignRole(userId, roleId, assignedBy))
      );

      const failed = results.filter(r => !r.success);
      
      if (failed.length > 0) {
        return {
          success: false,
          error: `Failed to assign role to ${failed.length} users`
        };
      }

      return {
        success: true,
        data: true,
        message: `Role assigned to ${userIds.length} users successfully`
      };
    } catch (error) {
      console.error('Bulk assign role error:', error);
      return { success: false, error: 'Failed to bulk assign role' };
    }
  }

  async bulkRemoveRole(userIds: number[], roleId: number): Promise<ApiResponse<boolean>> {
    try {
      const results = await Promise.all(
        userIds.map(userId => rolePermissionService.removeRole(userId, roleId))
      );

      const failed = results.filter(r => !r.success);
      
      if (failed.length > 0) {
        return {
          success: false,
          error: `Failed to remove role from ${failed.length} users`
        };
      }

      return {
        success: true,
        data: true,
        message: `Role removed from ${userIds.length} users successfully`
      };
    } catch (error) {
      console.error('Bulk remove role error:', error);
      return { success: false, error: 'Failed to bulk remove role' };
    }
  }

  async bulkUpdateStatus(userIds: number[], isActive: boolean): Promise<ApiResponse<boolean>> {
    try {
      await userService.bulkUpdateStatus(userIds, isActive);

      return {
        success: true,
        data: true,
        message: `${userIds.length} users ${isActive ? 'activated' : 'deactivated'} successfully`
      };
    } catch (error) {
      console.error('Bulk update status error:', error);
      return { success: false, error: 'Failed to bulk update user status' };
    }
  }

  /**
   * User profile management
   */
  async updateUserProfile(userId: number, profileData: {
    name?: string;
    email?: string;
    phoneNumber?: string;
    dob?: Date;
  }): Promise<ApiResponse<any>> {
    try {
      // Check if email is changing and if it's already taken
      if (profileData.email) {
        const existingUserResult = await userService.findByEmail(profileData.email);
        if (existingUserResult.success && existingUserResult.data && existingUserResult.data.id !== userId) {
          return { success: false, error: 'Email already in use' };
        }
      }

      const updatedUserResult = await userService.updateUser(userId, profileData);
      
      if (!updatedUserResult.success || !updatedUserResult.data) {
        return { 
          success: false, 
          error: updatedUserResult.error || 'User not found' 
        };
      }

      return {
        success: true,
        data: this.removeSensitiveFields(updatedUserResult.data),
        message: 'Profile updated successfully'
      };
    } catch (error) {
      console.error('Update user profile error:', error);
      return { success: false, error: 'Failed to update profile' };
    }
  }

  private removeSensitiveFields(user: any): any {
    const { passwordHash, passwordConfirmation, ...safeData } = user;
    return safeData;
  }
}

export const userManagementService = new UserManagementService();
