import {
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
  path: string;
  icon: any;
  badge?: string;
}

export const mainNavigation: NavigationItem[] = [
  { 
    name: 'Home', 
    path: '/admin', 
    icon: Home,
  },
  { 
    name: 'Orders', 
    path: '/admin/orders', 
    icon: ShoppingBag,
    badge: '2'
  },
  { 
    name: 'Returns', 
    path: '/admin/returns', 
    icon: RotateCcw,
  },
];

/**
 * Products section - collapsible
 */
export const productsNavigation: NavigationItem[] = [
  { 
    name: 'Stock', 
    path: '/admin/products/stock', 
    icon: Package,
  },
  { 
    name: 'Taxonomies', 
    path: '/admin/products/taxonomies', 
    icon: Tag,
  },
  { 
    name: 'Options', 
    path: '/admin/products/options', 
    icon: Cog,
  },
  { 
    name: 'Properties', 
    path: '/admin/products/properties', 
    icon: Settings,
  },
];

/**
 * Business section - individual items
 */
export const businessNavigation: NavigationItem[] = [
  { 
    name: 'Vendors', 
    path: '/admin/vendors', 
    icon: UserCheck,
  },
  { 
    name: 'Customers', 
    path: '/admin/customers', 
    icon: Users,
  },
  { 
    name: 'Promotions', 
    path: '/admin/promotions', 
    icon: Tag,
  },
  { 
    name: 'Reports', 
    path: '/admin/reports', 
    icon: TrendingUp,
  },
];

/**
 * Storefront section - collapsible
 */
export const storefrontNavigation: NavigationItem[] = [
  { 
    name: 'Themes', 
    path: '/admin/storefront/themes',
    icon: Palette,
  },
  { 
    name: 'Pages', 
    path: '/admin/storefront/pages', 
    icon: Globe,
  },
  { 
    name: 'Posts', 
    path: '/admin/storefront/posts', 
    icon: Settings,
  },
  { 
    name: 'Settings', 
    path: '/admin/storefront/settings', 
    icon: Cog,
  },
];

/**
 * 
 *  section - collapsible
 */
export const integrationsNavigation: NavigationItem[] = [
  { 
    name: 'API Settings', 
    path: '/admin/integrations/api', 
    icon: Database,
  },
  { 
    name: 'Webhooks', 
    path: '/admin/integrations/webhooks', 
    icon: Globe,
  },
  { 
    name: 'Third Party', 
    path: '/admin/integrations/third-party', 
    icon: Cog,
  },
];

export const userManagementNavigation: NavigationItem[] = [
  { 
    name: 'Users', 
    path: '/admin/users', 
    icon: Users,
  },
  { 
    name: 'Contact Persons', 
    path: '/admin/contact-persons', 
    icon: Users,
  },
  { 
    name: 'Customers', 
    path: '/admin/customers', 
    icon: Users,
  },
  { 
    name: 'Roles', 
    path: '/admin/roles', 
    icon: Tag,
  },
  { 
    name: 'Permissions', 
    path: '/admin/permissions', 
    icon: Cog,
  },
];
