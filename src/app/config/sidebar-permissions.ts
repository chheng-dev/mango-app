
import { useHasPermissions } from "@/hooks/useHasPermissions";

export const useSidebarPermissions = () => {
  const { hasPermission } = useHasPermissions();

  return {
    // Main section
    dashboard: hasPermission("dashboard", "read"),

    // Management section
    users: hasPermission("user", "read"),
    roles: hasPermission("role", "read"),

    // System section
    settings: hasPermission("setting", "read"),
    audit: hasPermission("system", "read"),
    reports: hasPermission("report", "read"),
    userReports: hasPermission("report", "user"),
    systemReports: hasPermission("report", "system"),
  };
};

export type SidebarPermissions = ReturnType<typeof useSidebarPermissions>;
