import { db } from '../db';
import { userRoles } from '../db/schemas/user_roles';
import { roles } from '../db/schemas/roles';
import { permissions } from '../db/schemas/permissions';
import { rolePermissions } from '../db/schemas/role_permission';
import { and, eq } from 'drizzle-orm';
import { ApiResponse } from '@/types/api';

export class RolePermissionService {
  /**
   * Check if user has specific permission
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
          eq(permissions.name, permissionSlug),
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
        return { success: false, error: 'User already has this role' };
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
      return { success: false, error: 'Failed to assign role' };
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
      return { success: false, error: 'Failed to remove role' };
    }
  }

  /**
   * Get user roles with permissions
   */
  async getUserRoles(userId: number) {
    try {
      const userRolesData = await db.select({
        role: roles,
        permissions: permissions
      })
      .from(userRoles)
      .innerJoin(roles, eq(userRoles.roleId, roles.id))
      .leftJoin(rolePermissions, eq(roles.id, rolePermissions.roleId))
      .leftJoin(permissions, eq(rolePermissions.permissionId, permissions.id))
      .where(and(
        eq(userRoles.userId, userId),
        eq(userRoles.isActive, true),
        eq(roles.isActive, true)
      ));

      // Group by role
      const rolesMap = new Map();
      const permissionsSet = new Set();

      userRolesData.forEach(({ role, permissions: permission }) => {
        if (!rolesMap.has(role.id)) {
          rolesMap.set(role.id, { ...role, permissions: [] });
        }

        if (permission) {
          rolesMap.get(role.id).permissions.push(permission);
          permissionsSet.add(permission);
        }
      });

      return {
        roles: Array.from(rolesMap.values()),
        permissions: Array.from(permissionsSet)
      };
    } catch (error) {
      console.error('Get user roles error:', error);
      return { roles: [], permissions: [] };
    }
  }
}

export const rolePermissionService = new RolePermissionService();
