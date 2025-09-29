import { BaseModel } from './baseModel';
import { roles } from '../db/schemas/roles';
import { permissions } from '../db/schemas/permissions';
import { rolePermissions } from '../db/schemas/role_permission';
import { users } from '../db/schemas/users';
import { userRoles } from '../db/schemas/user_roles';
import { eq, and, inArray, sql } from 'drizzle-orm';
import { db } from '../db';

export type RoleSelect = typeof roles.$inferSelect;
export type RoleInsert = typeof roles.$inferInsert;
export type PermissionSelect = typeof permissions.$inferSelect;
export type RolePermissionSelect = typeof rolePermissions.$inferSelect;
export type UserSelect = typeof users.$inferSelect;

export interface RoleWithPermissions {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  isActive: boolean | null;
  createdAt: Date;
  updatedAt: Date;
  permissions: PermissionSelect[];
}

export interface RoleWithUsers {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  isActive: boolean | null;
  createdAt: Date;
  updatedAt: Date;
  users: Array<{
    id: number;
    name: string;
    email: string;
    isActive: boolean | null;
    assignedAt: Date;
    expiresAt: Date | null;
    isAssignmentActive: boolean | null;
  }>;
}

export class RoleModel extends BaseModel<RoleSelect, RoleInsert> {
  protected tableName = 'roles';
  protected table = roles;
  
  constructor() {
    super(
      [roles.name],
      ['name']
    );
  }

  async findWithPermissions(roleId: number) {
    try {
      const roleWithPermissions = await db
        .select({
          id: roles.id,
          name: roles.name,
          slug: roles.slug,
          description: roles.description,
          isActive: roles.isActive,
          createdAt: roles.createdAt,
          updatedAt: roles.updatedAt,
          permissionId: permissions.id,
          permissionName: permissions.name,
          permissionSlug: permissions.slug,
          permissionDescription: permissions.description,
          permissionResource: permissions.resource,
          permissionAction: permissions.action,
          permissionCreatedAt: permissions.createdAt,
          permissionUpdatedAt: permissions.updatedAt,
        })
        .from(roles)
        .leftJoin(rolePermissions, eq(roles.id, rolePermissions.roleId))
        .leftJoin(permissions, eq(rolePermissions.permissionId, permissions.id))
        .where(eq(roles.id, roleId));

      if (!roleWithPermissions.length) {
        return {
          success: false,
          error: 'Role not found'
        };
      }

      // Group permissions by role
      const role = roleWithPermissions[0];
      const groupedPermissions = roleWithPermissions
        .filter(row => row.permissionId !== null)
        .map(row => ({
          id: row.permissionId!,
          name: row.permissionName!,
          slug: row.permissionSlug!,
          description: row.permissionDescription,
          resource: row.permissionResource!,
          action: row.permissionAction!,
          createdAt: row.permissionCreatedAt!,
          updatedAt: row.permissionUpdatedAt!,
        }));

      const result: RoleWithPermissions = {
        id: role.id,
        name: role.name,
        slug: role.slug,
        description: role.description,
        isActive: role.isActive,
        createdAt: role.createdAt,
        updatedAt: role.updatedAt,
        permissions: groupedPermissions
      };

      return {
        success: true,
        data: result
      };
    } catch (error) {
      console.error('RoleModel findWithPermissions error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch role with permissions'
      };
    }
  }

  /**
   * Find role with its assigned users
   */
  async findWithUsers(roleId: number) {
    try {
      const roleWithUsers = await db
        .select({
          id: roles.id,
          name: roles.name,
          slug: roles.slug,
          description: roles.description,
          isActive: roles.isActive,
          createdAt: roles.createdAt,
          updatedAt: roles.updatedAt,
          userId: users.id,
          userName: users.name,
          userEmail: users.email,
          userIsActive: users.isActive,
          assignedAt: userRoles.assignedAt,
          expiresAt: userRoles.expiresAt,
          isAssignmentActive: userRoles.isActive,
        })
        .from(roles)
        .leftJoin(userRoles, eq(roles.id, userRoles.roleId))
        .leftJoin(users, eq(userRoles.userId, users.id))
        .where(eq(roles.id, roleId));

      if (!roleWithUsers.length) {
        return {
          success: false,
          error: 'Role not found'
        };
      }

      // Group users by role
      const role = roleWithUsers[0];
      const groupedUsers = roleWithUsers
        .filter(row => row.userId !== null)
        .map(row => ({
          id: row.userId!,
          name: row.userName!,
          email: row.userEmail!,
          isActive: row.userIsActive,
          assignedAt: row.assignedAt!,
          expiresAt: row.expiresAt,
          isAssignmentActive: row.isAssignmentActive,
        }));

      const result: RoleWithUsers = {
        id: role.id,
        name: role.name,
        slug: role.slug,
        description: role.description,
        isActive: role.isActive,
        createdAt: role.createdAt,
        updatedAt: role.updatedAt,
        users: groupedUsers
      };

      return {
        success: true,
        data: result
      };
    } catch (error) {
      console.error('RoleModel findWithUsers error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch role with users'
      };
    }
  }

