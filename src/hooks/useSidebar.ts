import { useMemo } from "react";
import { useHasPermissions } from "./useHasPermissions";
import { SidebarItem } from "@/types/navigation";
import { sidebarConfig } from "@/app/config/sidebar";

export function useSidebar() {
  const {
    hasPermission,
    hasAnyPermission,
    isSuperAdmin
  } = useHasPermissions();

  const filteredSidebarItems = useMemo(() => {
    const filterItems = (items: SidebarItem[]): SidebarItem[] => {
      return items
        .map(item => {
          const filteredItem = { ...item };
          if (filteredItem.children) {
            filteredItem.children = filterItems(filteredItem.children);
          }

          const shouldShowItem = (): boolean => {
            if (isSuperAdmin) return true;

            if (!filteredItem.requiredPermissions && !filteredItem.resource) {
              return true;
            }

            if (filteredItem.resource && filteredItem.action) {
              return hasPermission(filteredItem.resource, filteredItem.action);
            }

            if (filteredItem.requiredPermissions) {
              return hasAnyPermission(filteredItem.requiredPermissions);
            }

            if (filteredItem.children && filteredItem.children.length > 0) {
              return filteredItem.children.length > 0;
            }

            return false;
          };

          return shouldShowItem() ? filteredItem : null;
        })
        .filter(Boolean) as SidebarItem[];
    };

    return sidebarConfig
      .map(group => ({
        ...group,
        items: filterItems(group.items)
      }))
      .filter(group => group.items.length > 0);
  }, [hasAnyPermission, hasPermission, isSuperAdmin]);

  const canAccessRoute = (path: string): boolean => {
    const findItem = (items: SidebarItem[]): SidebarItem | null => {
      for (const item of items) {
        if (item.path === path) {
          return item;
        }
        if (item.children) {
          const child = findItem(item.children);
          if (child) return child;
        }
      }
      return null;
    };

    const targetItem = findItem(sidebarConfig.flatMap(group => group.items));

    if (!targetItem) return false;
    if (isSuperAdmin) return true;

    if (targetItem.requiredPermissions) {
      return hasAnyPermission(targetItem.requiredPermissions);
    }

    if (targetItem.resource && targetItem.action) {
      return hasPermission(targetItem.resource, targetItem.action);
    }
    return true;
  };

  return {
    sidebarGroups: filteredSidebarItems,
    canAccessRoute
  };
}