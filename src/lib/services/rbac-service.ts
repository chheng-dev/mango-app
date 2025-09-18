import { and, eq, gt, isNull, or } from "drizzle-orm";
import { db } from "../db";
import { permissions } from "../db/schemas/permissions";
import { rolePermissions } from "../db/schemas/role_permission";
import { roles } from "../db/schemas/roles";
import { userRoles } from "../db/schemas/user_roles";

export async function getUserPermissions(userId: number): Promise<string[]> {
  const now = new Date();

  const rows = await db
    .select({
      slug: permissions.slug,
    })
    .from(permissions)
    .innerJoin(rolePermissions, eq(rolePermissions.permissionId, permissions.id))
    .innerJoin(roles, eq(rolePermissions.roleId, roles.id))
    .innerJoin(userRoles, eq(userRoles.roleId, roles.id))
    .where(
      and(
        eq(userRoles.userId, userId),
        eq(userRoles.isActive, true),
        eq(roles.isActive, true),
        or(isNull(userRoles.expiresAt), gt(userRoles.expiresAt, now))
      )
    );

  const uniq = Array.from(new Set(rows.map((row) => row.slug)));
  return uniq;
}

export async function getUserRoles(userId: number): Promise<string[]> {
  const now = new Date();

  const rows = await db
    .select({
      slug: roles.slug,
    })
    .from(roles)
    .innerJoin(userRoles, eq(userRoles.roleId, roles.id))
    .where(
      and(
        eq(userRoles.userId, userId),
        eq(userRoles.isActive, true),
        eq(roles.isActive, true),
        or(isNull(userRoles.expiresAt), gt(userRoles.expiresAt, now))
      )
    );

  return rows.map((row) => row.slug);
}

export async function hasPermission(userId: number, permissionSlug: string): Promise<boolean> {
  const permissions = await getUserPermissions(userId);
  return permissions.includes(permissionSlug);
}

export async function hasRole(userId: number, roleSlug: string): Promise<boolean> {
  const roles = await getUserRoles(userId);
  return roles.includes(roleSlug);
}

export async function isSuperAdmin(userId: number): Promise<boolean> {
  return hasRole(userId, 'super-admin');
}

export class RBACService {
  static async getUserPermissions(userId: number): Promise<string[]> {
    return getUserPermissions(userId);
  }

  static async getUserRoles(userId: number): Promise<string[]> {
    return getUserRoles(userId);
  }

  static async hasPermission(userId: number, permissionSlug: string): Promise<boolean> {
    return hasPermission(userId, permissionSlug);
  }

  static async hasRole(userId: number, roleSlug: string): Promise<boolean> {
    return hasRole(userId, roleSlug);
  }

  static async isSuperAdmin(userId: number): Promise<boolean> {
    return isSuperAdmin(userId);
  }
}