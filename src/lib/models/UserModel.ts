import { users } from '../db/schemas/users';
import { userRoles } from '../db/schemas/user_roles';
import { roles } from '../db/schemas/roles';
import { permissions } from '../db/schemas/permissions';
import { rolePermissions } from '../db/schemas/role_permission';
import { eq, and, inArray } from 'drizzle-orm';
import { db } from '../db';
import { BaseModel } from './BaseModel';

export type UserSelect = typeof users.$inferSelect;
export type UserInsert = typeof users.$inferInsert;

export interface UserWithRoles extends UserSelect {
  roles: Array<{
    id: number;
    name: string;
    slug: string;
    description: string | null;
    permissions: Array<{
      id: number;
      name: string;
      resource: string;
      action: string;
    }>;
  }>;
}

/**
 * Helper function to get flattened permissions from user roles
 */
export function getFlattenedPermissions(userWithRoles: UserWithRoles): Array<{
  id: number;
  name: string;
  resource: string;
  action: string;
}> {
  const permissionsSet = new Set<string>();
  const permissions: Array<{
    id: number;
    name: string;
    resource: string;
    action: string;
  }> = [];

  userWithRoles.roles.forEach(role => {
    role.permissions.forEach(permission => {
      const permissionKey = `${permission.id}-${permission.name}`;
      if (!permissionsSet.has(permissionKey)) {
        permissionsSet.add(permissionKey);
        permissions.push(permission);
      }
    });
  });

  return permissions;
}

export class UserModel extends BaseModel<UserSelect, UserInsert> {
  protected tableName = 'users';
  protected table = users;
  
  constructor() {
    super(
      [users.name, users.email, users.code], // searchable fields
      ['name', 'email'] // required fields
    );
  }

  /**
   * Find user by email
   */
  async findByEmail(email: string) {
    try {
      const result = await db
        .select()
        .from(users)
        .where(eq(users.email, email.toLowerCase()))
        .limit(1);

      if (!result || result.length === 0) {
        return {
          success: false,
          error: 'User not found'
        };
      }

      return {
        success: true,
        data: result[0]
      };
    } catch (error) {
      console.error('UserModel findByEmail error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to find user by email'
      };
    }
  }

  /**
   * Find user by code
   */
  async findByCode(code: string) {
    try {
      const result = await db
        .select()
        .from(users)
        .where(eq(users.code, code.toUpperCase()))
        .limit(1);

      if (!result || result.length === 0) {
        return {
          success: false,
          error: 'User not found'
        };
      }

      return {
        success: true,
        data: result[0]
      };
    } catch (error) {
      console.error('UserModel findByCode error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to find user by code'
      };
    }
  }

  /**
   * Check if email exists (excluding current user)
   */
  async emailExists(email: string, excludeId?: number) {
    try {
      const conditions = [eq(users.email, email.toLowerCase())];
      if (excludeId) {
        const { ne } = await import('drizzle-orm');
        conditions.push(ne(users.id, excludeId));
      }

      const result = await db
        .select({ id: users.id })
        .from(users)
        .where(and(...conditions))
        .limit(1);

      return result.length > 0;
    } catch (error) {
      console.error('UserModel emailExists error:', error);
      return false;
    }
  }

  /**
   * Check if code exists (excluding current user)
   */
  async codeExists(code: string, excludeId?: number) {
    try {
      const conditions = [eq(users.code, code.toUpperCase())];
      if (excludeId) {
        const { ne } = await import('drizzle-orm');
        conditions.push(ne(users.id, excludeId));
      }

      const result = await db
        .select({ id: users.id })
        .from(users)
        .where(and(...conditions))
        .limit(1);

      return result.length > 0;
    } catch (error) {
      console.error('UserModel codeExists error:', error);
      return false;
    }
  }

