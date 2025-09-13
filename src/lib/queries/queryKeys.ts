/**
 * Query keys for TanStack Query - centralized management
 */

export const queryKeys = {
  // Auth related queries
  auth: {
    user: ['auth', 'user'] as const,
    permissions: (userId: number) => ['user-permissions', userId] as const,
  },

  // User management queries
  users: {
    all: ['users'] as const,
    list: (filters?: any) => ['users', 'list', filters] as const,
    detail: (id: number) => ['users', 'detail', id] as const,
    permissions: (id: number) => ['users', 'permissions', id] as const,
  },

  // Role management queries
  roles: {
    all: ['roles'] as const,
    list: (filters?: any) => ['roles', 'list', filters] as const,
    detail: (id: number) => ['roles', 'detail', id] as const,
    permissions: (id: number) => ['roles', 'permissions', id] as const,
  },

  // Permission management queries
  permissions: {
    all: ['permissions'] as const,
    list: (filters?: any) => ['permissions', 'list', filters] as const,
    detail: (id: number) => ['permissions', 'detail', id] as const,
  },

  // RBAC queries
  rbac: {
    userRoles: (userId: number) => ['rbac', 'user-roles', userId] as const,
    roleUsers: (roleId: number) => ['rbac', 'role-users', roleId] as const,
    dashboard: ['rbac', 'dashboard'] as const,
  },
} as const;
