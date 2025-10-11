import { pgTable, varchar, boolean, timestamp } from "drizzle-orm/pg-core";
import { users } from "./users";

export const customers = pgTable("tbl_customer", {
  cCode: varchar("cCode", { length: 25 }).primaryKey(),
  cName: varchar("cName", { length: 100 }),
  cDescription: varchar("cDescription", { length: 255 }),
  cAddress: varchar("cAddress", { length: 255 }),
  cTel: varchar("cTel", { length: 50 }),
  cEmail: varchar("cEmail", { length: 50 }),
  cStatus: boolean("cStatus"),
  cCreatedAt: timestamp("cCreatedAt"),
  cCreatedBy: varchar("cCreatedBy", { length: 25 }).references(() => users.code),
  uLastUpdateAt: timestamp("uLastUpdateAt"),
  cLastUpdateBy: varchar("cLastUpdateBy", { length: 25 }).references(() => users.code),
});
