import { relations, sql } from "drizzle-orm";
import { integer, pgTable, serial, timestamp, boolean } from "drizzle-orm/pg-core"
import { users } from "./users";
import { roles } from "./roles";

export const userRoles = pgTable('user_roles', {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  roleId: integer("role_id").references(() => roles.id, { onDelete: "cascade" }).notNull(),
  assignedBy: integer("assigned_by").references(() => users.id),
  assignedAt: timestamp("assigned_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
  expiresAt: timestamp("expires_at"),
  isActive: boolean("is_active").default(true),
});

export const usersRelations = relations(userRoles, ({ one }) => ({
  user: one(users, {
    fields: [userRoles.userId],
    references: [users.id],
  }),
  role: one(roles, {
    fields: [userRoles.roleId],
    references: [roles.id],
  }),
  assignedByUser: one(users, {
    fields: [userRoles.assignedBy],
    references: [users.id],
  }),
}));

export type UserRole = typeof userRoles.$inferSelect;
export type NewUserRole = typeof userRoles.$inferInsert;