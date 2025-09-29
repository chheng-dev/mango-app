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
import { PERMISSIONS } from '@/lib/constants/permissions';

export interface NavigationItem {
  name: string;
  href: string;
  icon: any;
  permissions: readonly string[];
  badge?: string;
  category?: string;
}

// Main navigation items
export const mainNavigation: NavigationItem[] = [
  { 
    name: 'Dashboard', 
    href: '/admin', 
    icon: Home,
    permissions: [], 
    category: 'overview'
  },
  { 
    name: "User Management", 
    href: '/admin/users', 
    icon: Users,
    permissions: [PERMISSIONS.USER_READ],
    category: 'users'
  },
  { 
    name: 'Roles Management', 
    href: '/admin/roles', 
    icon: Shield,
    permissions: [PERMISSIONS.ROLE_READ],
    category: 'rbac'
  },
  { 
    name: 'Permissions', 
    href: '/admin/permissions', 
    icon: Shield,
    permissions: [PERMISSIONS.PERMISSION_READ],
    category: 'rbac'
  },
];

export const businessNavigation: NavigationItem[] = [
  { 
    name: 'Products', 
    href: '/admin/products', 
    icon: Package,
    permissions: [PERMISSIONS.SYSTEM_ADMIN], // Using system admin for business features
    category: 'business'
  },
  { 
    name: 'Reports', 
    href: '/admin/reports', 
    icon: BarChart3,
    permissions: [PERMISSIONS.SYSTEM_ADMIN], // Using system admin for reports
    category: 'business'
  },
];

export const eventNavigation: NavigationItem[] = [
  { 
    name: 'My Schedule', 
    href: '/admin/schedule', 
    icon: Calendar,
    permissions: [PERMISSIONS.PROFILE_READ], // Users can view their own schedule
    category: 'events'
  },
  { 
    name: 'Manage Events', 
    href: '/admin/events', 
    icon: Settings,
    permissions: [PERMISSIONS.SYSTEM_ADMIN], // Admin feature for managing events
    category: 'events'
  },
  { 
    name: 'Calendar', 
    href: '/admin/calendar', 
    icon: Calendar,
    permissions: [PERMISSIONS.PROFILE_READ], // Users can view calendar
    category: 'events'
  },
  { 
    name: 'People', 
    href: '/admin/people', 
    icon: Users,
    permissions: [PERMISSIONS.USER_READ], // Need user read permission to view people
    category: 'events'
  },
];


// All navigation items combined
export const allNavigation = [
  ...mainNavigation,
  ...businessNavigation,
  ...eventNavigation,
];

// Navigation organized by categories
export const navigationByCategory = {
  overview: mainNavigation.filter(item => item.category === 'overview'),
  users: mainNavigation.filter(item => item.category === 'users'),
  business: businessNavigation,
  events: eventNavigation,
};

// Permission groups for easier management
export const permissionGroups = {
  users: [PERMISSIONS.USER_READ, PERMISSIONS.USER_CREATE, PERMISSIONS.USER_UPDATE, PERMISSIONS.USER_DELETE],
  roles: [PERMISSIONS.ROLE_READ, PERMISSIONS.ROLE_CREATE, PERMISSIONS.ROLE_UPDATE, PERMISSIONS.ROLE_DELETE],
  permissions: [PERMISSIONS.PERMISSION_READ, PERMISSIONS.PERMISSION_CREATE, PERMISSIONS.PERMISSION_UPDATE, PERMISSIONS.PERMISSION_DELETE],
  system: [PERMISSIONS.SYSTEM_ADMIN, PERMISSIONS.SYSTEM_SETTINGS],
  profile: [PERMISSIONS.PROFILE_READ, PERMISSIONS.PROFILE_UPDATE],
};
