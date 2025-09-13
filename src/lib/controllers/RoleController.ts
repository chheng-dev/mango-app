import { ApiResponse } from './BaseController';
import { db } from '../db';
import { userRoles } from '../db/schemas/user_roles';
import { roles } from '../db/schemas/roles';
import { permissions } from '../db/schemas/permissions';
import { rolePermissions } from '../db/schemas/role_permission';
import { and, eq } from 'drizzle-orm';

/**
 * RoleController - Handles role and permission management
 * Separated from UserController for better organization
 */
export class RoleController {
  /**
   * Assign role to user
   */
  async assignRole(userId: number, roleId: number, assignedBy: number): Promise<ApiResponse<boolean>> {
    try {
      // Check if user already has this role
      const existingRole = await db
        .select()
        .from(userRoles)
        .where(and(
          eq(userRoles.userId, userId),
          eq(userRoles.roleId, roleId),
          eq(userRoles.isActive, true)
        ))
        .limit(1);

      if (existingRole.length > 0) {
        return {
          success: false,
          error: 'User already has this role'
        };
      }

      // Assign role
      await db.insert(userRoles).values({
        userId,
        roleId,
        assignedBy,
        isActive: true
      });

      return {
        success: true,
        data: true,
        message: 'Role assigned successfully'
      };
    } catch (error) {
      console.error('Assign role error:', error);
      return {
        success: false,
        error: 'Failed to assign role'
      };
    }
  }

  /**
   * Remove role from user
   */
  async removeRole(userId: number, roleId: number): Promise<ApiResponse<boolean>> {
    try {
      await db
        .update(userRoles)
        .set({ isActive: false })
        .where(and(
          eq(userRoles.userId, userId),
          eq(userRoles.roleId, roleId)
        ));

      return {
        success: true,
        data: true,
        message: 'Role removed successfully'
      };
    } catch (error) {
      console.error('Remove role error:', error);
      return {
        success: false,
        error: 'Failed to remove role'
      };
    }
  }

  /**
   * Check if user has permission
   */
  async hasPermission(userId: number, permissionSlug: string): Promise<boolean> {
    try {
      const result = await db
        .select({ count: permissions.id })
        .from(userRoles)
        .innerJoin(roles, eq(userRoles.roleId, roles.id))
        .innerJoin(rolePermissions, eq(roles.id, rolePermissions.roleId))
        .innerJoin(permissions, eq(rolePermissions.permissionId, permissions.id))
        .where(and(
          eq(userRoles.userId, userId),
          eq(permissions.slug, permissionSlug),
          eq(userRoles.isActive, true),
          eq(roles.isActive, true)
        ))
        .limit(1);

      return result.length > 0;
    } catch (error) {
      console.error('Check permission error:', error);
      return false;
    }
  }

  /**
   * Get all roles for a user
   */
  async getUserRoles(userId: number): Promise<ApiResponse<any[]>> {
    try {
      const userRolesData = await db
        .select({
          roleId: roles.id,
          roleName: roles.name,
          roleSlug: roles.slug
        })
        .from(userRoles)
        .innerJoin(roles, eq(userRoles.roleId, roles.id))
        .where(and(
          eq(userRoles.userId, userId),
          eq(userRoles.isActive, true),
          eq(roles.isActive, true)
        ));

      return {
        success: true,
        data: userRolesData
      };
    } catch (error) {
      console.error('Get user roles error:', error);
      return {
        success: false,
        error: 'Failed to get user roles'
      };
    }
  }

  /**
   * Get all permissions for a user
   */
  async getUserPermissions(userId: number): Promise<ApiResponse<any[]>> {
    try {
      const userPermissions = await db
        .select({
          permissionId: permissions.id,
          permissionName: permissions.name,
          permissionSlug: permissions.slug,
          roleName: roles.name
        })
        .from(userRoles)
        .innerJoin(roles, eq(userRoles.roleId, roles.id))
        .innerJoin(rolePermissions, eq(roles.id, rolePermissions.roleId))
        .innerJoin(permissions, eq(rolePermissions.permissionId, permissions.id))
        .where(and(
          eq(userRoles.userId, userId),
          eq(userRoles.isActive, true),
          eq(roles.isActive, true)
        ));

      return {
        success: true,
        data: userPermissions
      };
    } catch (error) {
      console.error('Get user permissions error:', error);
      return {
        success: false,
        error: 'Failed to get user permissions'
      };
    }
  }

  /**
   * Get all available roles
   */
  async getAllRoles(): Promise<ApiResponse<any[]>> {
    try {
      const allRoles = await db
        .select()
        .from(roles)
        .where(eq(roles.isActive, true));

      return {
        success: true,
        data: allRoles
      };
    } catch (error) {
      console.error('Get all roles error:', error);
      return {
        success: false,
        error: 'Failed to get roles'
      };
    }
  }

  /**
   * Get all available permissions
   */
  async getAllPermissions(): Promise<ApiResponse<any[]>> {
    try {
      const allPermissions = await db
        .select()
        .from(permissions);

      return {
        success: true,
        data: allPermissions
      };
    } catch (error) {
      console.error('Get all permissions error:', error);
      return {
        success: false,
        error: 'Failed to get permissions'
      };
    }
  }
}

export const roleController = new RoleController();
