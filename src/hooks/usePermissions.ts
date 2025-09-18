/**
 * User Permissions Hook - Clean architecture with extensible base
 */

import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/store/authStore';
import { queryKeys } from '@/lib/queries/queryKeys';

// ==================== TYPES ====================

export interface UserPermissionData {
  permissions: string[];
  isSuperAdmin: boolean;
}

export interface UsePermissionsReturn {
  permissions: string[];
  isSuperAdmin: boolean;
  isLoading: boolean;
  isError: boolean;
  hasPermission: (requiredPermissions: readonly string[]) => boolean;
  canPerformAction: (resource: string, action: string) => boolean;
  hasAnyPermission: (permissionList: readonly string[]) => boolean;
  refetch: () => void;
}

// ==================== CONFIGURATION ====================

const PERMISSIONS_CONFIG = {
  staleTime: 5 * 60 * 1000, // 5 minutes
  gcTime: 10 * 60 * 1000, // 10 minutes
  retry: 2,
  refetchOnWindowFocus: false,
  refetchOnMount: true,
} as const;

// ==================== API LAYER ====================

class PermissionsAPI {
  static async fetchUserPermissions(userId: number): Promise<UserPermissionData> {
    console.log('🔍 Fetching permissions for user:', userId);
    
    const response = await fetch(`/api/users/${userId}/permissions`);
    
    if (!response.ok) {
      console.error('❌ API request failed:', response.status, response.statusText);
      throw new Error(`Failed to fetch permissions: ${response.statusText}`);
    }

    const result = await response.json();
    console.log('📊 API response:', result);
    
    if (!result.success) {
      console.error('❌ API returned error:', result.error);
      throw new Error(result.error || 'Failed to fetch permissions');
    }

    const transformedData = this.transformPermissionData(result);
    console.log('✅ Transformed permission data:', transformedData);
    
    return transformedData;
  }

  private static transformPermissionData(result: any): UserPermissionData {
    // Handle super admin case - show permissions but set isSuperAdmin flag
    if (result.meta?.isSuperAdmin) {
      return {
        permissions: result.data?.permissions || [],
        isSuperAdmin: true
      };
    }

    // Handle new API format: result.data.permissions is array of strings
    if (result.data?.permissions && Array.isArray(result.data.permissions)) {
      return {
        permissions: result.data.permissions,
        isSuperAdmin: false
      };
    }

    // Handle legacy format: result.data is array of permission objects
    const permissions = result.data?.map((p: any) => 
      p.permission || `${p.resource}:${p.action}`
    ) || [];
    
    return {
      permissions,
      isSuperAdmin: false
    };
  }
}

// ==================== PERMISSION LOGIC ====================

class PermissionChecker {
  constructor(
    private permissions: string[],
    private isSuperAdmin: boolean
  ) {}

  hasPermission(requiredPermissions: readonly string[]): boolean {
    // Super admin bypass
    if (this.isSuperAdmin) return true;
    
    // Empty requirements = always allowed
    if (requiredPermissions.length === 0) return true;
    
    // Check if user has any required permission
    return requiredPermissions.some(permission => 
      this.permissions.includes(permission)
    );
  }

  canPerformAction(resource: string, action: string): boolean {
    if (this.isSuperAdmin) return true;
    
    const requiredPermission = `${resource}:${action}`;
    return this.permissions.includes(requiredPermission);
  }

  hasAnyPermission(permissionList: readonly string[]): boolean {
    if (this.isSuperAdmin) return true;
    
    return permissionList.some(permission => 
      this.permissions.includes(permission)
    );
  }
}

// ==================== MAIN HOOK ====================

export function usePermissions(): UsePermissionsReturn {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();

  console.log('🔑 usePermissions called:', { 
    userId: user?.id, 
    isAuthenticated, 
    authLoading 
  });

  // Use TanStack Query with configuration
  const query = useQuery({
    queryKey: queryKeys.auth.permissions(user?.id || 0),
    queryFn: () => {
      if (!user?.id) {
        throw new Error('No user ID available for permissions fetch');
      }
      return PermissionsAPI.fetchUserPermissions(user.id);
    },
    enabled: !!(isAuthenticated && user?.id && !authLoading),
    ...PERMISSIONS_CONFIG,
  });

  const {
    data: permissionData,
    isLoading: permissionsLoading,
    isError,
    refetch
  } = query;

  // Extract data with defaults
  const permissions = permissionData?.permissions || [];
  const isSuperAdmin = permissionData?.isSuperAdmin || false;
  const isLoading = authLoading || permissionsLoading;

  console.log('📋 Permission state:', { 
    permissions: permissions.length, 
    isSuperAdmin, 
    isLoading, 
    isError,
    userIdAvailable: !!user?.id
  });

  // Create permission checker instance
  const checker = new PermissionChecker(permissions, isSuperAdmin);

  return {
    permissions,
    isSuperAdmin,
    isLoading,
    isError,
    hasPermission: (requiredPermissions) => {
      const result = checker.hasPermission(requiredPermissions);
      console.log('🔐 Permission check:', { requiredPermissions, result, userHasId: !!user?.id });
      return result;
    },
    canPerformAction: (resource, action) => checker.canPerformAction(resource, action),
    hasAnyPermission: (permissionList) => checker.hasAnyPermission(permissionList),
    refetch: () => refetch(),
  };
}

// ==================== UTILITY EXPORTS ====================

// Export individual components for testing or custom implementations
export { PermissionsAPI, PermissionChecker, PERMISSIONS_CONFIG };
