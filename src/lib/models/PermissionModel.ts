import { BaseModel } from './BaseModel';
import { permissions } from '../db/schemas/permissions';
import { eq, and, ilike, ne, or, sql } from 'drizzle-orm';
import { db } from '../db';

export type PermissionSelect = typeof permissions.$inferSelect;
export type PermissionInsert = typeof permissions.$inferInsert;

/**
 * PermissionModel - Data Access Layer for Permissions
 * 
 * Handles direct database operations for permissions
 */
export class PermissionModel extends BaseModel<PermissionSelect, PermissionInsert> {
  protected tableName = 'permissions';
  protected table = permissions;
  
  constructor() {
    super(
      [permissions.name, permissions.slug, permissions.resource, permissions.action, permissions.description], // searchable fields
      ['name', 'resource', 'action'] // required fields
    );
  }

  /**
   * Find permission by slug
   */
  async findBySlug(slug: string) {
    try {
      const result = await db
        .select()
        .from(permissions)
        .where(eq(permissions.slug, slug))
        .limit(1);

      if (result.length === 0) {
        return {
          success: false,
          error: 'Permission not found'
        };
      }

      return {
        success: true,
        data: result[0]
      };
    } catch (error) {
      console.error('PermissionModel findBySlug error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Database query failed'
      };
    }
  }

  /**
   * Find permission by name
   */
  async findByName(name: string) {
    try {
      const result = await db
        .select()
        .from(permissions)
        .where(eq(permissions.name, name))
        .limit(1);

      if (result.length === 0) {
        return {
          success: false,
          error: 'Permission not found'
        };
      }

      return {
        success: true,
        data: result[0]
      };
    } catch (error) {
      console.error('PermissionModel findByName error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Database query failed'
      };
    }
  }

  /**
   * Find permissions by resource
   */
  async findByResource(resource: string) {
    try {
      const result = await db
        .select()
        .from(permissions)
        .where(eq(permissions.resource, resource))
        .orderBy(permissions.action);

      return {
        success: true,
        data: result
      };
    } catch (error) {
      console.error('PermissionModel findByResource error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Database query failed'
      };
    }
  }

  /**
   * Find permissions by resource and action combination
   */
  async findByResourceAction(resource: string, action: string) {
    try {
      const result = await db
        .select()
        .from(permissions)
        .where(and(
          eq(permissions.resource, resource),
          eq(permissions.action, action)
        ))
        .limit(1);

      if (result.length === 0) {
        return {
          success: false,
          error: 'Permission not found'
        };
      }

      return {
        success: true,
        data: result[0]
      };
    } catch (error) {
      console.error('PermissionModel findByResourceAction error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Database query failed'
      };
    }
  }

  /**
   * Get all unique resources
   */
  async getUniqueResources() {
    try {
      const result = await db
        .selectDistinct({ resource: permissions.resource })
        .from(permissions)
        .orderBy(permissions.resource);

      return {
        success: true,
        data: result.map(r => r.resource)
      };
    } catch (error) {
      console.error('PermissionModel getUniqueResources error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Database query failed'
      };
    }
  }

  /**
   * Get all unique actions for a resource
   */
  async getUniqueActionsForResource(resource: string) {
    try {
      const result = await db
        .selectDistinct({ action: permissions.action })
        .from(permissions)
        .where(eq(permissions.resource, resource))
        .orderBy(permissions.action);

      return {
        success: true,
        data: result.map(a => a.action)
      };
    } catch (error) {
      console.error('PermissionModel getUniqueActionsForResource error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Database query failed'
      };
    }
  }

  /**
   * Search permissions by query (name, slug, resource, action, or description)
   */
  async searchPermissions(query: string, limit: number = 50) {
    try {
      const searchPattern = `%${query}%`;
      
      const result = await db
        .select()
        .from(permissions)
        .where(
          or(
            ilike(permissions.name, searchPattern),
            ilike(permissions.slug, searchPattern),
            ilike(permissions.resource, searchPattern),
            ilike(permissions.action, searchPattern),
            ilike(permissions.description, searchPattern)
          )
        )
        .orderBy(permissions.resource, permissions.action)
        .limit(limit);

      return {
        success: true,
        data: result
      };
    } catch (error) {
      console.error('PermissionModel searchPermissions error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Database query failed'
      };
    }
  }

  /**
   * Check if slug exists (excluding specific ID)
   */
  async slugExists(slug: string, excludeId?: number) {
    try {
      let whereClause;
      
      if (excludeId) {
        whereClause = and(
          eq(permissions.slug, slug),
          ne(permissions.id, excludeId)
        );
      } else {
        whereClause = eq(permissions.slug, slug);
      }

      const result = await db
        .select({ id: permissions.id })
        .from(permissions)
        .where(whereClause)
        .limit(1);

      return {
        success: true,
        data: result.length > 0
      };
    } catch (error) {
      console.error('PermissionModel slugExists error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Database query failed'
      };
    }
  }

  /**
   * Check if name exists (excluding specific ID)
   */
  async nameExists(name: string, excludeId?: number) {
    try {
      let whereClause;
      
      if (excludeId) {
        whereClause = and(
          eq(permissions.name, name),
          ne(permissions.id, excludeId)
        );
      } else {
        whereClause = eq(permissions.name, name);
      }

      const result = await db
        .select({ id: permissions.id })
        .from(permissions)
        .where(whereClause)
        .limit(1);

      return {
        success: true,
        data: result.length > 0
      };
    } catch (error) {
      console.error('PermissionModel nameExists error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Database query failed'
      };
    }
  }

  /**
   * Get permissions grouped by resource
   */
  async getPermissionsGroupedByResource() {
    try {
      const result = await db
        .select()
        .from(permissions)
        .orderBy(permissions.resource, permissions.action);

      // Group by resource
      const grouped: Record<string, PermissionSelect[]> = {};
      result.forEach(permission => {
        if (!grouped[permission.resource]) {
          grouped[permission.resource] = [];
        }
        grouped[permission.resource].push(permission);
      });

      return {
        success: true,
        data: grouped
      };
    } catch (error) {
      console.error('PermissionModel getPermissionsGroupedByResource error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Database query failed'
      };
    }
  }
}
