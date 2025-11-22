"use client";
/**
 * Page Permission Hooks
 *
 * These hooks provide automatic permission checking and redirection for pages/routes.
 * They integrate with the permission system to ensure users can only access
 * pages they have permission for.
 *
 * Usage Examples:
 *
 * // Basic permission check with redirect
 * const { hasAccess } = usePagePermission({
 *   resource: 'user',
 *   action: 'read'
 * });
 *
 * // Multiple permissions (any of)
 * const { hasAccess } = usePagePermission({
 *   permissions: [
 *     { resource: 'user', action: 'read' },
 *     { resource: 'admin', action: 'manage' }
 *   ]
 * });
 *
 * // Multiple permissions (all required)
 * const { hasAccess } = usePagePermission({
 *   permissions: [
 *     { resource: 'user', action: 'read' },
 *     { resource: 'user', action: 'create' }
 *   ],
 *   requireAll: true
 * });
 *
 * // URL-based permission check
 * const { hasAccess } = useUrlPermission('/admin/users');
 *
 * // Component-based protection
 * <PagePermissionGuard resource="user" action="read">
 *   <UserManagement />
 * </PagePermissionGuard>
 */

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useHasPermissions } from './useHasPermissions';

interface PagePermissionOptions {
  resource?: string;
  action?: string;
  permissions?: Array<{ resource: string; action: string }>;
  requireAll?: boolean;
  redirectTo?: string; // Changed default to login instead of unauthorized
  enabled?: boolean;
}

export function usePagePermission(options: PagePermissionOptions = {}) {
  const {
    resource,
    action,
    permissions,
    requireAll = false,
    redirectTo = '/en/login',
    enabled = true
  } = options;

  const { hasPermission, hasAnyPermission, hasAllPermissions, isLoading, user } = useHasPermissions();
  const router = useRouter();

  useEffect(() => {
    // Don't run if disabled or still loading
    if (!enabled || isLoading) return;

    // If no user at all, let AuthGuard handle authentication
    if (!user) return;

    let hasAccess = false;

    if (permissions && permissions.length > 0) {
      // Check multiple permissions
      hasAccess = requireAll
        ? hasAllPermissions(permissions)
        : hasAnyPermission(permissions);
    } else if (resource && action) {
      // Check single permission
      hasAccess = hasPermission(resource, action);
    } else {
      // No specific permissions required, allow access
      hasAccess = true;
    }

    if (!hasAccess) {
      const permissionDesc = permissions
        ? `${requireAll ? 'all of' : 'any of'} [${permissions.map(p => `${p.resource}:${p.action}`).join(', ')}]`
        : `${resource}:${action}`;

      console.log(`usePagePermission: Access denied for ${permissionDesc}, redirecting to ${redirectTo}`);
      router.push(redirectTo);
    }
  }, [
    enabled,
    isLoading,
    user,
    resource,
    action,
    permissions,
    requireAll,
    redirectTo,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    router
  ]);

  // Return current permission status
  let currentHasAccess = false;

  if (!enabled || isLoading || !user) {
    currentHasAccess = false;
  } else if (permissions && permissions.length > 0) {
    currentHasAccess = requireAll
      ? hasAllPermissions(permissions)
      : hasAnyPermission(permissions);
  } else if (resource && action) {
    currentHasAccess = hasPermission(resource, action);
  } else {
    currentHasAccess = true;
  }

  return {
    hasAccess: currentHasAccess,
    isLoading,
    user,
    // Utility functions
    checkPermission: (res: string, act: string) => hasPermission(res, act),
    checkAnyPermission: (perms: Array<{ resource: string; action: string }>) => hasAnyPermission(perms),
    checkAllPermissions: (perms: Array<{ resource: string; action: string }>) => hasAllPermissions(perms),
  };
}

// Hook specifically for URL-based permission checking
export function useUrlPermission(url: string, options: Omit<PagePermissionOptions, 'resource' | 'action' | 'permissions'> = {}) {
  // Map common URLs to permissions
  const urlPermissionMap: Record<string, { resource: string; action: string }> = {
    '/admin/users': { resource: 'user', action: 'read' },
    '/admin/roles': { resource: 'role', action: 'read' },
    '/admin/permissions': { resource: 'permission', action: 'read' },
    '/admin/settings': { resource: 'setting', action: 'read' },
    '/admin/dashboard': { resource: 'dashboard', action: 'read' },
    '/reports': { resource: 'report', action: 'read' },
    '/audit': { resource: 'system', action: 'read' },
  };

  const permission = urlPermissionMap[url];

  return usePagePermission({
    ...options,
    redirectTo: options.redirectTo || '/en/login', // Ensure login redirect for URL permissions
    ...(permission && { resource: permission.resource, action: permission.action }),
    enabled: options.enabled !== false && !!permission // Only enable if we have a permission mapping
  });
}

// Hook for route-based permissions (extracts from current route)
export function useRoutePermission(options: Omit<PagePermissionOptions, 'resource' | 'action' | 'permissions'> & {
  routeMap?: Record<string, { resource: string; action: string }>;
} = {}) {
  const { routeMap = {}, ...restOptions } = options;

  // In a real app, you'd get the current route from usePathname or similar
  // For now, this is a placeholder that can be extended
  const currentRoute = typeof window !== 'undefined' ? window.location.pathname : '';

  const permission = routeMap[currentRoute] || routeMap['*']; // Wildcard fallback

  return usePagePermission({
    ...restOptions,
    ...(permission && { resource: permission.resource, action: permission.action }),
  });
}
