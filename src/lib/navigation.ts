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
import { PERMISSIONS } from './constants/permissions';

export interface NavigationItem {
  name: string;
  href: string;
  icon: any;
  permissions: readonly string[];
  badge?: string;
}

export const mainNavigation: NavigationItem[] = [
  { 
    name: 'Home', 
    href: '/admin', 
    icon: Home,
    permissions: []
  },
  { 
    name: 'Orders', 
    href: '/admin/orders', 
    icon: ShoppingBag,
    permissions: [],
    badge: '2'
  },
  { 
    name: 'Returns', 
    href: '/admin/returns', 
    icon: RotateCcw,
    permissions: []
  },
];

/**
 * Products section - collapsible
 */
export const productsNavigation: NavigationItem[] = [
  { 
    name: 'Stock', 
    href: '/admin/products/stock', 
    icon: Package,
    permissions: []
  },
  { 
    name: 'Taxonomies', 
    href: '/admin/products/taxonomies', 
    icon: Tag,
    permissions: []
  },
  { 
    name: 'Options', 
    href: '/admin/products/options', 
    icon: Cog,
    permissions: []
  },
  { 
    name: 'Properties', 
    href: '/admin/products/properties', 
    icon: Settings,
    permissions: []
  },
];

/**
 * Business section - individual items
 */
export const businessNavigation: NavigationItem[] = [
  { 
    name: 'Vendors', 
    href: '/admin/vendors', 
    icon: UserCheck,
    permissions: []
  },
  { 
    name: 'Customers', 
    href: '/admin/customers', 
    icon: Users,
    permissions: []
  },
  { 
    name: 'Promotions', 
    href: '/admin/promotions', 
    icon: Tag,
    permissions: []
  },
  { 
    name: 'Reports', 
    href: '/admin/reports', 
    icon: TrendingUp,
    permissions: []
  },
];

/**
 * Storefront section - collapsible
 */
export const storefrontNavigation: NavigationItem[] = [
  { 
    name: 'Themes', 
    href: '/admin/storefront/themes',
    icon: Palette,
    permissions: []
  },
  { 
    name: 'Pages', 
    href: '/admin/storefront/pages', 
    icon: Globe,
    permissions: []
  },
  { 
    name: 'Posts', 
    href: '/admin/storefront/posts', 
    icon: Settings,
    permissions: []
  },
  { 
    name: 'Settings', 
    href: '/admin/storefront/settings', 
    icon: Cog,
    permissions: []
  },
];

/**
 * Integrations section - collapsible
 */
export const integrationsNavigation: NavigationItem[] = [
  { 
    name: 'API Settings', 
    href: '/admin/integrations/api', 
    icon: Database,
    permissions: []
  },
  { 
    name: 'Webhooks', 
    href: '/admin/integrations/webhooks', 
    icon: Globe,
    permissions: []
  },
  { 
    name: 'Third Party', 
    href: '/admin/integrations/third-party', 
    icon: Cog,
    permissions: []
  },
];

export const userManagementNavigation: NavigationItem[] = [
  { 
    name: 'Users', 
    href: '/admin/users', 
    icon: Users,
    permissions: ['users_read']
  },
  { 
    name: 'Contact Persons', 
    href: '/admin/contact-persons', 
    icon: Users,
    permissions: [PERMISSIONS.CONTACT_PERSON_READ]
  },
  { 
    name: 'Roles', 
    href: '/admin/roles', 
    icon: Tag,
    permissions: ['roles_read']
  },
  { 
    name: 'Permissions', 
    href: '/admin/permissions', 
    icon: Cog,
    permissions: ['permissions_read']
  },
];
