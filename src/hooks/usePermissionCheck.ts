"use client";
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@/providers/user-provider';

interface PermissionCheckOptions {
  resource: string;
  action: string;
  redirectTo?: string;
  requireAll?: boolean;
  permissions?: Array<{ resource: string; action: string }>;
}

export function usePermissionCheck(options: PermissionCheckOptions) {
  const { resource, action, redirectTo = '/en/unauthorized', requireAll = false, permissions } = options;
  const { user, isLoading } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (isLoading || !user) return;

    // Super admin has access to everything
    if (user.isSuperAdmin) return;

    let hasAccess = false;

    if (permissions) {
      // Check multiple permissions
      if (requireAll) {
        hasAccess = permissions.every(p => checkPermission(user, p.resource, p.action));
      } else {
        hasAccess = permissions.some(p => checkPermission(user, p.resource, p.action));
      }
    } else {
      // Check single permission
      hasAccess = checkPermission(user, resource, action);
    }

    if (!hasAccess) {
      const permissionDesc = permissions
        ? `${requireAll ? 'all of' : 'any of'} [${permissions.map(p => `${p.resource}:${p.action}`).join(', ')}]`
        : `${resource}:${action}`;

      console.log(`usePermissionCheck: Access denied for ${permissionDesc}, redirecting to ${redirectTo}`);
      router.push(redirectTo);
    }
  }, [user, isLoading, resource, action, permissions, requireAll, redirectTo, router]);

  // Return current access status
  if (isLoading || !user) return { hasAccess: false, isLoading: true };

  if (user.isSuperAdmin) return { hasAccess: true, isLoading: false };

  let hasAccess = false;

  if (permissions) {
    if (requireAll) {
      hasAccess = permissions.every(p => checkPermission(user, p.resource, p.action));
    } else {
      hasAccess = permissions.some(p => checkPermission(user, p.resource, p.action));
    }
  } else {
    hasAccess = checkPermission(user, resource, action);
  }

  return { hasAccess, isLoading: false };
}

// Helper function to check permissions
function checkPermission(user: any, resource: string, action: string): boolean {
  if (!user || !user.permissions) return false;

  if (Array.isArray(user.permissions)) {
    const permissionString = `${resource}:${action}`;
    const managePermissionString = `${resource}:manage`;
    return user.permissions.includes(permissionString) ||
           user.permissions.includes(managePermissionString);
  }

  // Object format
  return !!(user.permissions[resource]?.includes(action) ||
            user.permissions[resource]?.includes('manage'));
}

// Hook for checking access without redirect
export function useHasAccess(resource: string, action: string) {
  const { user, isLoading } = useUser();

  if (isLoading || !user) return false;
  if (user.isSuperAdmin) return true;

  return checkPermission(user, resource, action);
}

// Hook for checking multiple permissions without redirect
export function useHasAnyAccess(permissions: Array<{ resource: string; action: string }>) {
  const { user, isLoading } = useUser();

  if (isLoading || !user) return false;
  if (user.isSuperAdmin) return true;

  return permissions.some(p => checkPermission(user, p.resource, p.action));
}

export function useHasAllAccess(permissions: Array<{ resource: string; action: string }>) {
  const { user, isLoading } = useUser();

  if (isLoading || !user) return false;
  if (user.isSuperAdmin) return true;

  return permissions.every(p => checkPermission(user, p.resource, p.action));
}

