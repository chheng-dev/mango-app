
export const PERMISSIONS = {
  // User permissions - using underscore format to match database
  USERS_READ: 'user_read',
  USERS_CREATE: 'user_create',
  USERS_UPDATE: 'user_update',
  USERS_DELETE: 'user_delete',
  USERS_EXPORT: 'user_export',

  // Role permissions - using underscore format to match database
  ROLES_READ: 'roles_read',
  ROLES_CREATE: 'roles_create',
  ROLES_UPDATE: 'roles_update',
  ROLES_DELETE: 'roles_delete',
  ROLES_EXPORT: 'roles_export',

  // Permission permissions - using underscore format to match database
  PERMISSIONS_READ: 'permissions_read',
  PERMISSIONS_CREATE: 'permissions_create',
  PERMISSIONS_UPDATE: 'permissions_update',
  PERMISSIONS_EXPORT: 'permissions_export',
  PERMISSIONS_DELETE: 'permissions_delete',
  
  // Profile permissions - using underscore format to match database
  PROFILES_READ: 'profiles_read',
  PROFILES_UPDATE: 'profiles_update',

  // Contact person permissions - using underscore format to match database
  CONTACT_PERSON_READ: 'contact_person_read',
  CONTACT_PERSON_CREATE: 'contact_person_create',
  CONTACT_PERSON_UPDATE: 'contact_person_update',
  CONTACT_PERSON_DELETE: 'contact_person_delete',
} as const;

// Type exports
export type Permission = typeof PERMISSIONS[keyof typeof PERMISSIONS];
