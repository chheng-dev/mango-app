/**
 * Permission utilities for RBAC system
 * Handles resource:action permission format and super admin logic
 */

export interface UserPermissionData {
  permissions: string[];
  isSuperAdmin: boolean;
}

export function hasPermission(
  userPermissions: string[],
  requiredPermissions: readonly string[],
  isSuperAdmin: boolean = false
): boolean {
  // Super admin has all permissions
  if (isSuperAdmin) {
    return true;
  }

  // If no permissions required, allow access
  if (requiredPermissions.length === 0) {
    return true;
  }

  // Check if user has any of the required permissions
  return requiredPermissions.some(permission => userPermissions.includes(permission));
}

export function canPerformAction(
  userPermissions: string[],
  resource: string,
  action: string,
  isSuperAdmin: boolean = false
): boolean {
  // Super admin can perform any action
  if (isSuperAdmin) {
    return true;
  }

  const requiredPermission = `${resource}:${action}`;
  return userPermissions.includes(requiredPermission);
}

// Cache for user permissions to avoid repeated API calls
const permissionCache = new Map<number, { data: UserPermissionData; timestamp: number }>();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

/**
 * Get user permissions from API with caching
 * @param userId - User ID to fetch permissions for
 * @param forceRefresh - Whether to bypass cache and fetch fresh data
 * @returns Promise with user permission data
 */
export async function fetchUserPermissions(userId: number, forceRefresh: boolean = false): Promise<UserPermissionData> {
  // Check cache first (unless forcing refresh)
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

    // Check if user is super admin
    if (result.meta?.isSuperAdmin) {
      permissionData = {
        permissions: [],
        isSuperAdmin: true
      };
    } else {
      // Extract permissions in resource:action format
      const permissions = result.data.map((p: any) => p.permission || `${p.resource}:${p.action}`);
      
      permissionData = {
        permissions,
        isSuperAdmin: false
      };
    }

    // Cache the result
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

/**
 * Clear permission cache for a specific user or all users
 * @param userId - Optional user ID to clear cache for specific user
 */
export function clearPermissionCache(userId?: number): void {
  if (userId) {
    permissionCache.delete(userId);
  } else {
    permissionCache.clear();
  }
}

/**
 * Hook for using permissions in React components
 * @deprecated Use the dedicated usePermissions hook from '@/hooks/usePermissions' instead
 */
export function usePermissionCheck() {
  return {
    hasPermission,
    canPerformAction,
    fetchUserPermissions,
    clearPermissionCache
  };
}

/**
 * Common permission combinations for easier use
 */
export const PERMISSION_COMBINATIONS = {
  // User management
  USER_MANAGEMENT: ['users:read', 'users:list'],
  USER_FULL: ['users:read', 'users:list', 'users:create', 'users:update', 'users:delete'],
  
  // Role management
  ROLE_MANAGEMENT: ['roles:read', 'roles:list'],
  ROLE_FULL: ['roles:read', 'roles:list', 'roles:create', 'roles:update', 'roles:delete'],
  
  // Permission management
  PERMISSION_MANAGEMENT: ['permissions:read', 'permissions:list'],
  PERMISSION_FULL: ['permissions:read', 'permissions:list', 'permissions:create', 'permissions:update', 'permissions:delete'],
  
  // RBAC dashboard
  RBAC_ACCESS: ['rbac:read', 'permissions:read', 'roles:read'],
  
  // Business features
  PRODUCT_MANAGEMENT: ['products:read', 'products:list'],
  REPORT_ACCESS: ['reports:read', 'reports:generate'],
  
  // Events
  EVENT_MANAGEMENT: ['events:read', 'events:manage'],
  CALENDAR_ACCESS: ['calendar:read'],
  SCHEDULE_ACCESS: ['schedule:read'],
} as const;
