"use client";
import { usePagePermission, useUrlPermission } from '@/hooks/usePagePermission';

interface PagePermissionGuardProps {
  children: React.ReactNode;
  resource?: string;
  action?: string;
  permissions?: Array<{ resource: string; action: string }>;
  requireAll?: boolean;
  redirectTo?: string;
  fallback?: React.ReactNode;
}

// Component-based permission guard using the hook
export function PagePermissionGuard({
  children,
  resource,
  action,
  permissions,
  requireAll = false,
  redirectTo,
  fallback
}: PagePermissionGuardProps) {
  const { hasAccess, isLoading } = usePagePermission({
    resource,
    action,
    permissions,
    requireAll,
    redirectTo,
  });

  // Show loading state
  if (isLoading) {
    return fallback || (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Show fallback if no access (before redirect happens)
  if (!hasAccess) {
    return fallback || (
      <div className="flex items-center justify-center p-8">
        <div className="text-red-600">Access Denied</div>
      </div>
    );
  }

  return <>{children}</>;
}

// URL-based permission guard
interface UrlPermissionGuardProps {
  children: React.ReactNode;
  url?: string;
  redirectTo?: string;
  fallback?: React.ReactNode;
}

export function UrlPermissionGuard({
  children,
  url,
  redirectTo,
  fallback
}: UrlPermissionGuardProps) {
  // If no URL provided, try to get from current location
  const currentUrl = url || (typeof window !== 'undefined' ? window.location.pathname : '');

  const { hasAccess, isLoading } = useUrlPermission(currentUrl, { redirectTo });

  if (isLoading) {
    return fallback || (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!hasAccess) {
    return fallback || (
      <div className="flex items-center justify-center p-8">
        <div className="text-red-600">Access Denied</div>
      </div>
    );
  }

  return <>{children}</>;
}

