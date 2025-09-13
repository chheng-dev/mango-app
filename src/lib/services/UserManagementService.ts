import { ApiResponse } from '../controllers/BaseController';
import { userService } from './UserService';
import { rolePermissionService } from './RolePermissionService';

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

      let users = result.users.map(user => this.removeSensitiveFields(user));

      // Include roles if requested
      if (params.includeRoles && users.length > 0) {
        const usersWithRoles = await userService.includeRoles(result.users);
        users = usersWithRoles.map(user => this.removeSensitiveFields(user));
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
      const [
        total,
        active,
        inactive,
        verified,
        unverified
      ] = await Promise.all([
        userService.count(),
        userService.count({ isActive: true }),
        userService.count({ isActive: false }),
        userService.count({ isVerified: true }),
        userService.count({ isVerified: false })
      ]);

      return {
        success: true,
        data: {
          total,
          active,
          inactive,
          verified,
          unverified
        }
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
        const existingUser = await userService.findByEmail(profileData.email);
        if (existingUser && existingUser.id !== userId) {
          return { success: false, error: 'Email already in use' };
        }
      }

      const updatedUser = await userService.update(userId, profileData);
      
      if (!updatedUser) {
        return { success: false, error: 'User not found' };
      }

      return {
        success: true,
        data: this.removeSensitiveFields(updatedUser),
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
