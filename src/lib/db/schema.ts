import { NewProduct, Product } from './schemas/products';

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
export { products } from './schemas/products';
export { stock } from './schemas/stock';
export { warehouse } from './schemas/warehose';
export { employees } from './schemas/employees';
export { customers } from './schemas/customers';
export { quotationHeader } from './schemas/quotations';
export { quotationLine } from './schemas/quotation_line';
export { contactPersons } from './schemas/contact_persons';


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

export type {
  Product,
  NewProduct  
} from './schemas/products';

export type {
  Stock,
  NewStock
} from './schemas/stock';

export type {
  Warehouse,
  NewWarehouse
} from './schemas/warehose';
