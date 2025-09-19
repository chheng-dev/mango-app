import { users } from "../db/schema";
import { Permission } from "../db/schemas/permissions";
import { Role } from "../db/schemas/roles";

export interface UserWithRoles extends Omit<typeof users.$inferSelect, 'passwordHash' | 'passwordConfirmation'> { 
  roles: (
    Role & {
      permissions: Permission[]; 
    }
  )[];
}