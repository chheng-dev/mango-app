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
import { PERMISSION_COMBINATIONS } from '@/lib/utils/permissions';

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
    permissions: PERMISSION_COMBINATIONS.USER_MANAGEMENT,
    category: 'users'
  },
  { 
    name: 'Roles Management', 
    href: '/admin/roles', 
    icon: Shield,
    permissions: PERMISSION_COMBINATIONS.ROLE_MANAGEMENT,
    category: 'rbac'
  },
  { 
    name: 'Permissions', 
    href: '/admin/permissions', 
    icon: Shield,
    permissions: PERMISSION_COMBINATIONS.PERMISSION_MANAGEMENT,
    category: 'rbac'
  },
  { 
    name: 'RBAC Dashboard', 
    href: '/admin/rbac', 
    icon: Shield,
    permissions: PERMISSION_COMBINATIONS.RBAC_ACCESS,
    category: 'rbac'
  },
];

// Business navigation items
export const businessNavigation: NavigationItem[] = [
  { 
    name: 'Products', 
    href: '/admin/products', 
    icon: Package,
    permissions: PERMISSION_COMBINATIONS.PRODUCT_MANAGEMENT,
    category: 'business'
  },
  { 
    name: 'Reports', 
    href: '/admin/reports', 
    icon: BarChart3,
    permissions: PERMISSION_COMBINATIONS.REPORT_ACCESS,
    category: 'business'
  },
];

// Event management navigation items
export const eventNavigation: NavigationItem[] = [
  { 
    name: 'My Schedule', 
    href: '/admin/schedule', 
    icon: Calendar,
    permissions: PERMISSION_COMBINATIONS.SCHEDULE_ACCESS,
    category: 'events'
  },
  { 
    name: 'Manage Events', 
    href: '/admin/events', 
    icon: Settings,
    permissions: PERMISSION_COMBINATIONS.EVENT_MANAGEMENT,
    category: 'events'
  },
  { 
    name: 'Calendar', 
    href: '/admin/calendar', 
    icon: Calendar,
    permissions: PERMISSION_COMBINATIONS.CALENDAR_ACCESS,
    category: 'events'
  },
  { 
    name: 'People', 
    href: '/admin/people', 
    icon: Users,
    permissions: ['people:read', 'people:list'],
    category: 'events'
  },
];

// Utility navigation items
export const utilityNavigation: NavigationItem[] = [
  { 
    name: 'Notifications', 
    href: '/admin/notifications', 
    icon: Bell, 
    badge: '5',
    permissions: ['notifications:read'],
    category: 'utility'
  },
  { 
    name: 'Documents', 
    href: '/admin/documents', 
    icon: FileText,
    permissions: ['documents:read'],
    category: 'utility'
  },
  { 
    name: 'Help', 
    href: '/admin/help', 
    icon: HelpCircle,
    permissions: [], // Always accessible
    category: 'utility'
  },
];

// All navigation items combined
export const allNavigation = [
  ...mainNavigation,
  ...businessNavigation,
  ...eventNavigation,
  ...utilityNavigation,
];

// Navigation organized by categories
export const navigationByCategory = {
  overview: mainNavigation.filter(item => item.category === 'overview'),
  users: mainNavigation.filter(item => item.category === 'users'),
  rbac: mainNavigation.filter(item => item.category === 'rbac'),
  business: businessNavigation,
  events: eventNavigation,
  utility: utilityNavigation,
};

// Permission groups for easier management
export const permissionGroups = {
  users: ['users:read', 'users:list', 'users:create', 'users:update', 'users:delete'],
  roles: ['roles:read', 'roles:list', 'roles:create', 'roles:update', 'roles:delete'],
  permissions: ['permissions:read', 'permissions:list', 'permissions:create', 'permissions:update', 'permissions:delete'],
  rbac: ['rbac:read', 'rbac:manage'],
  products: ['products:read', 'products:list', 'products:create', 'products:update', 'products:delete'],
  reports: ['reports:read', 'reports:generate', 'reports:export'],
  events: ['events:read', 'events:create', 'events:update', 'events:delete', 'events:manage'],
  schedule: ['schedule:read', 'schedule:update'],
  calendar: ['calendar:read', 'calendar:update'],
  people: ['people:read', 'people:list', 'people:create', 'people:update', 'people:delete'],
  notifications: ['notifications:read', 'notifications:create', 'notifications:update', 'notifications:delete'],
  documents: ['documents:read', 'documents:create', 'documents:update', 'documents:delete'],
};