  /**
   * Get user with roles and permissions
   */
  async findWithRoles(userId: number) {
    try {
      // Get user first
      const userResult = await this.findById(userId);
      if (!userResult.success) {
        return userResult;
      }

      // Get user roles and permissions
      const userRolesData = await db
        .select({
          roleId: roles.id,
          roleName: roles.name,
          roleSlug: roles.slug,
          roleDescription: roles.description,
          permissionId: permissions.id,
          permissionName: permissions.name,
          permissionResource: permissions.resource,
          permissionAction: permissions.action,
        })
        .from(userRoles)
        .innerJoin(roles, eq(userRoles.roleId, roles.id))
        .leftJoin(rolePermissions, eq(roles.id, rolePermissions.roleId))
        .leftJoin(permissions, eq(rolePermissions.permissionId, permissions.id))
        .where(
          and(
            eq(userRoles.userId, userId),
            eq(userRoles.isActive, true),
            eq(roles.isActive, true)
          )
        );

      // Group roles and permissions
      const rolesMap = new Map();

      userRolesData.forEach(row => {
        // Add role if not exists
        if (!rolesMap.has(row.roleId)) {
          rolesMap.set(row.roleId, {
            id: row.roleId,
            name: row.roleName,
            slug: row.roleSlug,
            description: row.roleDescription,
            permissions: []
          });
        }

        // Add permission to role
        if (row.permissionId) {
          const permission = {
            id: row.permissionId,
            name: row.permissionName,
            resource: row.permissionResource,
            action: row.permissionAction
          };

          rolesMap.get(row.roleId).permissions.push(permission);
        }
      });

      const result: UserWithRoles = {
        ...userResult.data!,
        roles: Array.from(rolesMap.values())
      };

      return {
        success: true,
        data: result
      };

    } catch (error) {
      console.error('UserModel findWithRoles error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch user with roles'
      };
    }
  }

  /**
   * Get users with their roles (for multiple users)
   */
  async findManyWithRoles(userIds: number[]) {
    try {
      if (userIds.length === 0) {
        return {
          success: true,
          data: []
        };
      }

      // Get users first
      const usersResult = await this.findByIds(userIds);
      if (!usersResult.success) {
        return usersResult;
      }

      // Get all user roles and permissions
      const userRolesData = await db
        .select({
          userId: userRoles.userId,
          roleId: roles.id,
          roleName: roles.name,
          roleSlug: roles.slug,
          roleDescription: roles.description,
          permissionId: permissions.id,
          permissionName: permissions.name,
          permissionResource: permissions.resource,
          permissionAction: permissions.action,
        })
        .from(userRoles)
        .innerJoin(roles, eq(userRoles.roleId, roles.id))
        .leftJoin(rolePermissions, eq(roles.id, rolePermissions.roleId))
        .leftJoin(permissions, eq(rolePermissions.permissionId, permissions.id))
        .where(
          and(
            inArray(userRoles.userId, userIds),
            eq(userRoles.isActive, true),
            eq(roles.isActive, true)
          )
        );

      // Group by user
      const userRolesMap = new Map();

      userRolesData.forEach(row => {
        if (!userRolesMap.has(row.userId)) {
          userRolesMap.set(row.userId, {
            roles: new Map()
          });
        }

        const userData = userRolesMap.get(row.userId);

        // Add role if not exists
        if (!userData.roles.has(row.roleId)) {
          userData.roles.set(row.roleId, {
            id: row.roleId,
            name: row.roleName,
            slug: row.roleSlug,
            description: row.roleDescription,
            permissions: []
          });
        }

        // Add permission
        if (row.permissionId) {
          const permission = {
            id: row.permissionId,
            name: row.permissionName,
            resource: row.permissionResource,
            action: row.permissionAction
          };

          userData.roles.get(row.roleId).permissions.push(permission);
        }
      });

      // Merge with user data
      const result = usersResult.data!.map(user => ({
        ...user,
        roles: Array.from(userRolesMap.get(user.id)?.roles.values() || [])
      }));

      return {
        success: true,
        data: result
      };

    } catch (error) {
      console.error('UserModel findManyWithRoles error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch users with roles'
      };
    }
  }

  /**
   * Update user password
   */
  async updatePassword(userId: number, hashedPassword: string) {
    try {
      const result = await db
        .update(users)
        .set({
          passwordHash: hashedPassword,
          updatedAt: new Date()
        })
        .where(eq(users.id, userId))
        .returning();

      if (!result || result.length === 0) {
        return {
          success: false,
          error: 'User not found'
        };
      }

      return {
        success: true,
        data: result[0],
        message: 'Password updated successfully'
      };

    } catch (error) {
      console.error('UserModel updatePassword error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to update password'
      };
    }
  }
}
