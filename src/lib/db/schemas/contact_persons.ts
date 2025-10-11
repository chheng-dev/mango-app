import { pgTable, varchar, boolean, timestamp } from "drizzle-orm/pg-core";
import { users } from "./users";
import { customers } from "./customers";

export const contactPersons = pgTable("tbl_contactPerson", {
  cpCode: varchar("cpCode", { length: 25 }).primaryKey(),
  cpName: varchar("cpName", { length: 100 }),
  cCode: varchar("cCode", { length: 25 }).references(() => customers.cCode),
  cTel: varchar("cTel", { length: 50 }),
  cEmail: varchar("cEmail", { length: 50 }),
  cStatus: boolean("cStatus"),
  cpCreatedAt: timestamp("cpCreatedAt"),
  cpCreatedBy: varchar("cpCreatedBy", { length: 25 }).references(() => users.code),
  cpLastUpdateAt: timestamp("cpLastUpdateAt"),
  cpLastUpdateBy: varchar("cpLastUpdateBy", { length: 25 }).references(() => users.code),
});
