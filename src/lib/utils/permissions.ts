import { PERMISSIONS } from '@/lib/constants/permissions';
import { AuthContext } from '@/lib/types/auth';

export interface UserPermissionData {
  permissions: string[];
  isSuperAdmin: boolean;
}

export function hasPermission(
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

  return requiredPermissions.some(permission => userPermissions.includes(permission));
}
export class PermissionChecker {
  private permissions: string[];
  private userId: number;

  constructor(auth: AuthContext) {
    this.permissions = auth.user.permissions || [];
    this.userId = auth.user.id;
  }

  hasPermission(permission: string): boolean {
    return this.permissions.includes(permission);
  }

  hasAnyPermission(permissions: string[]): boolean {
    return permissions.some(permission => this.hasPermission(permission));
  }

  /**
   * Check if user has all of the provided permissions
   */
  hasAllPermissions(permissions: string[]): boolean {
    return permissions.every(permission => this.hasPermission(permission));
  }

  /**
   * Check if user is accessing their own resource
   */
  isOwnResource(resourceUserId: number): boolean {
    return this.userId === resourceUserId;
  }

  /**
   * Check if user can read any user (admin) or their own profile
   */
  canReadUser(targetUserId: number): boolean {
    const canReadAnyUser = this.hasPermission(PERMISSIONS.USER_READ);
    const canReadOwnProfile = this.isOwnResource(targetUserId) && this.hasPermission(PERMISSIONS.PROFILE_READ);
    
    return canReadAnyUser || canReadOwnProfile;
  }

  /**
   * Check if user can update any user (admin) or their own profile
   */
  canUpdateUser(targetUserId: number): boolean {
    const canUpdateAnyUser = this.hasPermission(PERMISSIONS.USER_UPDATE);
    const canUpdateOwnProfile = this.isOwnResource(targetUserId) && this.hasPermission(PERMISSIONS.PROFILE_UPDATE);
    
    return canUpdateAnyUser || canUpdateOwnProfile;
  }

  /**
   * Check if user can delete users (admin only)
   */
  canDeleteUser(): boolean {
    return this.hasPermission(PERMISSIONS.USER_DELETE);
  }

  /**
   * Check if user can create users (admin only)
   */
  canCreateUser(): boolean {
    return this.hasPermission(PERMISSIONS.USER_CREATE);
  }

  /**
   * Check if user can list all users (admin only)
   */
  canListUsers(): boolean {
    return this.hasPermission(PERMISSIONS.USER_READ);
  }
}

export function canPerformAction(
  userPermissions: string[],
  resource: string,
  action: string,
  isSuperAdmin: boolean = false
): boolean {
  if (isSuperAdmin) {
    return true;
  }

  const requiredPermission = `${resource}:${action}`;
  return userPermissions.includes(requiredPermission);
}

const permissionCache = new Map<number, { data: UserPermissionData; timestamp: number }>();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export async function fetchUserPermissions(userId: number, forceRefresh: boolean = false): Promise<UserPermissionData> {
  if (!forceRefresh && permissionCache.has(userId)) {
    const cached = permissionCache.get(userId)!;
    const isExpired = Date.now() - cached.timestamp > CACHE_DURATION;
    
    if (!isExpired) {
      return cached.data;
    }
  }

  try {
    const response = await fetch(`/api/users/${userId}/permissions`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch permissions');
    }

    const result = await response.json();
    
    if (!result.success) {
      throw new Error(result.error || 'Failed to fetch permissions');
    }

    let permissionData: UserPermissionData;

    if (result.meta?.isSuperAdmin) {
      permissionData = {
        permissions: [],
        isSuperAdmin: true
      };
    } else {
      const permissions = result.data.map((p: unknown) => (p as { permission?: string; resource?: string; action?: string }).permission || `${(p as { resource?: string; action?: string }).resource}:${(p as { resource?: string; action?: string }).action}`);
      
      permissionData = {
        permissions,
        isSuperAdmin: false
      };
    }

    permissionCache.set(userId, {
      data: permissionData,
      timestamp: Date.now()
    });

    return permissionData;
  } catch (error) {
    console.error('Failed to fetch user permissions:', error);
    
    // Return empty permissions on error
    const errorData: UserPermissionData = {
      permissions: [],
      isSuperAdmin: false
    };

    return errorData;
  }
}

export function clearPermissionCache(userId?: number): void {
  if (userId) {
    permissionCache.delete(userId);
  } else {
    permissionCache.clear();
  }
}

export function usePermissionCheck() {
  return {
    hasPermission,
    canPerformAction,
    fetchUserPermissions,
    clearPermissionCache
  };
}

/**
 * Resource access patterns for different entities
 */
export enum AccessPattern {
  ADMIN_ONLY = 'admin_only',           // Only admins can access
  ADMIN_OR_SELF = 'admin_or_self',     // Admins can access any, users can access their own
  AUTHENTICATED = 'authenticated',      // Any authenticated user can access
  PUBLIC = 'public'                    // Anyone can access
}

