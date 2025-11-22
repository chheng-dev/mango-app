import { PermissionCheck } from "./rbac";

export interface SidebarItem {
  id: string;
  label: string;
  icon?: string;
  path?: string;
  requiredPermissions?: PermissionCheck[];
  children?: SidebarItem[];
  resource?: string;
  action?: string;
  category?: string;
}

export interface SidebarGroup {
  title: string;
  items: SidebarItem[];
}