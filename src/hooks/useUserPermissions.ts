import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/store/authStore';
import { queryKeys } from '@/lib/queries/queryKeys';

export interface UserPermissionData {
  permissions: string[];
  isSuperAdmin: boolean;
}

export interface UseUserPermissionsReturn {
  permissions: string[];
  isSuperAdmin: boolean;
  isLoading: boolean;
  isError: boolean;
  hasPermission: (requiredPermissions: readonly string[]) => boolean;
  canPerformAction: (resource: string, action: string) => boolean;
  hasAnyPermission: (permissionList: readonly string[]) => boolean;
  canPerformAnyAction: (resource: string, actions: readonly string[]) => boolean;
  getResourcePermissions: (resource: string) => string[];
  refetch: () => void;
}

const PERMISSIONS_CONFIG = {
  staleTime: 5 * 60 * 1000, 
  gcTime: 10 * 60 * 1000,
  retry: 2,
  refetchOnWindowFocus: false,
  refetchOnMount: true,
} as const;

class PermissionsAPI {
  static async fetchUserPermissions(userId: number): Promise<UserPermissionData> {    
    try {
      const response = await fetch(`/api/users/${userId}/permissions`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });
      
      if (!response.ok) {
        throw new Error(`Failed to fetch permissions: ${response.statusText}`);
      }

      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch permissions');
      }

      const transformedData = this.transformPermissionData(result);    
      return transformedData;
    } catch (error) {
      console.error('Error fetching user permissions:', error);
      throw error;
    }
  }

  private static transformPermissionData(result: any): UserPermissionData {
    try {
      if (result.meta?.isSuperAdmin) {
        return {
          permissions: result.data?.permissions || [],
          isSuperAdmin: true
        };
      }

      if (result.data?.permissions && Array.isArray(result.data.permissions)) {
        return {
          permissions: result.data.permissions,
          isSuperAdmin: false
        };
      }

      const permissions = result.data?.map((p: any) => 
        p.permission || `${p.resource}:${p.action}`
      ) || [];
      
      return {
        permissions,
        isSuperAdmin: false
      };
    } catch (error) {
      console.error('Error transforming permission data:', error);
      return {
        permissions: [],
        isSuperAdmin: false
      };
    }
  }
}

class PermissionChecker {
  constructor(
    private permissions: string[],
    private isSuperAdmin: boolean
  ) {}

  hasPermission(requiredPermissions: readonly string[]): boolean {
    if (this.isSuperAdmin) return true;
    if (requiredPermissions.length === 0) return true;
    
    return requiredPermissions.some(permission => 
      this.permissions.includes(permission)
    );
  }

  canPerformAction(resource: string, action: string): boolean {
    if (this.isSuperAdmin) return true;
    
    if (!resource || !action) return false;
    
    const requiredPermission = `${resource}:${action}`;
    return this.permissions.includes(requiredPermission);
  }

  hasAnyPermission(permissionList: readonly string[]): boolean {
    if (this.isSuperAdmin) return true;
    
    if (permissionList.length === 0) return true;
    
    return permissionList.some(permission => 
      this.permissions.includes(permission)
    );
  }

  canPerformAnyAction(resource: string, actions: readonly string[]): boolean {
    if (this.isSuperAdmin) return true;
    if (!resource || actions.length === 0) return false;
    
    return actions.some(action => 
      this.permissions.includes(`${resource}:${action}`)
    );
  }

  getResourcePermissions(resource: string): string[] {
    if (!resource) return [];
    
    return this.permissions.filter(permission => 
      permission.startsWith(`${resource}:`)
    );
  }
}

export function useUserPermissions(): UseUserPermissionsReturn {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();

  const query = useQuery({
    queryKey: queryKeys.auth.permissions(user?.id || 0),
    queryFn: () => {
      if (!user?.id) {
        throw new Error('No user ID available for permissions fetch');
      }
      return PermissionsAPI.fetchUserPermissions(user.id);
    },
    enabled: !!(isAuthenticated && user?.id && !authLoading),
    staleTime: PERMISSIONS_CONFIG.staleTime,
    gcTime: PERMISSIONS_CONFIG.gcTime,
    retry: PERMISSIONS_CONFIG.retry,
    refetchOnWindowFocus: PERMISSIONS_CONFIG.refetchOnWindowFocus,
    refetchOnMount: PERMISSIONS_CONFIG.refetchOnMount,
  });

  const {
    data: permissionData,
    isLoading: permissionsLoading,
    isError,
    refetch
  } = query;

  const permissions = permissionData?.permissions || [];
  const isSuperAdmin = permissionData?.isSuperAdmin || false;
  const isLoading = authLoading || permissionsLoading;

  const checker = new PermissionChecker(permissions, isSuperAdmin);

  return {
    permissions,
    isSuperAdmin,
    isLoading,
    isError,
    hasPermission: (requiredPermissions) => {
      if (!isAuthenticated || authLoading || permissionsLoading) {
        return false;
      }
      return checker.hasPermission(requiredPermissions);
    },
    canPerformAction: (resource, action) => {
      if (!isAuthenticated || authLoading || permissionsLoading) {
        return false;
      }
      return checker.canPerformAction(resource, action);
    },
    hasAnyPermission: (permissionList) => {
      if (!isAuthenticated || authLoading || permissionsLoading) {
        return false;
      }
      return checker.hasAnyPermission(permissionList);
    },
    canPerformAnyAction: (resource, actions) => {
      if (!isAuthenticated || authLoading || permissionsLoading) {
        return false;
      }
      return checker.canPerformAnyAction(resource, actions);
    },
    getResourcePermissions: (resource) => {
      if (!isAuthenticated || authLoading || permissionsLoading) {
        return [];
      }
      return checker.getResourcePermissions(resource);
    },
    refetch: () => refetch(),
  };
}

export { PermissionsAPI, PermissionChecker };
