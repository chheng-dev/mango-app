'use client';

import { useUserPermissions } from '@/hooks/useUserPermissions';
import Link from 'next/link';
import { ChevronDown } from 'lucide-react';
import {
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar';
import { NavigationItem } from './types';

interface SettingsDropdownMenuItemProps {
  title: string;
  icon: React.ElementType;
  items: NavigationItem[];
  pathname: string;
  isExpanded: boolean;
  onToggle: () => void;
}

export function SettingsDropdownMenuItem({
  title,
  icon: Icon,
  items,
  pathname,
  isExpanded,
  onToggle
}: SettingsDropdownMenuItemProps) {
  const { hasPermission } = useUserPermissions();
  
  const visibleItems = items.filter(item => hasPermission(item.permissions));
  
  if (visibleItems.length === 0) {
    return null;
  }

  return (
    <SidebarMenuItem>
      <SidebarMenuButton
        onClick={onToggle}
        className="w-full justify-between"
      >
        <div className="flex items-center gap-2">
          <Icon className="h-4 w-4" />
          <span>{title}</span>
        </div>
        <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${
          isExpanded ? 'rotate-180' : ''
        }`} />
      </SidebarMenuButton>
      {isExpanded && (
        <div className="ml-6 mt-1 space-y-1 border-l-2 border-sidebar-border pl-2">
          {visibleItems.map((item) => {
            const isActive = pathname === item.href || (item.href !== '/admin' && pathname.startsWith(item.href));
            return (
              <SidebarMenuItem key={item.name}>
                <SidebarMenuButton asChild isActive={isActive} size="sm">
                  <Link href={item.href} className="pl-2">
                    <item.icon className="h-4 w-4" />
                    <span>{item.name}</span>
                    {item.badge && (
                      <span className="ml-auto bg-sidebar-accent text-sidebar-accent-foreground rounded-full px-1.5 py-0.5 text-xs">
                        {item.badge}
                      </span>
                    )}
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            );
          })}
        </div>
      )}
    </SidebarMenuItem>
  );
}
