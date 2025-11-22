import { useHasPermissions } from "@/hooks/useHasPermissions";

interface PermissionGuardProps {
  children: React.ReactNode;
  resource?: string;
  action?: string;
  checks?: any[];
  fallback?: React.ReactNode;
  superAdminBypass?: boolean;
}

export function PermissionGuard({
  children,
  resource,
  action,
  checks = [],
  fallback = null,
  superAdminBypass = true,
}: PermissionGuardProps) {
  const {
    hasPermission,
    hasAllPermissions,
    isSuperAdmin,
  } = useHasPermissions();

  if (superAdminBypass && isSuperAdmin) {
    return <>{children}</>;
  }

  if (resource && action) {
    if (!hasPermission(resource, action)) {
      return <>{fallback}</>;
    }
  }

  if (checks && checks.length > 0) {
    if (!hasAllPermissions(checks)) {
      return <>{fallback}</>;
    }
  }

  return <>{children}</>;
}