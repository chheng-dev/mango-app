"use client";
import { useUser } from "@/providers/user-provider";
import { useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";

export function useHasPermissions() {
  const { user, isLoading } = useUser();
  const router = useRouter();

  const isSuperAdmin = user?.isSuperAdmin || false;

  const hasPermission = useCallback((resource: string, action: string) => {
    if (!user || !user.permissions) return false;
    if (isSuperAdmin) return true;

    if (Array.isArray(user.permissions)) {
      const permissionString = `${resource}:${action}`;
      const managePermissionString = `${resource}:manage`;
      return user.permissions.includes(permissionString) ||
        user.permissions.includes(managePermissionString);
    }

    return !!user.permissions[resource]?.includes(action) ||
      !!user.permissions[resource]?.includes('manage');
  }, [user, isSuperAdmin]);

  const hasAnyPermission = useCallback((requiredPermissions: Array<{ resource: string; action: string }>) => {
    if (!user) return false;
    if (isSuperAdmin) return true;

    return requiredPermissions.some(p => hasPermission(p.resource, p.action));
  }, [user, isSuperAdmin, hasPermission]);

  const hasAllPermissions = useCallback((requiredPermissions: Array<{ resource: string; action: string }>) => {
    if (!user) return false;
    if (isSuperAdmin) return true;

    return requiredPermissions.every(p => hasPermission(p.resource, p.action));
  }, [user, isSuperAdmin, hasPermission]);

  // Note: For automatic redirects, use usePermissionCheck hook or PermissionGuard component
  // These functions only check permissions without redirecting

  return {
    user,
    isLoading,
    isSuperAdmin,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
  };
}

/*
 * Permission Hooks Usage Examples:
 *
 * // Basic permission checking (no redirects)
 * const { hasPermission, hasAnyPermission, hasAllPermissions } = useHasPermissions();
 * const canEdit = hasPermission('user', 'update');
 * const hasAnyAccess = hasAnyPermission([
 *   { resource: 'user', action: 'read' },
 *   { resource: 'admin', action: 'manage' }
 * ]);
 *
 * // For automatic redirects, use these instead:
 * import { usePermissionCheck, useHasAccess } from '@/hooks/usePermissionCheck';
 * import { PermissionGuard } from '@/components/PermissionGuard';
 *
 * // Hook-based redirect
 * const { hasAccess } = usePermissionCheck({ resource: 'user', action: 'read' });
 *
 * // Component-based protection
 * <PermissionGuard resource="user" action="read">
 *   <UserManagementComponent />
 * </PermissionGuard>
 */
