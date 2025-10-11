import { pgTable, serial, varchar, text, timestamp } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

export const products = pgTable("products", {
  id: serial("id").primaryKey(),
  code: varchar("code", { length: 100 }).notNull().unique(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  baseUnit: varchar("base_unit", { length: 50 }).notNull(),
  unitPrice: varchar("unit_price", { length: 50 }).notNull(),
  status: varchar("status", { length: 50 }).notNull(),
  lastUpdatedBy: varchar("last_updated_by", { length: 100 }).notNull(),
  createdAt: timestamp('created_at').default(sql`CURRENT_TIMESTAMP`).notNull(),
  updatedAt: timestamp('updated_at').default(sql`CURRENT_TIMESTAMP`).notNull(),
});

export type Product = typeof products.$inferSelect;
export type NewProduct = typeof products.$inferInsert;