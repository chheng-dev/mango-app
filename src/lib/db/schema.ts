// Central schema exports - Import all schemas from individual files
export * from './schemas/users';
export * from './schemas/permissions';
export * from './schemas/roles';
export * from './schemas/role_permission';
export * from './schemas/user_roles';

// Re-export for backward compatibility and convenience
export { users } from './schemas/users';
export { permissions } from './schemas/permissions';
export { roles } from './schemas/roles';
export { rolePermissions } from './schemas/role_permission';
export { userRoles } from './schemas/user_roles';

// Export all types in one place
export type {
  User,
  NewUser
} from './schemas/users';

export type {
  Permission,
  NewPermission
} from './schemas/permissions';

export type {
  Role,
  NewRole
} from './schemas/roles';

export type {
  RolePermission,
  NewRolePermission
} from './schemas/role_permission';

export type {
  UserRole,
  NewUserRole
} from './schemas/user_roles';

