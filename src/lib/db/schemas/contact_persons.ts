import { pgTable, varchar, boolean, timestamp } from "drizzle-orm/pg-core";
import { users } from "./users";
import { customers } from "./customers";
import { sql } from "drizzle-orm";

export const contactPersons = pgTable("tbl_contactPerson", {
  cpCode: varchar("cpCode", { length: 25 }).primaryKey(),
  cpName: varchar("cpName", { length: 100 }).notNull(),
  cCode: varchar("cCode", { length: 25 }).references(() => customers.cCode),
  cTel: varchar("cTel", { length: 50 }),
  cEmail: varchar("cEmail", { length: 50 }).notNull().unique(),
  cStatus: boolean("cStatus").default(true),
  cpCreatedAt: timestamp("cpCreatedAt").defaultNow().notNull(),
  cpCreatedBy: varchar("cpCreatedBy", { length: 25 }).references(() => users.code),
  cpLastUpdateAt: timestamp("cpLastUpdateAt").defaultNow().notNull(),
  cpLastUpdateBy: varchar("cpLastUpdateBy", { length: 25 }).references(() => users.code),
});

export type ContactPerson = typeof contactPersons.$inferSelect;
export type ContactPersonInsert = typeof contactPersons.$inferInsert;