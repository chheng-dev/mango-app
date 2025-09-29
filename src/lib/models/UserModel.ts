import { users } from '../db/schemas/users';
import { userRoles } from '../db/schemas/user_roles';
import { roles } from '../db/schemas/roles';
import { permissions } from '../db/schemas/permissions';
import { rolePermissions } from '../db/schemas/role_permission';
import { eq, and, ne } from 'drizzle-orm';
import { db } from '../db';
import { BaseModel, ModelResponse } from './baseModel';

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

export class UserModel extends BaseModel<UserSelect, UserInsert> {
  protected tableName = 'users';
  protected table = users;
  
  constructor() {
    super(
      [users.name, users.email, users.code],
      ['name', 'email', 'code'] 
    );
  }
  
  async findByEmail(email: string): Promise<ModelResponse<UserSelect>> {
    return this.findByField('email', email);
  }

  async findByCode(code: string): Promise<ModelResponse<UserSelect>> {
    return this.findByField('code', code, {
      transformValue: (val) => String(val).toUpperCase()
    });
  }

  async findWithRoles(userId: number): Promise<ModelResponse<UserWithRoles>> {
    try {
      const userResult = await this.findById(userId);
      if (!userResult.success) {
        return userResult as ModelResponse<UserWithRoles>;
      }

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

      const rolesMap = new Map();

      userRolesData.forEach(row => {
        if (!rolesMap.has(row.roleId)) {
          rolesMap.set(row.roleId, {
            id: row.roleId,
            name: row.roleName,
            slug: row.roleSlug,
            description: row.roleDescription,
            permissions: []
          });
        }

        if (row.permissionId) {
          rolesMap.get(row.roleId).permissions.push({
            id: row.permissionId,
            name: row.permissionName,
            resource: row.permissionResource,
            action: row.permissionAction
          });
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

  async emailExists(email: string, excludeId?: number): Promise<boolean> {
    try {
      const conditions = [eq(users.email, email.toLowerCase())];
      if (excludeId) {
        conditions.push(ne(users.id, excludeId));
      }

      const result = await db
        .select({ id: users.id })
        .from(users)
        .where(conditions.length > 1 ? and(...conditions) : conditions[0])
        .limit(1);
      
      return result.length > 0;
    } catch (error) {
      console.error('UserModel emailExists error:', error);
      return false;
    }
  }

  async codeExists(code: string, excludeId?: number): Promise<boolean> {
    try {
      const conditions = [eq(users.code, code.toUpperCase())];
      if (excludeId) {
        conditions.push(ne(users.id, excludeId));
      }

      const result = await db
        .select({ id: users.id })
        .from(users)
        .where(conditions.length > 1 ? and(...conditions) : conditions[0])
        .limit(1);
      
      return result.length > 0;
    } catch (error) {
      console.error('UserModel codeExists error:', error);
      return false;
    }
  }

  async updatePassword(userId: number, hashedPassword: string): Promise<ModelResponse<UserSelect>> {
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

  async getCurrentUser(userId: number): Promise<ModelResponse<UserSelect>> {
    try {
      const result = await this.findById(userId);
      if (!result.success) {
        return result;
      }

      try {
        const userWithRolesResult = await this.getUserWithRoles(userId);
        if (userWithRolesResult.success) {
          return {
            success: true,
            data: userWithRolesResult.data as UserSelect,
            message: 'Fetched current user with roles'
          };
        } else {
          return {
            success: true,
            data: result.data!,
            message: 'Fetched current user without roles'
          };
        } 
      } catch (roleError) {
        console.error('Error fetching user roles:', roleError);
        return {
          success: true,
          data: result.data!,
          message: 'Fetched current user without roles'
        };
      }
    } catch (error) {
      console.error('UserModel getCurrentUser error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch current user'
      };
    }
  }

  async getUserWithRoles(userId: number): Promise<ModelResponse<UserWithRoles>> {
    return this.findWithRoles(userId);
  }
}
