'use client';

import { useAuth } from '@/store/authStore';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  Home,
  Calendar,
  Users,
  Settings,
  Shield,
  BarChart3,
  Bell,
  FileText,
  HelpCircle,
  Package,
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const navigation = [
  { name: 'Dashboard', href: '/admin', icon: Home },
  { name: "User Management", href: '/admin/users', icon: Users },
  { name: 'Products', href: '/admin/products', icon: Package },
  { name: 'My schedule', href: '/admin/schedule', icon: Calendar },
  { name: 'Manage events', href: '/admin/events', icon: Settings },
  { name: 'Calendar', href: '/admin/calendar', icon: Calendar },
  { name: 'People', href: '/admin/people', icon: Users },
  { name: 'Reports', href: '/admin/reports', icon: BarChart3 },
];

const bottomNavigation = [
  { name: 'Notification', href: '/admin/notifications', icon: Bell, badge: '5' },
  { name: 'Documents', href: '/admin/documents', icon: FileText },
  { name: 'Help', href: '/admin/help', icon: HelpCircle },
];

interface SidebarProps {
  className?: string;
}

export function Sidebar({ className }: SidebarProps) {
  const pathname = usePathname();
  const { user } = useAuth();

  return (
    <div className={`flex h-full w-full flex-col bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-700 ${className}`}>
      {/* Header */}
      <div className="flex h-16 shrink-0 items-center justify-between px-6 border-b border-slate-200 dark:border-slate-700">
        <div className="flex items-center space-x-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-white">
            <Shield className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-sm font-semibold text-slate-900 dark:text-white">Star Events</h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">Event management</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-4 space-y-1">
          {navigation.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
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
                <span>{item.name}</span>
                {isActive && (
                  <div className="ml-auto h-1.5 w-1.5 rounded-full bg-blue-600 dark:bg-blue-400"></div>
                )}
              </Link>
            );
          })}
        </div>

        <div className="px-4">
          <Separator className="my-4" />
        </div>

        {/* Bottom Navigation */}
        <div className="p-4 space-y-1">
          {bottomNavigation.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? 'bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300'
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
              </Link>
            );
          })}
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
              {user?.name || 'Jonathan'}
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
              {user?.email || 'jonathan@email.com'}
            </p>
          </div>
          <Settings className="h-4 w-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors" />
        </div>
      </div>
    </div>
  );
}
