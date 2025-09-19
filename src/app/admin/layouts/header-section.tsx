"use client";
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { 
  Bell, 
  ChevronRight,
  LogOut, 
  Settings, 
  User, 
  Home,
  HelpCircle,
} from 'lucide-react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/store/authStore';

// Clean breadcrumb configuration
const PATH_CONFIG = {
  '/users': { name: 'Users', icon: User },
  '/create': { name: 'Create', icon: User },
  '/edit': { name: 'Edit', icon: Settings },
  '/settings': { name: 'Settings', icon: Settings },
} as const;

export default function HeaderSection() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  // Simplified breadcrumb generation
  const getBreadcrumbs = () => {
    const paths = pathname.split('/').filter(Boolean);
    const breadcrumbs = [{ name: 'Home', href: '/admin', icon: Home }];
    
    let currentPath = '';
    paths.forEach((path) => {
      if (path === 'admin') return;
      currentPath += `/${path}`;
      
      const config = PATH_CONFIG[currentPath as keyof typeof PATH_CONFIG];
      breadcrumbs.push({
        name: config?.name || path.charAt(0).toUpperCase() + path.slice(1),
        href: `/admin${currentPath}`,
        icon: config?.icon || Home
      });
    });
    
    return breadcrumbs;
  };

  const breadcrumbs = getBreadcrumbs();
  const currentPage = breadcrumbs[breadcrumbs.length - 1];

  return (
    <header className="flex items-center justify-between h-16 bg-background border-b border-border">
      {/* Left: Breadcrumbs and Title */}
      <div className="flex items-center space-x-4 min-w-0 flex-1">
        {/* Clean Breadcrumbs */}
        <nav className="flex items-center space-x-1 text-sm text-muted-foreground">
          {breadcrumbs.map((item, index) => (
            <div key={item.href} className="flex items-center">
              {index > 0 && <ChevronRight className="h-3 w-3 mx-1" />}
              <Button
                variant="ghost"
                size="sm"
                className="h-6 px-2 text-xs hover:text-foreground"
                onClick={() => router.push(item.href)}
              >
                <item.icon className="h-3 w-3 mr-1" />
                {item.name}
              </Button>
            </div>
          ))}
        </nav>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center space-x-2">
        {/* Help Button */}
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <HelpCircle className="h-4 w-4" />
        </Button>

        {/* Notifications */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8 relative">
              <Bell className="h-4 w-4" />
              <Badge variant="destructive" className="absolute -top-1 -right-1 h-4 w-4 p-0 text-xs">
                3
              </Badge>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-72">
            <DropdownMenuLabel>Notifications (3)</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <div className="space-y-1 max-h-64 overflow-y-auto">
              <DropdownMenuItem className="flex flex-col items-start p-3 space-y-1">
                <div className="flex w-full justify-between">
                  <span className="text-sm font-medium">New user registered</span>
                  <span className="text-xs text-muted-foreground">2m</span>
                </div>
                <Badge variant="outline" className="text-xs">User</Badge>
              </DropdownMenuItem>
              <DropdownMenuItem className="flex flex-col items-start p-3 space-y-1">
                <div className="flex w-full justify-between">
                  <span className="text-sm font-medium">System update available</span>
                  <span className="text-xs text-muted-foreground">1h</span>
                </div>
                <Badge variant="outline" className="text-xs">System</Badge>
              </DropdownMenuItem>
              <DropdownMenuItem className="flex flex-col items-start p-3 space-y-1">
                <div className="flex w-full justify-between">
                  <span className="text-sm font-medium">Report generated</span>
                  <span className="text-xs text-muted-foreground">3h</span>
                </div>
                <Badge variant="outline" className="text-xs">Report</Badge>
              </DropdownMenuItem>
            </div>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-center text-sm">
              View all notifications
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* User Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 rounded-full p-0">
              <Avatar className="h-8 w-8">
                <AvatarImage src="/placeholder-avatar.jpg" alt={user?.name} />
                <AvatarFallback className="bg-primary text-primary-foreground text-sm">
                  {user?.name?.charAt(0).toUpperCase() || 'U'}
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium">{user?.name || 'User'}</p>
                <p className="text-xs text-muted-foreground">
                  {user?.email || 'user@example.com'}
                </p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <User className="mr-2 h-4 w-4" />
              Profile
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Settings className="mr-2 h-4 w-4" />
              Settings
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout} className="text-destructive">
              <LogOut className="mr-2 h-4 w-4" />
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}