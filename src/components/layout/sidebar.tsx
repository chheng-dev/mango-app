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
  utilityNavigation, 
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
        <div className="h-5 w-5 bg-slate-200 dark:bg-slate-700 rounded"></div>
        <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded flex-1"></div>
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
          ? 'bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 shadow-sm'
          : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
      }`}
    >
      <item.icon className={`h-5 w-5 shrink-0 ${
        isActive ? 'text-blue-600 dark:text-blue-400' : 'text-slate-500 dark:text-slate-400 group-hover:text-slate-700 dark:group-hover:text-slate-300'
      }`} />
      <span className="flex-1">{item.name}</span>
      {item.badge && (
        <Badge variant="secondary" className="h-5 px-2 text-xs bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400 border-orange-200 dark:border-orange-800">
          {item.badge}
        </Badge>
      )}
      {isActive && (
        <div className="ml-auto h-1.5 w-1.5 rounded-full bg-blue-600 dark:bg-blue-400"></div>
      )}
    </Link>
  );
}

export function Sidebar({ className }: SidebarProps) {
  const pathname = usePathname();
  const { user } = useAuth();
  const { permissions, isSuperAdmin, isLoading, isError } = useUserPermissions();

  return (
    <div className={`flex h-full w-full flex-col bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-700 ${className}`}>
      {/* Header */}
      <div className="flex h-16 shrink-0 items-center justify-between px-6 border-b border-slate-200 dark:border-slate-700">
        <div className="flex items-center space-x-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-white">
            <Shield className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-sm font-semibold text-slate-900 dark:text-white">Mango App</h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">Admin Dashboard</p>
          </div>
        </div>
      </div>

      {/* Debug Info (remove in production) */}
      {process.env.NODE_ENV === 'development' && (
        <div className="p-2 bg-yellow-50 dark:bg-yellow-900/20 border-b text-xs">
          <div>Loading: {isLoading ? 'Yes' : 'No'}</div>
          <div>Error: {isError ? 'Yes' : 'No'}</div>
          <div>Super Admin: {isSuperAdmin ? 'Yes' : 'No'}</div>
          <div>Permissions: {permissions.length}</div>
        </div>
      )}

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto">
        {/* Overview Section */}
        <div className="p-4 space-y-1">
          <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
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
          <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
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

        {/* Events Section */}
        <div className="p-4 space-y-1">
          <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
            Events
          </div>
          {eventNavigation.map((item) => (
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

        {/* Utility Section */}
        <div className="p-4 space-y-1">
          <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
            Utility
          </div>
          {utilityNavigation.map((item) => (
            <NavigationItem
              key={item.name}
              item={item}
              isActive={pathname === item.href || (item.href !== '/admin' && pathname.startsWith(item.href))}
            />
          ))}
        </div>
      </div>

      {/* User Section */}
      <div className="border-t border-slate-200 dark:border-slate-700 p-4">
        <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer">
          <div className="h-8 w-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-sm font-medium">
            {user?.name?.charAt(0).toUpperCase() || 'U'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-slate-900 dark:text-white truncate">
              {user?.name || 'User'}
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
              {user?.email || 'user@example.com'}
            </p>
          </div>
          <Settings className="h-4 w-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors" />
        </div>
      </div>
    </div>
  );
}
