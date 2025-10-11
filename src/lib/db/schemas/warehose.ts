import { boolean, pgTable, serial, text, varchar, timestamp } from "drizzle-orm/pg-core";
import { relations, sql } from "drizzle-orm";
import { users } from "./users";
import { stock } from "./stock";

export const warehouse = pgTable("warehouses", {
  id: serial("id").primaryKey(),
  wCode: varchar("w_code", { length: 100 }).notNull().unique(),
  wDescription: text("w_description").notNull(),
  wStatus: boolean("w_status").notNull().default(true),
  createdAt: timestamp('created_at').default(sql`CURRENT_TIMESTAMP`).notNull(),
  updatedAt: timestamp('updated_at').default(sql`CURRENT_TIMESTAMP`).notNull(),
  createdby: varchar("created_by", { length: 100 }).notNull(),
  updatedby: varchar("updated_by", { length: 100 }).notNull(),
});

export const warehouseRelations = relations(warehouse, ({one, many}) => ({
  createdBy: one(users, {
    fields: [warehouse.createdby],
    references: [users.code],
  }),
  lastUpdatedBy: one(users, {
    fields: [warehouse.updatedby],
    references: [users.code],
  }),
  stocks: many(stock),
}));

export type Warehouse = typeof warehouse.$inferSelect;
export type NewWarehouse = typeof warehouse.$inferInsert;