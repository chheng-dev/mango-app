/**
 * Application Permissions
 */
export const PERMISSIONS = {
  // User permissions
  USER_READ: 'user:read',
  USER_CREATE: 'user:create',
  USER_UPDATE: 'user:update',
  USER_DELETE: 'user:delete',
  
  // Role permissions
  ROLE_READ: 'role:read',
  ROLE_CREATE: 'role:create',
  ROLE_UPDATE: 'role:update',
  ROLE_DELETE: 'role:delete',
  
  // Permission permissions
  PERMISSION_READ: 'permission:read',
  PERMISSION_CREATE: 'permission:create',
  PERMISSION_UPDATE: 'permission:update',
  PERMISSION_DELETE: 'permission:delete',
  
  // System permissions
  SYSTEM_ADMIN: 'system:admin',
  SYSTEM_SETTINGS: 'system:settings',
  
  // Profile permissions
  PROFILE_READ: 'profile:read',
  PROFILE_UPDATE: 'profile:update',
} as const;

/**
 * Application Roles
 */
export const ROLES = {
  SUPER_ADMIN: 'super-admin',
  ADMIN: 'admin',
  MANAGER: 'manager',
  USER: 'user',
} as const;

/**
 * Default role permissions mapping
 */
export const DEFAULT_ROLE_PERMISSIONS = {
  [ROLES.SUPER_ADMIN]: [
    PERMISSIONS.USER_READ,
    PERMISSIONS.USER_CREATE,
    PERMISSIONS.USER_UPDATE,
    PERMISSIONS.USER_DELETE,
    PERMISSIONS.ROLE_READ,
    PERMISSIONS.ROLE_CREATE,
    PERMISSIONS.ROLE_UPDATE,
    PERMISSIONS.ROLE_DELETE,
    PERMISSIONS.PERMISSION_READ,
    PERMISSIONS.PERMISSION_CREATE,
    PERMISSIONS.PERMISSION_UPDATE,
    PERMISSIONS.PERMISSION_DELETE,
    PERMISSIONS.SYSTEM_ADMIN,
    PERMISSIONS.SYSTEM_SETTINGS,
    PERMISSIONS.PROFILE_READ,
    PERMISSIONS.PROFILE_UPDATE,
  ],
  [ROLES.ADMIN]: [
    PERMISSIONS.USER_READ,
    PERMISSIONS.USER_CREATE,
    PERMISSIONS.USER_UPDATE,
    PERMISSIONS.ROLE_READ,
    PERMISSIONS.PERMISSION_READ,
    PERMISSIONS.SYSTEM_SETTINGS,
    PERMISSIONS.PROFILE_READ,
    PERMISSIONS.PROFILE_UPDATE,
  ],
  [ROLES.MANAGER]: [
    PERMISSIONS.USER_READ,
    PERMISSIONS.PROFILE_READ,
    PERMISSIONS.PROFILE_UPDATE,
  ],
  [ROLES.USER]: [
    PERMISSIONS.PROFILE_READ,
    PERMISSIONS.PROFILE_UPDATE,
  ],
} as const;
