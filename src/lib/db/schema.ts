// Central schema exports - Import all schemas from individual files
export * from './schemas/users';

// Re-export for backward compatibility and convenience
export { users } from './schemas/users';

// Export all types in one place
export type {
  User,
  NewUser
} from './schemas/users';

