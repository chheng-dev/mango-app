export interface Permission {
  id: number,
  resource: string,
  action: string,
  description?: string,
}

export interface Role {
  id: number,
  name: string,
  description?: string,
  isSystemRole: boolean,
  permissions: [],
  createdAt: string,
  updatedAt: string
}

export interface User {
  id: number,
  email: string,
  role: Role,
  isActive: boolean,
  createdAt: string,
  updatedAt: string
}

export interface CreatePermissionInput {
  resource: string,
  action: string,
  description?: string,
}

export interface CreateRoleInput {
  name: string,
  description?: string,
  permissionIds: string[]
}

export interface UpdateRoleInput {
  name?: string,
  description?: string,
  permissionIds?: []
}

export interface PermissionCheck {
  resource: string,
  action: string
}

export const SYSTEM_ROLES = {
  SUPER_ADMIN: 'super_admin',
  ADMIN: 'admin',
  USER: 'user'
} as const;

export const RESOURCES = {
  USER: 'user',
  ROLE: 'role',
  PERMISSION: 'permission',
  SETTING: 'setting',
  SYSTEM: 'system',
} as const;

export const SETTINGS = {
  GENERAL: 'general',
  SECURITY: 'security',
  NOTIFICATIONS: 'notifications'
} as const;

export const SYSTEM = {
  AUDIT: 'audit',
  LOGS: 'logs',
  MONITORING: 'monitoring'
} as const;

export const ACTIONS = {
  READ: 'read',
  CREATE: 'create',
  UPDATE: 'update',
  DELETE: 'delete',
  MANAGE: 'manage',
} as const;
