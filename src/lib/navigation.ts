import { PERMISSIONS } from '@/lib/constants/permissions';
import {
  Calendar,
  Cog,
  Database,
  Globe,
  Home,
  Package,
  Palette,
  RotateCcw,
  Settings,
  ShoppingBag,
  Tag,
  TrendingUp,
  UserCheck,
  Users
} from 'lucide-react';

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
    name: 'Home', 
    href: '/admin', 
    icon: Home,
    permissions: [], 
    category: 'overview'
  },
  { 
    name: 'Orders', 
    href: '/admin/orders', 
    icon: ShoppingBag,
    permissions: [PERMISSIONS.USER_READ],
    category: 'orders',
    badge: '2'
  },
  { 
    name: 'Returns', 
    href: '/admin/returns', 
    icon: RotateCcw,
    permissions: [PERMISSIONS.USER_READ],
    category: 'returns'
  },
];

// User Section
export const userManagementNavigation: NavigationItem[] = [
  { 
    name: 'Users', 
    href: '/admin/users', 
    icon: Package,
    permissions: [PERMISSIONS.USER_READ],
    category: 'users'
  },
  {
    name: 'Customers',
    href: '/admin/customers',
    icon: Users,
    permissions: [PERMISSIONS.USER_READ],
    category: 'setup'
  },
  {
    name: 'Employees',
    href: '/admin/user-management/employees',
    icon: Users,
    permissions: [PERMISSIONS.USER_READ],
    category: 'setup'
  },
  { 
    name: 'Roles', 
    href: '/admin/roles', 
    icon: Tag,
    permissions: [PERMISSIONS.ROLE_READ],
    category: 'users'
  },
  { 
    name: 'Permissions', 
    href: '/admin/permissions', 
    icon: Cog,
    permissions: [PERMISSIONS.PERMISSION_READ],
    category: 'users'
  },
];

// Products Section
export const productsNavigation: NavigationItem[] = [
  { 
    name: 'Stock', 
    href: '/admin/products/stock', 
    icon: Package,
    permissions: [PERMISSIONS.SYSTEM_ADMIN],
    category: 'products'
  },
  { 
    name: 'Taxonomies', 
    href: '/admin/products/taxonomies', 
    icon: Tag,
    permissions: [PERMISSIONS.SYSTEM_ADMIN],
    category: 'products'
  },
  { 
    name: 'Options', 
    href: '/admin/products/options', 
    icon: Cog,
    permissions: [PERMISSIONS.SYSTEM_ADMIN],
    category: 'products'
  },
  { 
    name: 'Properties', 
    href: '/admin/products/properties', 
    icon: Settings,
    permissions: [PERMISSIONS.SYSTEM_ADMIN],
    category: 'products'
  },
];

export const businessNavigation: NavigationItem[] = [
  { 
    name: 'Vendors', 
    href: '/admin/vendors', 
    icon: UserCheck,
    permissions: [PERMISSIONS.SYSTEM_ADMIN],
    category: 'business',
    badge: 'Enterprise'
  },
  { 
    name: 'Customers', 
    href: '/admin/customers', 
    icon: Users,
    permissions: [PERMISSIONS.USER_READ],
    category: 'business'
  },
  { 
    name: 'Promotions', 
    href: '/admin/promotions', 
    icon: Tag,
    permissions: [PERMISSIONS.SYSTEM_ADMIN],
    category: 'business'
  },
  { 
    name: 'Reports', 
    href: '/admin/reports', 
    icon: TrendingUp,
    permissions: [PERMISSIONS.SYSTEM_ADMIN],
    category: 'business'
  },
];

// Storefront Section
export const storefrontNavigation: NavigationItem[] = [
  { 
    name: 'Users', 
    href: '/admin/users',
    icon: Palette,
    permissions: [PERMISSIONS.USER_READ],
    category: 'storefront'
  },
  { 
    name: 'Pages', 
    href: '/admin/storefront/pages', 
    icon: Globe,
    permissions: [PERMISSIONS.SYSTEM_ADMIN],
    category: 'storefront'
  },
  { 
    name: 'Posts', 
    href: '/admin/storefront/posts', 
    icon: Settings,
    permissions: [PERMISSIONS.SYSTEM_ADMIN],
    category: 'storefront'
  },
  { 
    name: 'Settings', 
    href: '/admin/storefront/settings', 
    icon: Cog,
    permissions: [PERMISSIONS.SYSTEM_ADMIN],
    category: 'storefront'
  },
];

export const integrationsNavigation: NavigationItem[] = [
  { 
    name: 'API Settings', 
    href: '/admin/integrations/api', 
    icon: Database,
    permissions: [PERMISSIONS.SYSTEM_ADMIN],
    category: 'integrations'
  },
  { 
    name: 'Webhooks', 
    href: '/admin/integrations/webhooks', 
    icon: Globe,
    permissions: [PERMISSIONS.SYSTEM_ADMIN],
    category: 'integrations'
  },
  { 
    name: 'Third Party', 
    href: '/admin/integrations/third-party', 
    icon: Cog,
    permissions: [PERMISSIONS.SYSTEM_ADMIN],
    category: 'integrations'
  },
];

export const eventNavigation: NavigationItem[] = [
  { 
    name: 'My Schedule', 
    href: '/admin/schedule', 
    icon: Calendar,
    permissions: [PERMISSIONS.PROFILE_READ],
    category: 'events'
  },
  { 
    name: 'Manage Events', 
    href: '/admin/events', 
    icon: Settings,
    permissions: [PERMISSIONS.SYSTEM_ADMIN], 
    category: 'events'
  },
  { 
    name: 'Calendar', 
    href: '/admin/calendar', 
    icon: Calendar,
    permissions: [PERMISSIONS.PROFILE_READ],
    category: 'events'
  },
  { 
    name: 'People', 
    href: '/admin/people', 
    icon: Users,
    permissions: [PERMISSIONS.USER_READ], 
    category: 'events'
  },
];


// All navigation items combined
export const allNavigation = [
  ...mainNavigation,
  ...productsNavigation,
  ...userManagementNavigation,
  ...businessNavigation,
  ...storefrontNavigation,
  ...integrationsNavigation,
  ...eventNavigation,
];

// Navigation organized by categories
export const navigationByCategory = {
  overview: mainNavigation.filter(item => item.category === 'overview'),
  products: productsNavigation,
  userManagement: userManagementNavigation,
  business: businessNavigation,
  storefront: storefrontNavigation,
  integrations: integrationsNavigation,
  events: eventNavigation,
};

// Permission groups for easier management
// export const permissionGroups = {
//   users: [PERMISSIONS.USER_READ, PERMISSIONS.USER_CREATE, PERMISSIONS.USER_UPDATE, PERMISSIONS.USER_DELETE],
//   roles: [PERMISSIONS.ROLE_READ, PERMISSIONS.ROLE_CREATE, PERMISSIONS.ROLE_UPDATE, PERMISSIONS.ROLE_DELETE],
//   permissions: [PERMISSIONS.PERMISSION_READ, PERMISSIONS.PERMISSION_CREATE, PERMISSIONS.PERMISSION_UPDATE, PERMISSIONS.PERMISSION_DELETE],
//   system: [PERMISSIONS.SYSTEM_ADMIN, PERMISSIONS.SYSTEM_SETTINGS],
//   profile: [PERMISSIONS.PROFILE_READ, PERMISSIONS.PROFILE_UPDATE],
// };
