'use client';

import { useAuth } from '@/store/authStore';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Settings, Shield } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { usePermissions as useUserPermissions } from '@/hooks/usePermissions';
import { 
  mainNavigation, 
  businessNavigation, 
  eventNavigation, 
  type NavigationItem as NavItem 
} from '@/lib/navigation';

interface SidebarProps {
  className?: string;
}

interface NavigationItem {
  name: string;
  href: string;
  icon: any;
  permissions: readonly string[];
  badge?: string;
}

// Navigation Item Component
function NavigationItem({ item, isActive }: { item: NavigationItem; isActive: boolean }) {
  const { hasPermission, isLoading } = useUserPermissions();

  // Show loading skeleton while permissions are being fetched
  if (isLoading) {
    return (
      <div className="group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium animate-pulse">
        <div className="h-5 w-5 bg-muted rounded"></div>
        <div className="h-4 bg-muted rounded flex-1"></div>
      </div>
    );
  }

  // Don't render if user doesn't have permission
  if (!hasPermission(item.permissions)) {
    return null;
  }

  return (
    <Link
      href={item.href}
      className={`group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200 ${
        isActive
          ? 'bg-primary/10 text-primary shadow-sm'
          : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
      }`}
    >
      <item.icon className={`h-5 w-5 shrink-0 transition-colors ${
        isActive ? 'text-primary' : 'text-muted-foreground group-hover:text-accent-foreground'
      }`} />
      <span className="flex-1">{item.name}</span>
      {item.badge && (
        <Badge variant="secondary" className="h-5 px-2 text-xs">
          {item.badge}
        </Badge>
      )}
      {isActive && (
        <div className="ml-auto h-1.5 w-1.5 rounded-full bg-primary"></div>
      )}
    </Link>
  );
}

export function Sidebar({ className }: SidebarProps) {
  const pathname = usePathname();
  const { user } = useAuth();
  const { permissions, isSuperAdmin, isLoading, isError } = useUserPermissions();

  return (
    <div className={`flex h-full w-full flex-col bg-background border-r border-border ${className}`}>
      {/* Header */}
      <div className="flex h-16 shrink-0 items-center justify-between px-6 border-b border-border">
        <div className="flex items-center space-x-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Shield className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-sm font-semibold text-foreground">Mango App</h1>
            <p className="text-xs text-muted-foreground">Admin Dashboard</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto">
        {/* Overview Section */}
        <div className="p-4 space-y-1">
          <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
            Overview
          </div>
          {mainNavigation.map((item) => (
            <NavigationItem
              key={item.name}
              item={item}
              isActive={pathname === item.href || (item.href !== '/admin' && pathname.startsWith(item.href))}
            />
          ))}
        </div>

        <div className="px-4">
          <Separator className="my-2" />
        </div>

        {/* Business Section */}
        <div className="p-4 space-y-1">
          <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
            Business
          </div>
          {businessNavigation.map((item) => (
            <NavigationItem
              key={item.name}
              item={item}
              isActive={pathname === item.href || (item.href !== '/admin' && pathname.startsWith(item.href))}
            />
          ))}
        </div>

        <div className="px-4">
          <Separator className="my-2" />
        </div>

        <div className="px-4">
          <Separator className="my-2" />
        </div>
      </div>

      {/* User Section */}
      <div className="border-t border-border p-4">
        <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-accent transition-colors cursor-pointer">
          <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-sm font-medium">
            {user?.name?.charAt(0).toUpperCase() || 'U'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-foreground truncate">
              {user?.name || 'User'}
            </p>
            <p className="text-xs text-muted-foreground truncate">
              {user?.email || 'user@example.com'}
            </p>
          </div>
          <Settings className="h-4 w-4 text-muted-foreground hover:text-foreground transition-colors" />
        </div>
      </div>
    </div>
  );
}
