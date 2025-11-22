'use client';

import React from 'react';
import {
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarMenuSub,
  SidebarMenuSubItem,
  SidebarMenuSubButton,
  Sidebar as SidebarPrimitive
} from '@/components/ui/sidebar';
import { useHasPermissions } from '@/hooks/useHasPermissions';
import { useSidebar } from '@/hooks/useSidebar';
import {
  ChevronDown,
  Globe,
  Settings,
  LayoutDashboard,
  Users,
  Shield,
  Cog,
  BarChart3,
  Database,
  FileText,
  Bell
} from 'lucide-react';
import { usePathname } from 'next/navigation';
import { useState, useMemo } from 'react';
import Link from 'next/link';
import { SidebarHeader as CustomSidebarHeader } from './sidebar-header';
import { AuthGuard } from '@/components/AuthGuard';
import { cn } from '@/lib/utils';

interface SidebarProps {
  className?: string;
}

// Icon mapping for sidebar items
const getIcon = (iconName: string) => {
  const icons: Record<string, any> = {
    dashboard: LayoutDashboard,
    users: Users,
    shield: Shield,
    settings: Cog,
    'bar-chart': BarChart3,
    database: Database,
    'file-text': FileText,
    bell: Bell,
  };
  return icons[iconName] || Settings;
};

export function Sidebar({ className }: SidebarProps) {
  const { sidebarGroups } = useSidebar();
  const pathname = usePathname();
  const [expandedSection, setExpandedSection] = useState<Set<string>>(new Set());
  const { user, isSuperAdmin } = useHasPermissions();

  const toggleExpand = (itemId: string) => {
    setExpandedSection(prev => {
      const newSet = new Set(prev);
      if (newSet.has(itemId)) {
        newSet.delete(itemId);
      } else {
        newSet.add(itemId);
      }
      return newSet;
    });
  };

  const activePath = useMemo(() => {
    const allPaths: string[] = [];
    const traverse = (items: any[]) => {
      items.forEach(item => {
        if (item.path) allPaths.push(item.path);
        if (item.children) traverse(item.children);
      });
    };
    sidebarGroups.forEach(group => traverse(group.items));

    const matchingPaths = allPaths.filter(path =>
      pathname === path || pathname.startsWith(`${path}/`)
    );

    return matchingPaths.sort((a, b) => b.length - a.length)[0];
  }, [sidebarGroups, pathname]);

  const isActive = (path: string) => {
    return path === activePath;
  };

  const renderSidebarItem = (item: any, level = 0) => {
    const hasChildren = item.children && item.children.length > 0;
    const isExpanded = expandedSection.has(item.name || item.id);
    const isItemActive = item.path ? isActive(item.path) : false;
    const hasActiveChild = item.children?.some((child: any) => {
      return child.path ? isActive(child.path) : false;
    });

    const IconComponent = item.icon ? getIcon(item.icon) : null;

    if (hasChildren) {
      return (
        <SidebarMenuItem key={item.id}>
          <SidebarMenuButton
            onClick={() => toggleExpand(item.name || item.id)}
            className={cn(
              "w-full justify-between h-8 px-2",
              isItemActive || hasActiveChild && "bg-sidebar-accent text-sidebar-accent-foreground"
            )}
          >
            <div className="flex items-center">
              {IconComponent && <IconComponent className="mr-2 h-3.5 w-3.5" />}
              <span className="text-sm">{item.label}</span>
            </div>
            <ChevronDown
              className={cn(
                "h-3.5 w-3.5 transition-transform duration-200",
                isExpanded && "rotate-180"
              )}
            />
          </SidebarMenuButton>
          {isExpanded && (
            <SidebarMenuSub>
              {item.children.map((child: any) => (
                <SidebarMenuSubItem key={child.id}>
                  <SidebarMenuSubButton asChild isActive={isActive(child.path)} className="h-7 px-3">
                    <Link href={child.path}>
                      {child.icon && getIcon(child.icon) && (
                        <span className="mr-2">
                          {React.createElement(getIcon(child.icon), { className: "h-3 w-3" })}
                        </span>
                      )}
                      <span className="text-sm">{child.label}</span>
                    </Link>
                  </SidebarMenuSubButton>
                </SidebarMenuSubItem>
              ))}
            </SidebarMenuSub>
          )}
        </SidebarMenuItem>
      );
    }

    return (
      <SidebarMenuItem key={item.id}>
        <SidebarMenuButton asChild isActive={isItemActive} className="h-8 px-2">
          <Link href={item.path} className="flex items-center">
            {IconComponent && <IconComponent className="mr-2 h-3.5 w-3.5" />}
            <span className="text-sm">{item.label}</span>
          </Link>
        </SidebarMenuButton>
      </SidebarMenuItem>
    );
  };

  return (
    <AuthGuard requireAuth={true}>
      <SidebarPrimitive side="left" variant="inset" className={className}>
        <SidebarHeader>
          <CustomSidebarHeader
            user={user}
            isSuperAdmin={isSuperAdmin}
          />
        </SidebarHeader>

        <SidebarContent className="gap-1">
          {sidebarGroups.map((group) => (
            <SidebarGroup key={group.title || 'main'} className="p-1">
              {group.title && (
                <SidebarGroupLabel className="text-sidebar-foreground/70 font-semibold text-xs uppercase tracking-wider mb-1 px-2 py-1">
                  <div className="flex items-center">
                    {group.title === 'Integrations' && <Globe className="h-3.5 w-3.5 mr-1.5" />}
                    {group.title === 'Settings' && <Settings className="h-3.5 w-3.5 mr-1.5" />}
                    {group.title}
                  </div>
                </SidebarGroupLabel>
              )}
              <SidebarGroupContent>
                <SidebarMenu className="gap-0.5">
                  {group.items.map((item: any) => renderSidebarItem(item))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          ))}
        </SidebarContent>
      </SidebarPrimitive>
    </AuthGuard>
  );
}
