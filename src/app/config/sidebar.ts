import { SidebarGroup } from "@/types/navigation";

const locale = 'en'
export const sidebarConfig: SidebarGroup[] = [
  {
    title: 'Main',
    items: [
      {
        id: 'dashboard',
        label: 'Dashboard',
        path: `/${locale}/admin`,
        icon: 'dashboard',
        resource: 'dashboard',
        action: 'read',
      },
    ],
  },
  {
      title: 'Management',
      items: [
        {
          id: 'users',
          label: 'User Management',
          icon: 'users',
          path: `/${locale}/admin/users`,
          resource: 'user',
          action: 'read',
        },
        {
          id: 'roles',
          label: 'Role Management',
          icon: 'shield',
          path: `/${locale}/admin/roles`,
          resource: 'role',
          action: 'read',
        },
      ]
    },
    {
      title: 'System',
      items: [
        {
          id: 'settings',
          label: 'Settings',
          icon: 'settings',
          path: `/${locale}/admin/settings`,
          resource: 'setting',
          action: 'read',
        },
        {
          id: 'audit',
          label: 'Audit Logs',
          icon: 'activity',
          path: `/${locale}/audit`,
          resource: 'system',
          action: 'read',
        },
        {
          id: 'reports',
          label: 'Reports',
          icon: 'bar-chart',
          resource: 'report',
          action: 'read',
          children: [
            {
              id: 'user-reports',
              label: 'User Reports',
              path: `/${locale}/reports/users`,
              resource: 'report',
              action: 'user',
            },
            {
              id: 'system-reports',
              label: 'System Reports',
              path: `/${locale}/reports/system`,
              resource: 'report',
              action: 'system',
            }
          ]
        }
      ]
    }
];