  /**
   * Assign permissions to role
   */
  async assignPermissions(roleId: number, permissionIds: number[]) {
    try {
      if (permissionIds.length === 0) {
        return { success: true, data: [] };
      }

      const rolePermissionData = permissionIds.map(permissionId => ({
        roleId,
        permissionId,
        createdAt: new Date(),
        updatedAt: new Date()
      }));

      const result = await db
        .insert(rolePermissions)
        .values(rolePermissionData)
        .onConflictDoNothing()
        .returning();

      return {
        success: true,
        data: result,
        message: `${result.length} permissions assigned to role`
      };
    } catch (error) {
      console.error('RoleModel assignPermissions error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to assign permissions'
      };
    }
  }

  async updatePermissionsForRole(roleId: number, permissionIds: number[]) {
      try {
      const result = await db.transaction(async (tx) => {
        await db
          .delete(rolePermissions)
          .where(eq(rolePermissions.roleId, roleId));

        if (permissionIds.length > 0) {
          const rolePermissionData = permissionIds.map(permissionId => ({
            roleId,
            permissionId,
            createdAt: new Date(),
            updatedAt: new Date()
          }));

          await tx
            .insert(rolePermissions)
            .values(rolePermissionData)
            .onConflictDoNothing();
        }
      });

      return {
        success: true,
        data: result,
        message: 'Role permissions updated successfully'
      };
    } catch (error) {
      console.error('RoleModel updatePermissionsForRole error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to update role permissions'
      };
    }
  }

  /**
   * Remove permissions from role
   */
  async removePermissions(roleId: number, permissionIds: number[]) {
    try {
      if (permissionIds.length === 0) {
        return { success: true, data: true };
      }

      const result = await db
        .delete(rolePermissions)
        .where(
          and(
            eq(rolePermissions.roleId, roleId),
            inArray(rolePermissions.permissionId, permissionIds)
          )
        );

      return {
        success: true,
        data: result,
        message: `Permissions removed from role`
      };
    } catch (error) {
      console.error('RoleModel removePermissions error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to remove permissions'
      };
    }
  }

  /**
   * Remove all permissions from role
   */
  async clearPermissions(roleId: number) {
    try {
      const result = await db
        .delete(rolePermissions)
        .where(eq(rolePermissions.roleId, roleId));

      return {
        success: true,
        data: true,
        message: 'All permissions removed from role'
      };
    } catch (error) {
      console.error('RoleModel clearPermissions error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to clear permissions'
      };
    }
  }

  /**
   * Get roles by permission
   */
  async findByPermission(permissionId: number) {
    try {
      const rolesWithPermission = await db
        .select({
          id: roles.id,
          name: roles.name,
          description: roles.description,
          isActive: roles.isActive,
          createdAt: roles.createdAt,
          updatedAt: roles.updatedAt,
        })
        .from(roles)
        .innerJoin(rolePermissions, eq(roles.id, rolePermissions.roleId))
        .where(eq(rolePermissions.permissionId, permissionId));

      return {
        success: true,
        data: rolesWithPermission
      };
    } catch (error) {
      console.error('RoleModel findByPermission error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch roles by permission'
      };
    }
  }

  /**
   * Get role permissions count
   */
  async getPermissionCount(roleId: number) {
    try {
      const count = await db
        .select({
          count: sql<number>`count(*)`
        })
        .from(rolePermissions)
        .where(eq(rolePermissions.roleId, roleId));

      return count[0]?.count || 0;
    } catch (error) {
      console.error('RoleModel getPermissionCount error:', error);
      return 0;
    }
  }

  /**
   * Check if role exists by name
   */
  async existsByName(name: string, excludeId?: number) {
    try {
      const conditions = [eq(roles.name, name)];
      if (excludeId) {
        const { ne } = await import('drizzle-orm');
        conditions.push(ne(roles.id, excludeId));
      }

      const result = await db
        .select({ id: roles.id })
        .from(roles)
        .where(and(...conditions))
        .limit(1);

      return result.length > 0;
    } catch (error) {
      console.error('RoleModel existsByName error:', error);
      return false;
    }
  }
}
