import { permissions } from '../db/schemas/permissions';
import { eq, and, ilike, ne, or } from 'drizzle-orm';
import { db } from '../db';
import { BaseModel } from './BaseModel';
import { Permission } from '@/types/rbac';

export type PermissionSelect = typeof permissions.$inferSelect;
export type PermissionInsert = typeof permissions.$inferInsert;

export class PermissionModel extends BaseModel<PermissionSelect, PermissionInsert> {
  protected tableName = 'permissions';
  protected table = permissions;
  
  constructor() {
    super(
      ['name', 'resource', 'action'] 
    );
  }

  async getAll(): Promise<Permission[]> {
    const result = await db
      .select()
      .from(permissions)
      .orderBy(permissions.resource, permissions.action);

    return result as Permission[]
  } 

  async getPermissionByResource(resource: string): Promise<PermissionSelect[]> {
    const result = await db
      .select()
      .from(permissions)
      .where(eq(permissions.resource, resource))
      .orderBy(permissions.action);

    return result as PermissionSelect[];
  }

  async getPermissionsByResource(resource: string): Promise<Permission[]> {
    return await db
      .select()
      .from(permissions)
      .where(eq(permissions.resource, resource))
      .orderBy(permissions.action) as Permission[];
  }

  async getPermissionByResourceAction(resource: string, action: string): Promise<PermissionSelect | null> {
    const result = await db
      .select()
      .from(permissions)
      .where(
        and(
          eq(permissions.resource, resource),
          eq(permissions.action, action)
        )
      )
      .limit(1);

    return result[0] || null;
  }
}
