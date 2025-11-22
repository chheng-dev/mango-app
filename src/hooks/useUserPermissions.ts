import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/store/authStore';
import { queryKeys } from '@/lib/queries/queryKeys';

export interface UserPermissionData {
  permissions: Array<{
    id: number;
    slug: string;
    name: string;
    resource: string;
    action: string;
  }>;
  permissionSlugs: string[];
  permissionIds: number[];
  isSuperAdmin: boolean;
}

export interface UseUserPermissionsReturn {
  permissions: Array<{
    id: number;
    slug: string;
    name: string;
    resource: string;
    action: string;
  }>;
  permissionSlugs: string[];
  permissionIds: number[];
  isSuperAdmin: boolean;
  isLoading: boolean;
  isError: boolean;
  hasPermission: (requiredPermissions: readonly string[]) => boolean;
  hasPermissionById: (permissionId: number) => boolean;
  hasAnyPermissionById: (permissionIds: readonly number[]) => boolean;
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
      const permissions = result.data?.permissions || [];
      const permissionSlugs = result.data?.permissionSlugs || permissions.map((p: any) => p.slug);
      const permissionIds = result.data?.permissionIds || permissions.map((p: any) => p.id);
      const isSuperAdmin = result.meta?.isSuperAdmin || false;

      return {
        permissions,
        permissionSlugs,
        permissionIds,
        isSuperAdmin
      };
    } catch (error) {
      console.error('Error transforming permission data:', error);
      return {
        permissions: [],
        permissionSlugs: [],
        permissionIds: [],
        isSuperAdmin: false
      };
    }
  }
}

class PermissionChecker {
  private permissionSlugs: string[];
  private permissionIds: Set<number>;
  
  constructor(
    private permissions: Array<{id: number; slug: string; name: string; resource: string; action: string}>,
    private isSuperAdmin: boolean
  ) {
    this.permissionSlugs = permissions.map(p => p.slug);
    this.permissionIds = new Set(permissions.map(p => p.id));
  }

  hasPermission(requiredPermissions: readonly string[]): boolean {
    if (this.isSuperAdmin) return true;
    if (requiredPermissions.length === 0) return true;
    
    return requiredPermissions.some(permission => 
      this.permissionSlugs.includes(permission)
    );
  }

  hasPermissionById(permissionId: number): boolean {
    if (this.isSuperAdmin) return true;
    return this.permissionIds.has(permissionId);
  }

  hasAnyPermissionById(permissionIds: readonly number[]): boolean {
    if (this.isSuperAdmin) return true;
    if (permissionIds.length === 0) return true;
    
    return permissionIds.some(id => this.permissionIds.has(id));
  }

  canPerformAction(resource: string, action: string): boolean {
    if (this.isSuperAdmin) return true;
    
    if (!resource || !action) return false;
    
    const requiredPermission = `${resource}_${action}`; // Changed from : to _
    return this.permissionSlugs.includes(requiredPermission);
  }

  hasAnyPermission(permissionList: readonly string[]): boolean {
    if (this.isSuperAdmin) return true;
    
    if (permissionList.length === 0) return true;
    
    return permissionList.some(permission => 
      this.permissionSlugs.includes(permission)
    );
  }

  canPerformAnyAction(resource: string, actions: readonly string[]): boolean {
    if (this.isSuperAdmin) return true;
    if (!resource || actions.length === 0) return false;
    
    return actions.some(action => 
      this.permissionSlugs.includes(`${resource}_${action}`) // Changed from : to _
    );
  }

  getResourcePermissions(resource: string): string[] {
    if (!resource) return [];
    
    return this.permissionSlugs.filter(permission => 
      permission.startsWith(`${resource}_`) // Changed from : to _
    );
  }
}

export function useUserPermissions(): UseUserPermissionsReturn {
  // const { user, isAuthenticated, isLoading: authLoading } = useAuth();

  // const query = useQuery({
  //   queryKey: queryKeys.auth.permissions(user?.id || 0),
  //   queryFn: () => {
  //     if (!user?.id) {
  //       throw new Error('No user ID available for permissions fetch');
  //     }
  //     return PermissionsAPI.fetchUserPermissions(user.id);
  //   },
  //   enabled: !!(isAuthenticated && user?.id && !authLoading),
  //   staleTime: PERMISSIONS_CONFIG.staleTime,
  //   gcTime: PERMISSIONS_CONFIG.gcTime,
  //   retry: PERMISSIONS_CONFIG.retry,
  //   refetchOnWindowFocus: PERMISSIONS_CONFIG.refetchOnWindowFocus,
  //   refetchOnMount: PERMISSIONS_CONFIG.refetchOnMount,
  // });

  // const {
  //   data: permissionData,
  //   isLoading: permissionsLoading,
  //   isError,
  //   refetch
  // } = query;

  // const permissions = permissionData?.permissions || [];
  // const permissionSlugs = permissionData?.permissionSlugs || [];
  // const permissionIds = permissionData?.permissionIds || [];
  // const isSuperAdmin = permissionData?.isSuperAdmin || false;
  // const isLoading = authLoading || permissionsLoading;

  // const checker = new PermissionChecker(permissions, isSuperAdmin);

  // return {
  //   permissions,
  //   permissionSlugs,
  //   permissionIds,
  //   isSuperAdmin,
  //   isLoading,
  //   isError,
  //   hasPermission: (requiredPermissions) => {
  //     if (!isAuthenticated || authLoading || permissionsLoading) {
  //       return false;
  //     }
  //     return checker.hasPermission(requiredPermissions);
  //   },
  //   hasPermissionById: (permissionId) => {
  //     if (!isAuthenticated || authLoading || permissionsLoading) {
  //       return false;
  //     }
  //     return checker.hasPermissionById(permissionId);
  //   },
  //   hasAnyPermissionById: (permissionIds) => {
  //     if (!isAuthenticated || authLoading || permissionsLoading) {
  //       return false;
  //     }
  //     return checker.hasAnyPermissionById(permissionIds);
  //   },
  //   canPerformAction: (resource, action) => {
  //     if (!isAuthenticated || authLoading || permissionsLoading) {
  //       return false;
  //     }
  //     return checker.canPerformAction(resource, action);
  //   },
  //   hasAnyPermission: (permissionList) => {
  //     if (!isAuthenticated || authLoading || permissionsLoading) {
  //       return false;
  //     }
  //     return checker.hasAnyPermission(permissionList);
  //   },
  //   canPerformAnyAction: (resource, actions) => {
  //     if (!isAuthenticated || authLoading || permissionsLoading) {
  //       return false;
  //     }
  //     return checker.canPerformAnyAction(resource, actions);
  //   },
  //   getResourcePermissions: (resource) => {
  //     if (!isAuthenticated || authLoading || permissionsLoading) {
  //       return [];
  //     }
  //     return checker.getResourcePermissions(resource);
  //   },
  //   refetch: () => refetch(),
  // };
  return {
    permissions: [],
    permissionSlugs: [],
    permissionIds: [],
    isSuperAdmin: false,
    isLoading: false,
    isError: false,
    hasPermission: () => false,
    hasPermissionById: () => false, 
    hasAnyPermissionById: () => false,
    canPerformAction: () => false,
    hasAnyPermission: () => false,
    canPerformAnyAction: () => false,
    getResourcePermissions: () => [],   
    refetch: () => {},    
  };
}

export { PermissionsAPI, PermissionChecker };
