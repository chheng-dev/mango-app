'use client';

import { useState } from 'react';
import { usePathname } from 'next/navigation';
import { useUserPermissions } from '@/hooks/useUserPermissions';
import {
  mainNavigation,
  productsNavigation,
  businessNavigation,
  storefrontNavigation,
  integrationsNavigation,
  userManagementNavigation,
} from '@/lib/navigation';
import { Users, Package, Store, Globe, Settings } from 'lucide-react';
import {
  Sidebar as SidebarPrimitive,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
} from '@/components/ui/sidebar';
import { NavigationMenuItem } from './navigation-menu-item';
import { SettingsDropdownMenuItem } from './settings-dropdown-menu-item';
import { UserProfileDropdown } from './user-profile-dropdown';
import { SidebarHeader as CustomSidebarHeader } from './sidebar-header';

interface SidebarProps {
  className?: string;
}

export function Sidebar({ className }: SidebarProps) {
  const pathname = usePathname();
  const { isError } = useUserPermissions();
  const [expandedSection, setExpandedSection] = useState<string | null>(
    pathname.includes('/products') ? 'products' :
    pathname.includes('/storefront') ? 'storefront' :
    pathname.includes('/integrations') ? 'integrations' :
    pathname.includes('/users') || pathname.includes('/roles') || pathname.includes('/permissions') ? 'userManagement' :
    null
  );

  return (
    <SidebarPrimitive side="left" variant="inset" className={className}>
      <SidebarHeader>
        <CustomSidebarHeader />
      </SidebarHeader>

      <SidebarContent>
        {isError && (
          <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-600 mx-2">
            Failed to load permissions
          </div>
        )}

        {/* Main Navigation */}
        <SidebarGroup>
          <SidebarMenu>
            {mainNavigation.map((item) => (
              <NavigationMenuItem key={item.name} item={item} pathname={pathname} />
            ))}
          </SidebarMenu>
        </SidebarGroup>

        {/* Products Section */}
        <SidebarGroup>
          <SidebarGroupLabel>
            <Package className="h-4 w-4 mr-2" />
            Products
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {productsNavigation.map((item) => (
                <NavigationMenuItem key={item.name} item={item} pathname={pathname} isSubItem />
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Business Navigation */}
        <SidebarGroup>
          <SidebarMenu>
            {businessNavigation.map((item) => (
              <NavigationMenuItem key={item.name} item={item} pathname={pathname} />
            ))}
          </SidebarMenu>
        </SidebarGroup>

        {/* Storefront Section */}
        <SidebarGroup>
          <SidebarGroupLabel>
            <Store className="h-4 w-4 mr-2" />
            Storefront
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {storefrontNavigation.map((item) => (
                <NavigationMenuItem key={item.name} item={item} pathname={pathname} isSubItem />
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Integrations Section */}
        <SidebarGroup>
          <SidebarGroupLabel>
            <Globe className="h-4 w-4" />
            Integrations
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {integrationsNavigation.map((item) => (
                <NavigationMenuItem key={item.name} item={item} pathname={pathname} isSubItem />
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Settings Section */}
        <SidebarGroup>
          <SidebarGroupLabel>
            <Settings className="h-4 w-4 mr-2" />
            Settings
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SettingsDropdownMenuItem 
                title="User Management"
                icon={Users}
                items={userManagementNavigation}
                pathname={pathname}
                isExpanded={expandedSection === 'userManagement'}
                onToggle={() => setExpandedSection(expandedSection === 'userManagement' ? null : 'userManagement')}
              />
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      {/* Footer */}
      <SidebarFooter>
        <UserProfileDropdown />
      </SidebarFooter>
    </SidebarPrimitive>
  );
}
