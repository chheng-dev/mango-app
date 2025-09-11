import { permissions } from '../db/schemas/permissions';
import { Permission, NewPermission } from '../db/schemas/permissions';
import BaseService from './BaseService';

export class PermissionService extends BaseService<Permission, NewPermission> {
  protected table = permissions;
  protected searchableFields = [permissions.name, permissions.slug, permissions.description];

  /**
   * Find permission by slug
   */
  async findBySlug(slug: string): Promise<Permission | null> {
    const result = await this.search(slug, 1);
    return result.find(permission => permission.slug === slug) || null;
  }

  /**
   * Get all active permissions
   */
  async getActivePermissions() {
    return this.findActive();
  }

  /**
   * Get permissions by category
   */
  async getPermissionsByCategory(category: string) {
    return this.findMany({
      page: 1,
      limit: 100,
      filters: { category, isActive: true }
    });
  }

  /**
   * Check if permission name or slug already exists
   */
  async isNameOrSlugTaken(name: string, slug: string, excludeId?: number): Promise<boolean> {
    const result = await this.search(`${name} ${slug}`, 10);
    
    return result.some(permission => 
      (permission.name === name || permission.slug === slug) && 
      (!excludeId || permission.id !== excludeId)
    );
  }
}

export const permissionService = new PermissionService();
