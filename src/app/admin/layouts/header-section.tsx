"use client";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

import { 
  Bell, 
  ChevronRight,
  LogOut, 
  Settings, 
  User, 
  Home,
  Calendar,
  Users,
  BarChart3,
  HelpCircle,
  MessageSquare,
} from 'lucide-react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/store/authStore';

export default function HeaderSection() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  const getBreadcrumbs = () => {
    const paths = pathname.split('/').filter(Boolean);
    const breadcrumbs = [{ name: 'Home', href: '/admin', icon: Home }];
    
    let currentPath = '';
    paths.forEach((path) => {
      if (path === 'admin') return;
      currentPath += `/${path}`;
      
      const pathMap: Record<string, { name: string; icon: any }> = {
        '/schedule': { name: 'Schedule', icon: Calendar },
        '/events': { name: 'Events', icon: Calendar },
        '/people': { name: 'People', icon: Users },
        '/reports': { name: 'Reports', icon: BarChart3 },
        '/settings': { name: 'Settings', icon: Settings },
      };
      
      breadcrumbs.push({
        name: pathMap[currentPath]?.name || path.charAt(0).toUpperCase() + path.slice(1),
        href: `/admin${currentPath}`,
        icon: pathMap[currentPath]?.icon || Home
      });
    });
    
    return breadcrumbs;
  };

  const breadcrumbs = getBreadcrumbs();
  const currentPage = breadcrumbs[breadcrumbs.length - 1];

  const notifications = [
    { id: 1, title: 'New user registered', time: '2 min ago', type: 'user' },
    { id: 2, title: 'System update available', time: '1 hour ago', type: 'system' },
    { id: 3, title: 'Monthly report ready', time: '3 hours ago', type: 'report' },
  ];
  
  return (
    <div className="flex flex-1 items-center justify-between gap-4">
      <div className="flex items-center gap-4 min-w-0 flex-1">
        <div className="min-w-0 flex-1">
          {/* Breadcrumbs */}
          <nav className="flex items-center space-x-1 text-sm text-slate-500 dark:text-slate-400 mb-1">
            {breadcrumbs.map((item, index) => (
              <div key={item.href} className="flex items-center">
                {index > 0 && <ChevronRight className="h-3 w-3 mx-1" />}
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-auto p-1 text-xs hover:text-slate-900 dark:hover:text-white"
                  onClick={() => router.push(item.href)}
                >
                  <item.icon className="h-3 w-3 mr-1" />
                  {item.name}
                </Button>
              </div>
            ))}
          </nav>
          
          {/* Page Title */}
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-semibold text-slate-900 dark:text-white truncate">
              {currentPage.name}
            </h1>
          </div>
        </div>
      </div>

      {/* Right side - Actions and User */}
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" className="hidden sm:flex">
          <HelpCircle className="h-4 w-4" />
          <span className="sr-only">Help</span>
        </Button>

        {/* Enhanced Notifications */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-4 w-4" />
              <Badge variant="destructive" className="absolute -top-1 -right-1 h-4 w-4 p-0 flex items-center justify-center text-xs">
                {notifications.length}
              </Badge>
              <span className="sr-only">Notifications</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80">
            <DropdownMenuLabel className="flex items-center justify-between">
              Notifications
              <Badge variant="secondary" className="ml-2">
                {notifications.length} new
              </Badge>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <div className="max-h-64 overflow-y-auto">
              {notifications.map((notification) => (
                <DropdownMenuItem key={notification.id} className="flex flex-col items-start p-3">
                  <div className="flex items-center w-full justify-between">
                    <span className="text-sm font-medium">{notification.title}</span>
                    <span className="text-xs text-slate-500">{notification.time}</span>
                  </div>
                  <Badge variant="outline" className="mt-1 text-xs">
                    {notification.type}
                  </Badge>
                </DropdownMenuItem>
              ))}
            </div>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-center text-blue-600 hover:text-blue-700">
              View all notifications
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Enhanced User Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-9 w-9 rounded-full">
              <Avatar className="h-9 w-9">
                <AvatarImage src="/placeholder-avatar.jpg" alt={user?.name} />
                <AvatarFallback className="bg-blue-600 text-white text-sm font-medium">
                  {user?.name?.charAt(0).toUpperCase() || 'U'}
                </AvatarFallback>
              </Avatar>
              <div className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full bg-green-500 border-2 border-white dark:border-slate-800"></div>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-64">
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-2">
                <div className="flex items-center space-x-2">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src="/placeholder-avatar.jpg" alt={user?.name} />
                    <AvatarFallback className="bg-blue-600 text-white text-xs">
                      {user?.name?.charAt(0).toUpperCase() || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col">
                    <p className="text-sm font-medium leading-none">{user?.name || 'User'}</p>
                    <p className="text-xs leading-none text-slate-500 dark:text-slate-400 mt-1">
                      {user?.email || 'user@example.com'}
                    </p>
                  </div>
                </div>
                <Badge variant="outline" className="w-fit text-xs">
                  Admin
                </Badge>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <User className="mr-2 h-4 w-4" />
              <span>Profile</span>
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Settings className="mr-2 h-4 w-4" />
              <span>Settings</span>
            </DropdownMenuItem>
            <DropdownMenuItem>
              <MessageSquare className="mr-2 h-4 w-4" />
              <span>Feedback</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout} className="text-red-600 dark:text-red-400">
              <LogOut className="mr-2 h-4 w-4" />
              <span>Log out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}