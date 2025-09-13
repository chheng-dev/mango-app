import { db } from '../db';
import { users } from '../db/schemas/users';
import { userRoles } from '../db/schemas/user_roles';
import { roles } from '../db/schemas/roles';
import { permissions } from '../db/schemas/permissions';
import { rolePermissions } from '../db/schemas/role_permission';
import { and, eq, inArray } from 'drizzle-orm';
import { User, NewUser } from '../db/schemas/users';
import BaseService from './BaseService';

export class UserService extends BaseService<User, NewUser> {
  protected table = users;
  protected searchableFields = [users.name, users.email, users.code];

  /**
   * Find user by email
   */
  async findByEmail(email: string): Promise<User | null> {
    const result = await db
      .select()
      .from(users)
      .where(eq(users.email, email.toLowerCase()))
      .limit(1);

    return result[0] || null;
  }

  /**
   * Find user by code
   */
  async findByCode(code: string): Promise<User | null> {
    const result = await db
      .select()
      .from(users)
      .where(eq(users.code, code.toUpperCase()))
      .limit(1);

    return result[0] || null;
  }

  /**
   * Get users with legacy format for backward compatibility
   */
  async findManyLegacy(params: {
    page: number;
    limit: number;
    query?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
    isActive?: boolean;
    isVerified?: boolean;
  }) {
    const filters: any = {};
    if (params.isActive !== undefined) filters.isActive = params.isActive;
    if (params.isVerified !== undefined) filters.isVerified = params.isVerified;

    const result = await this.findMany({
      page: params.page,
      limit: params.limit,
      query: params.query,
      sortBy: params.sortBy,
      sortOrder: params.sortOrder,
      filters
    });

    // Return in the expected legacy format
    return {
      users: result.data,
      pagination: result.pagination
    };
  }

  /**
   * Bulk update user status (wrapper around BaseService method)
   */
  async bulkUpdateStatus(ids: number[], isActive: boolean): Promise<void> {
    await this.bulkUpdate(ids, { isActive });
  }

  /**
   * Search users by query (wrapper around BaseService method)
   */
  async search(query: string, limit: number = 10): Promise<User[]> {
    return super.search(query, limit, { isActive: true });
  }

  /**
   * Include user roles and permissions
   */
  async includeRoles(usersData: User[]): Promise<(User & { roles?: any[], permissions?: any[] })[]> {
    if (!usersData.length) return usersData;

    const userIds = usersData.map(u => u.id);

    const userRolesData = await db.select({
      userId: userRoles.userId,
      role: roles,
      permissions: permissions
    })
    .from(userRoles)
    .innerJoin(roles, eq(userRoles.roleId, roles.id))
    .leftJoin(rolePermissions, eq(roles.id, rolePermissions.roleId))
    .leftJoin(permissions, eq(rolePermissions.permissionId, permissions.id))
    .where(and(
      inArray(userRoles.userId, userIds),
      eq(userRoles.isActive, true),
      eq(roles.isActive, true)
    ));

    // Group by user
    const userRolesMap = new Map();
    userRolesData.forEach(({ userId, role, permissions: permission }) => {
      if (!userRolesMap.has(userId)) {
        userRolesMap.set(userId, { roles: new Map(), permissions: new Set() });
      }

      const userData = userRolesMap.get(userId);

      if (!userData.roles.has(role.id)) {
        userData.roles.set(role.id, { ...role, permissions: [] });
      }

      if (permission) {
        userData.roles.get(role.id).permissions.push(permission);
        userData.permissions.add(permission);
      }
    });

    // Merge with user data
    return usersData.map(user => ({
      ...user,
      roles: Array.from(userRolesMap.get(user.id)?.roles.values() || []),
      permissions: Array.from(userRolesMap.get(user.id)?.permissions || [])
    }));
  }
}

export const userService = new UserService();
