'use client';

import { useUserPermissions } from '@/hooks/useUserPermissions';
import Link from 'next/link';
import {
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar';
import { NavigationItem } from './types';

interface NavigationMenuItemProps {
  item: NavigationItem;
  pathname: string;
  isSubItem?: boolean;
}

export function NavigationMenuItem({ 
  item, 
  pathname,
  isSubItem = false 
}: NavigationMenuItemProps) {
  const { isLoading, hasPermission } = useUserPermissions();
  
  if (isLoading) {
    return (
      <SidebarMenuItem>
        <div className="group flex items-center gap-2.5 px-2.5 py-2 text-sm animate-pulse">
          <div className="h-4 w-4 bg-muted rounded"></div>
          <div className="h-3 bg-muted rounded flex-1"></div>
        </div>
      </SidebarMenuItem>
    );
  }

  if (!hasPermission(item.permissions)) {
    return null;
  }

  const isActive = pathname === item.href || (item.href !== '/admin' && pathname.startsWith(item.href));

  return (
    <SidebarMenuItem>
      <SidebarMenuButton asChild isActive={isActive}>
        <Link href={item.href}>
          <item.icon />
          <span>{item.name}</span>
          {item.badge && (
            <span className="ml-auto bg-sidebar-accent text-sidebar-accent-foreground rounded-full px-2 py-0.5 text-xs">
              {item.badge}
            </span>
          )}
        </Link>
      </SidebarMenuButton>
    </SidebarMenuItem>
  );
}
