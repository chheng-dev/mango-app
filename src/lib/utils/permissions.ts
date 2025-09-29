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