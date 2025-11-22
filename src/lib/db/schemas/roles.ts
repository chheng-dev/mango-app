import { relations, sql } from "drizzle-orm";
import { boolean, pgTable, serial, timestamp, varchar } from "drizzle-orm/pg-core";
import { rolePermissions } from "./role_permission";
import { userRoles } from "./user_roles";

export const roles =  pgTable('roles', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 100 }).notNull().unique(),
  slug: varchar('slug', { length: 100 }).notNull().unique(),
  description: varchar('description', { length: 255 }),
  isActive: boolean('is_active').default(true),
  isSystemRole: boolean('is_system_role').default(false),
  createdAt: timestamp('created_at').default(sql`CURRENT_TIMESTAMP`).notNull(),
  updatedAt: timestamp('updated_at').default(sql`CURRENT_TIMESTAMP`).notNull(),
});

export const rolesRelations = relations(roles, ({ many }) => ({
  rolePermissions: many(rolePermissions),
  userRoles: many(userRoles),
}));

export type Role = typeof roles.$inferSelect;
export type NewRole = typeof roles.$inferInsert;