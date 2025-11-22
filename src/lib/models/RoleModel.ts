import { roles } from '../db/schemas/roles';
import { permissions } from '../db/schemas/permissions';
import { rolePermissions } from '../db/schemas/role_permission';
import { users } from '../db/schemas/users';
import { userRoles } from '../db/schemas/user_roles';
import { eq, and, inArray, sql, ne, asc, desc } from 'drizzle-orm';
import { db } from '../db';
import { BaseModel } from "./BaseModel";
import { Permission, Role } from '@/types/rbac';


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

  async findById(id: number, options?: { isSuperAdmin?: boolean }) {
    try {
      const conditions = [eq(roles.id, id)];
      
      if (!options?.isSuperAdmin) {
        conditions.push(ne(roles.slug, 'super-admin'));
      }

      const result = await db
        .select()
        .from(roles)
        .where(and(...conditions))
        .limit(1);

      if (!result || result.length === 0) {
        return {
          success: false,
          error: 'Role not found'
        };
      }

      return {
        success: true,
        data: result[0]
      };
    } catch (error) {
      console.error('RoleModel findById error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch role'
      };
    }
  }

  async getById(id: number): Promise<{ success: boolean; data?: Role; error?: string }> {
    try {
      const [roleWithPermissions] = await db
        .select({
          id: roles.id,
          name: roles.name,
          slug: roles.slug,
          description: roles.description,
          isActive: roles.isActive,
          createdAt: roles.createdAt,
          updatedAt: roles.updatedAt,
          permissions: sql<Permission[]>`
            COALESCE(
              JSON_AGG(
                DISTINCT jsonb_build_object(
                  'id', ${permissions.id},
                  'name', ${permissions.name},
                  'description', ${permissions.description},
                  'resource', ${permissions.resource},
                  'action', ${permissions.action},
                  'createdAt', ${permissions.createdAt},
                  'updatedAt', ${permissions.updatedAt}
                )
              ) FILTER (WHERE ${permissions.id} IS NOT NULL),
              '[]'::json
            )
          `
        })
        .from(roles)
        .leftJoin(rolePermissions, eq(roles.id, rolePermissions.roleId))
        .leftJoin(permissions, eq(rolePermissions.permissionId, permissions.id))
        .where(eq(roles.id, id))
        .groupBy(roles.id, roles.name, roles.slug, roles.description, roles.isActive, roles.createdAt, roles.updatedAt);

      if (!roleWithPermissions) {
        return {
          success: false,
          error: 'Role not found'
        };
      }

      return {
        success: true,
        data: roleWithPermissions as any
      };
    } catch (error) {
      console.error('RoleModel getById error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch role by ID'
      };
    }
  }

  async getByName(name: string): Promise<{ success: boolean; data?: Role; error?: string }> {
    try {
      const [roleWithPermissions] = await db
        .select({
          id: roles.id,
          name: roles.name,
          slug: roles.slug,
          description: roles.description,
          isActive: roles.isActive,
          createdAt: roles.createdAt,
          updatedAt: roles.updatedAt,
          permissions: sql<Permission[]>`
            COALESCE(
              JSON_AGG(
                DISTINCT jsonb_build_object(
                  'id', ${permissions.id},
                  'name', ${permissions.name},
                  'description', ${permissions.description},
                  'resource', ${permissions.resource},
                  'action', ${permissions.action},
                  'createdAt', ${permissions.createdAt},
                  'updatedAt', ${permissions.updatedAt}
                )
              ) FILTER (WHERE ${permissions.id} IS NOT NULL),
              '[]'::json
            )
          `
        })
        .from(roles)
        .leftJoin(rolePermissions, eq(roles.id, rolePermissions.roleId))
        .leftJoin(permissions, eq(rolePermissions.permissionId, permissions.id))
        .where(eq(roles.name, name))
        .groupBy(roles.id, roles.name, roles.slug, roles.description, roles.isActive, roles.createdAt, roles.updatedAt);

      if (!roleWithPermissions) {
        return {
          success: false,
          error: 'Role not found'
        };
      }

      return {
        success: true,
        data: roleWithPermissions as any
      };
    } catch (error) {
      console.error('RoleModel getByName error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch role by name'
      };
    }
  }

  async list() {  
    try {
      const rolesWithPermissions = await db
        .select({
          id: roles.id,
          name: roles.name,
          slug: roles.slug,
          description: roles.description,
          isActive: roles.isActive,
          isSystemRole: roles.isSystemRole,
          createdAt: roles.createdAt,
          updatedAt: roles.updatedAt,
          permissions: sql<Permission[]>`
            COALESCE(
              JSON_AGG(
                DISTINCT jsonb_build_object(
                  'id', ${permissions.id},
                  'name', ${permissions.name},
                  'resource', ${permissions.resource},
                  'action', ${permissions.action},
                  'description', ${permissions.description},
                  'createdAt', ${permissions.createdAt},
                  'updatedAt', ${permissions.updatedAt}
                )
              ) FILTER (WHERE ${permissions.id} IS NOT NULL),
              '[]'::json
            )
          `
        })
        .from(roles)
        .leftJoin(rolePermissions, eq(roles.id, rolePermissions.roleId))
        .leftJoin(permissions, eq(rolePermissions.permissionId, permissions.id))
        .groupBy(roles.id, roles.name, roles.slug, roles.description, roles.isActive, roles.isSystemRole, roles.createdAt, roles.updatedAt)
        .orderBy(asc(roles.name));

      return {
        success: true,
        data: rolesWithPermissions
      };
    } catch (error) {
      console.error('RoleModel list error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch roles'
      };
    }
  }
  
  async findWithPermissions(roleId: number, options?: { isSuperAdmin?: boolean }) {
    try {
      const conditions = [eq(roles.id, roleId)];
      
      if (!options?.isSuperAdmin) {
        conditions.push(ne(roles.slug, 'super-admin'));
      }

      const roleWithPermissions = await db
        .select({
          id: roles.id,
          name: roles.name,
          slug: roles.slug,
          description: roles.description,
          isActive: roles.isActive,
          createdAt: roles.createdAt,
          updatedAt: roles.updatedAt,
          permissions: sql<Permission[]>`
            COALESCE(
              JSON_AGG(
                DISTINCT jsonb_build_object(
                  'id', ${permissions.id},
                  'name', ${permissions.name},
                  'description', ${permissions.description},
                  'resource', ${permissions.resource},
                  'action', ${permissions.action},
                  'createdAt', ${permissions.createdAt},
                  'updatedAt', ${permissions.updatedAt}
                )
              ) FILTER (WHERE ${permissions.id} IS NOT NULL),
              '[]'::json
            )
          `
        })
        .from(roles)
        .leftJoin(rolePermissions, eq(roles.id, rolePermissions.roleId))
        .leftJoin(permissions, eq(rolePermissions.permissionId, permissions.id))
        .where(and(...conditions))
        .groupBy(roles.id, roles.name, roles.slug, roles.description, roles.isActive, roles.createdAt, roles.updatedAt);

      if (!roleWithPermissions.length) {
        return {
          success: false,
          error: 'Role not found'
        };
      }

      return {
        success: true,
        data: roleWithPermissions[0]
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
  async findWithUsers(roleId: number, options?: { isSuperAdmin?: boolean }) {
    try {
      const conditions = [eq(roles.id, roleId)];
      
      // Only hide super-admin if requester is not a super-admin
      if (!options?.isSuperAdmin) {
        conditions.push(ne(roles.slug, 'super-admin'));
      }

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
        .where(and(...conditions));

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
      // Prevent assigning permissions to super-admin role
      const roleResult = await this.findById(roleId);
      if (roleResult.success && roleResult.data?.slug === 'super-admin') {
        return {
          success: false,
          error: 'Cannot modify permissions for super-admin role'
        };
      }

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
      // Prevent updating permissions for super-admin role
      const roleResult = await this.findById(roleId);
      if (roleResult.success && roleResult.data?.slug === 'super-admin') {
        return {
          success: false,
          error: 'Cannot modify permissions for super-admin role'
        };
      }

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
  }  /**
   * Remove permissions from role
   */
  async removePermissions(roleId: number, permissionIds: number[]) {
    try {
      // Prevent removing permissions from super-admin role
      const roleResult = await this.findById(roleId);
      if (roleResult.success && roleResult.data?.slug === 'super-admin') {
        return {
          success: false,
          error: 'Cannot modify permissions for super-admin role'
        };
      }

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
      // Prevent clearing permissions from super-admin role
      const roleResult = await this.findById(roleId);
      if (roleResult.success && roleResult.data?.slug === 'super-admin') {
        return {
          success: false,
          error: 'Cannot modify permissions for super-admin role'
        };
      }

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

  async getUserCount(roleId: number) {  
    try {
      const count = await db
        .select({ count: sql<number>`count(*)` })
        .from(userRoles)
        .where(eq(userRoles.roleId, roleId));

      return count[0]?.count || 0;
    } catch (error) {
      console.error('RoleModel getUserCount error:', error);
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

  /**
   * Override update to prevent modifying super-admin role
   */
  async update(id: number, data: Partial<RoleInsert>) {
    try {
      // Check if this is the super-admin role
      const roleResult = await this.findById(id);
      if (!roleResult.success) {
        return roleResult;
      }

      if (roleResult.data?.slug === 'super-admin') {
        return {
          success: false,
          error: 'Cannot modify super-admin role'
        };
      }

      return super.update(id, data);
    } catch (error) {
      console.error('RoleModel update error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to update role'
      };
    }
  }

  /**
   * Override delete to prevent deleting super-admin role
   */
  async delete(id: number): Promise<{ success: boolean; data?: boolean; error?: string; message?: string }> {
    try {
      // Check if this is the super-admin role
      const roleResult = await this.findById(id);
      if (!roleResult.success) {
        return {
          success: false,
          error: 'Role not found'
        };
      }

      if (roleResult.data?.slug === 'super-admin') {
        return {
          success: false,
          error: 'Cannot delete super-admin role'
        };
      }

      return super.delete(id);
    } catch (error) {
      console.error('RoleModel delete error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to delete role'
      };
    }
  }

  async getAllWithFilters(options: {
    page?: number;
    limit?: number;
    search?: string;
    name?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  } = {}) {
    try {
      const { page = 1, limit = 10, search, name, sortBy = 'name', sortOrder = 'asc' } = options;
      const offset = (page - 1) * limit;

      // Build where conditions
      const conditions: any[] = [];
      
      if (search) {
        conditions.push(
          sql`(
            ${roles.name} ILIKE ${`%${search}%`} OR 
            ${roles.slug} ILIKE ${`%${search}%`} OR
            (${roles.description} IS NOT NULL AND ${roles.description} ILIKE ${`%${search}%`})
          )`
        );
      } else if (name) {
        conditions.push(
          sql`(
            ${roles.name} ILIKE ${`%${name}%`} OR 
            ${roles.slug} ILIKE ${`%${name}%`} OR
            (${roles.description} IS NOT NULL AND ${roles.description} ILIKE ${`%${name}%`})
          )`
        );
      }

      console.log('⚙️ Total conditions built:', conditions.length);
      
      if (search) {
        conditions.push(
          sql`(
            ${roles.name} ILIKE ${`%${search}%`} OR 
            ${roles.slug} ILIKE ${`%${search}%`} OR
            (${roles.description} IS NOT NULL AND ${roles.description} ILIKE ${`%${search}%`})
          )`
        );
      }
      
      if (name) {
        conditions.push(eq(roles.name, name));
      }

      // Build order by
      let orderByClause;
      if (sortBy === 'name') {
        orderByClause = sortOrder === 'desc' ? desc(roles.name) : asc(roles.name);
      } else if (sortBy === 'createdAt') {
        orderByClause = sortOrder === 'desc' ? desc(roles.createdAt) : asc(roles.createdAt);
      } else {
        orderByClause = asc(roles.name);
      }

      // Get total count for pagination
      console.log('📊 Getting total count...');
      const countQuery = db
        .select({ count: sql<number>`count(*)` })
        .from(roles)
        .where(conditions.length > 0 ? and(...conditions) : undefined);
      
      const [{ count: total }] = await countQuery;
      console.log('📈 Total count found:', total);

      // Get filtered and paginated roles with permissions
      console.log('🔍 Executing main query...');
      const rolesWithPermissions = await db
        .select({
          id: roles.id,
          name: roles.name,
          slug: roles.slug,
          description: roles.description,
          isActive: roles.isActive,
          isSystemRole: roles.isSystemRole,
          createdAt: roles.createdAt,
          updatedAt: roles.updatedAt,
          permissions: sql<Permission[]>`
            COALESCE(
              JSON_AGG(
                DISTINCT jsonb_build_object(
                  'id', ${permissions.id},
                  'name', ${permissions.name},
                  'resource', ${permissions.resource},
                  'action', ${permissions.action},
                  'description', ${permissions.description},
                  'createdAt', ${permissions.createdAt},
                  'updatedAt', ${permissions.updatedAt}
                )
              ) FILTER (WHERE ${permissions.id} IS NOT NULL),
              '[]'::json
            )
          `
        })
        .from(roles)
        .leftJoin(rolePermissions, eq(roles.id, rolePermissions.roleId))
        .leftJoin(permissions, eq(rolePermissions.permissionId, permissions.id))
        .where(conditions.length > 0 ? and(...conditions) : undefined)
        .groupBy(roles.id, roles.name, roles.slug, roles.description, roles.isActive, roles.isSystemRole, roles.createdAt, roles.updatedAt)
        .orderBy(orderByClause)
        .limit(limit)
        .offset(offset);

      console.log('✅ Query executed, found', rolesWithPermissions.length, 'roles');
      console.log('🎯 First role (if any):', rolesWithPermissions[0]?.name);

      const totalPages = Math.ceil(total / limit);

      const result = {
        success: true,
        data: rolesWithPermissions,
        pagination: {
          page,
          limit,
          total,
          totalPages
        }
      };

      console.log('📦 Returning result:', { 
        success: result.success, 
        dataLength: result.data.length, 
        pagination: result.pagination 
      });

      return result;
    } catch (error) {
      console.error('RoleModel getAllWithFilters error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch roles with filters'
      };
    }
  }
}
