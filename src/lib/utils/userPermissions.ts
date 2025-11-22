/**
 * User Permissions Utility
 * Provides helper functions for checking user permissions
 * Can be used with permission arrays directly or with hooks
 */

export interface UserPermissionsData {
  permissions: string[];
  permissionSlugs: string[];
  roles?: string[];
  isSuperAdmin: boolean;
}

/**
 * UserPermissions class - Utility for checking permissions
 * Can be instantiated with permission data and used for checking
 */
export class UserPermissions {
  private permissionSlugs: Set<string>;
  private permissions: string[];
  private roles: string[];
  private isSuperAdmin: boolean;

  constructor(data: UserPermissionsData) {
    this.permissions = data.permissions || [];
    this.permissionSlugs = new Set(data.permissionSlugs || data.permissions || []);
    this.roles = data.roles || [];
    this.isSuperAdmin = data.isSuperAdmin || false;
  }

  /**
   * Check if user has at least one of the required permissions (OR logic)
   * @param requiredPermissions - Array of permission slugs to check
   * @returns true if user has at least one permission
   */
  hasPermission(requiredPermissions: readonly string[]): boolean {
    if (this.isSuperAdmin) {
      return true;
    }

    if (requiredPermissions.length === 0) {
      return true;
    }

    return requiredPermissions.some((permission) =>
      this.permissionSlugs.has(permission)
    );
  }

  /**
   * Check if user has all of the required permissions (AND logic)
   * @param requiredPermissions - Array of permission slugs to check
   * @returns true if user has all permissions
   */
  hasAllPermissions(requiredPermissions: readonly string[]): boolean {
    if (this.isSuperAdmin) {
      return true;
    }

    if (requiredPermissions.length === 0) {
      return true;
    }

    return requiredPermissions.every((permission) =>
      this.permissionSlugs.has(permission)
    );
  }

  /**
   * Check if user has any of the permissions in the list (OR logic)
   * Alias for hasPermission for clarity
   */
  hasAnyPermission(permissionList: readonly string[]): boolean {
    return this.hasPermission(permissionList);
  }

  /**
   * Check if user can perform a specific action on a resource
   * Format: {resource}_{action} (e.g., 'user_read', 'role_create')
   * @param resource - The resource name
   * @param action - The action name
   * @returns true if user has the permission
   */
  canPerformAction(resource: string, action: string): boolean {
    if (this.isSuperAdmin) {
      return true;
    }

    if (!resource || !action) {
      return false;
    }

    const requiredPermission = `${resource}_${action}`;
    return this.permissionSlugs.has(requiredPermission);
  }

  /**
   * Check if user can perform any of the specified actions on a resource
   * @param resource - The resource name
   * @param actions - Array of action names
   * @returns true if user can perform any of the actions
   */
  canPerformAnyAction(resource: string, actions: readonly string[]): boolean {
    if (this.isSuperAdmin) {
      return true;
    }

    if (!resource || actions.length === 0) {
      return false;
    }

    return actions.some((action) =>
      this.permissionSlugs.has(`${resource}_${action}`)
    );
  }

  /**
   * Check if user can perform all of the specified actions on a resource
   * @param resource - The resource name
   * @param actions - Array of action names
   * @returns true if user can perform all actions
   */
  canPerformAllActions(resource: string, actions: readonly string[]): boolean {
    if (this.isSuperAdmin) {
      return true;
    }

    if (!resource || actions.length === 0) {
      return false;
    }

    return actions.every((action) =>
      this.permissionSlugs.has(`${resource}_${action}`)
    );
  }

  /**
   * Get all permissions for a specific resource
   * @param resource - The resource name
   * @returns Array of permission slugs for the resource
   */
  getResourcePermissions(resource: string): string[] {
    if (!resource) {
      return [];
    }

    return this.permissions.filter((permission) =>
      permission.startsWith(`${resource}_`)
    );
  }

  /**
   * Check if user has a specific role
   * @param roleName - The role name to check
   * @returns true if user has the role
   */
  hasRole(roleName: string): boolean {
    if (this.isSuperAdmin) {
      return true;
    }

    return this.roles.includes(roleName);
  }

  /**
   * Check if user has any of the specified roles
   * @param roleNames - Array of role names
   * @returns true if user has at least one role
   */
  hasAnyRole(roleNames: readonly string[]): boolean {
    if (this.isSuperAdmin) {
      return true;
    }

    if (roleNames.length === 0) {
      return true;
    }

    return roleNames.some((role) => this.roles.includes(role));
  }

  /**
   * Get all user permissions
   * @returns Array of all permission slugs
   */
  getAllPermissions(): string[] {
    return [...this.permissionSlugs];
  }

  /**
   * Get all user roles
   * @returns Array of all role names
   */
  getAllRoles(): string[] {
    return [...this.roles];
  }

  /**
   * Check if user is super admin
   * @returns true if user is super admin
   */
  getIsSuperAdmin(): boolean {
    return this.isSuperAdmin;
  }

  /**
   * Check if permission data is loaded/valid
   * @returns true if permissions are available
   */
  isValid(): boolean {
    return this.permissions.length > 0 || this.isSuperAdmin;
  }
}

/**
 * Create a UserPermissions instance from permission data
 * @param data - User permissions data
 * @returns UserPermissions instance
 */
export function createUserPermissions(data: UserPermissionsData): UserPermissions {
  return new UserPermissions(data);
}

/**
 * Standalone permission checking functions
 * Can be used without creating an instance
 */

/**
 * Check if user has permission (standalone function)
 */
export function checkPermission(
  userPermissions: string[],
  requiredPermissions: readonly string[],
  isSuperAdmin: boolean = false
): boolean {
  if (isSuperAdmin) {
    return true;
  }

  if (requiredPermissions.length === 0) {
    return true;
  }

  const permissionSet = new Set(userPermissions);
  return requiredPermissions.some((permission) => permissionSet.has(permission));
}

/**
 * Check if user has all permissions (standalone function)
 */
export function checkAllPermissions(
  userPermissions: string[],
  requiredPermissions: readonly string[],
  isSuperAdmin: boolean = false
): boolean {
  if (isSuperAdmin) {
    return true;
  }

  if (requiredPermissions.length === 0) {
    return true;
  }

  const permissionSet = new Set(userPermissions);
  return requiredPermissions.every((permission) => permissionSet.has(permission));
}

/**
 * Check if user can perform action (standalone function)
 */
export function checkCanPerformAction(
  userPermissions: string[],
  resource: string,
  action: string,
  isSuperAdmin: boolean = false
): boolean {
  if (isSuperAdmin) {
    return true;
  }

  if (!resource || !action) {
    return false;
  }

  const requiredPermission = `${resource}_${action}`;
  return userPermissions.includes(requiredPermission);
}