/**
 * Generic resource permission configuration
 */
export interface ResourcePermissionConfig {
  READ: {
    pattern: AccessPattern;
    adminPermission: string;
    selfPermission?: string;
  };
  UPDATE: {
    pattern: AccessPattern;
    adminPermission: string;
    selfPermission?: string;
  };
  DELETE: {
    pattern: AccessPattern;
    adminPermission: string;
    selfPermission?: string;
  };
  CREATE: {
    pattern: AccessPattern;
    adminPermission: string;
  };
  LIST: {
    pattern: AccessPattern;
    adminPermission: string;
  };
}

/**
 * User resource permissions
 */
export const USER_PERMISSIONS: ResourcePermissionConfig = {
  READ: {
    pattern: AccessPattern.ADMIN_OR_SELF,
    adminPermission: PERMISSIONS.USER_READ,
    selfPermission: PERMISSIONS.PROFILE_READ
  },
  UPDATE: {
    pattern: AccessPattern.ADMIN_OR_SELF,
    adminPermission: PERMISSIONS.USER_UPDATE,
    selfPermission: PERMISSIONS.PROFILE_UPDATE
  },
  DELETE: {
    pattern: AccessPattern.ADMIN_ONLY,
    adminPermission: PERMISSIONS.USER_DELETE
  },
  CREATE: {
    pattern: AccessPattern.ADMIN_ONLY,
    adminPermission: PERMISSIONS.USER_CREATE
  },
  LIST: {
    pattern: AccessPattern.ADMIN_ONLY,
    adminPermission: PERMISSIONS.USER_READ
  }
} as const;

/**
 * Role resource permissions
 */
export const ROLE_PERMISSIONS: ResourcePermissionConfig = {
  READ: {
    pattern: AccessPattern.ADMIN_ONLY,
    adminPermission: PERMISSIONS.ROLE_READ
  },
  UPDATE: {
    pattern: AccessPattern.ADMIN_ONLY,
    adminPermission: PERMISSIONS.ROLE_UPDATE
  },
  DELETE: {
    pattern: AccessPattern.ADMIN_ONLY,
    adminPermission: PERMISSIONS.ROLE_DELETE
  },
  CREATE: {
    pattern: AccessPattern.ADMIN_ONLY,
    adminPermission: PERMISSIONS.ROLE_CREATE
  },
  LIST: {
    pattern: AccessPattern.ADMIN_ONLY,
    adminPermission: PERMISSIONS.ROLE_READ
  }
} as const;

/**
 * Permission resource permissions (meta-permissions)
 */
export const PERMISSION_PERMISSIONS: ResourcePermissionConfig = {
  READ: {
    pattern: AccessPattern.ADMIN_ONLY,
    adminPermission: PERMISSIONS.PERMISSION_READ
  },
  UPDATE: {
    pattern: AccessPattern.ADMIN_ONLY,
    adminPermission: PERMISSIONS.PERMISSION_UPDATE
  },
  DELETE: {
    pattern: AccessPattern.ADMIN_ONLY,
    adminPermission: PERMISSIONS.PERMISSION_DELETE
  },
  CREATE: {
    pattern: AccessPattern.ADMIN_ONLY,
    adminPermission: PERMISSIONS.PERMISSION_CREATE
  },
  LIST: {
    pattern: AccessPattern.ADMIN_ONLY,
    adminPermission: PERMISSIONS.PERMISSION_READ
  }
} as const;

/**
 * Generic permission validator for resources
 */
export function validateResourceAccess<T extends ResourcePermissionConfig>(
  checker: PermissionChecker,
  resourceConfig: T,
  operation: keyof T,
  targetUserId?: number
): { allowed: boolean; reason?: string } {
  const config = resourceConfig[operation] as any;

  if (config.pattern === AccessPattern.ADMIN_ONLY) {
    const hasAdminPermission = checker.hasPermission(config.adminPermission);
    return {
      allowed: hasAdminPermission,
      reason: hasAdminPermission ? undefined : `Missing ${config.adminPermission} permission`
    };
  }

  if (config.pattern === AccessPattern.ADMIN_OR_SELF) {
    if (!targetUserId) {
      return { allowed: false, reason: 'Target resource ID required for this operation' };
    }
    
    const canAccessAsAdmin = checker.hasPermission(config.adminPermission);
    const canAccessAsSelf = checker.isOwnResource(targetUserId) && 
                           config.selfPermission && 
                           checker.hasPermission(config.selfPermission);
    
    const allowed = canAccessAsAdmin || canAccessAsSelf;
    return {
      allowed,
      reason: allowed ? undefined : `Missing ${config.adminPermission} permission${config.selfPermission ? ` or access to own resource with ${config.selfPermission}` : ''}`
    };
  }

  return { allowed: false, reason: 'Unknown access pattern' };
}