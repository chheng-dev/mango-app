import { roles } from '../db/schemas/roles';
import { Role, NewRole } from '../db/schemas/roles';
import BaseService from './BaseService';

export class RoleService extends BaseService<Role, NewRole> {
  protected table = roles;
  protected searchableFields = [roles.name, roles.slug, roles.description];

  /**
   * Find role by slug
   */
  async findBySlug(slug: string): Promise<Role | null> {
    const result = await this.search(slug, 1);
    return result.find(role => role.slug === slug) || null;
  }

  /**
   * Get all active roles
   */
  async getActiveRoles() {
    return this.findActive();
  }

  /**
   * Check if role name or slug already exists
   */
  async isNameOrSlugTaken(name: string, slug: string, excludeId?: number): Promise<boolean> {
    const result = await this.search(`${name} ${slug}`, 10);
    
    return result.some(role => 
      (role.name === name || role.slug === slug) && 
      (!excludeId || role.id !== excludeId)
    );
  }
}

export const roleService = new RoleService();
