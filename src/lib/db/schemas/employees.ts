import { pgTable, varchar, boolean, date, timestamp } from "drizzle-orm/pg-core";
import { users } from "./users";

export const employees = pgTable("tbl_employee", {
  eCode: varchar("eCode", { length: 25 }).primaryKey(),
  eName: varchar("eName", { length: 100 }),
  eDescription: varchar("eDescription", { length: 255 }),
  eGender: varchar("eGender", { length: 7 }),
  eDOB: date("eDOB"),
  eAddress: varchar("eAddress", { length: 255 }),
  eTel: varchar("eTel", { length: 50 }),
  eEmail: varchar("eEmail", { length: 50 }),
  eStatus: boolean("eStatus"),
  eCreatedAt: timestamp("eCreatedAt"),
  eCreatedBy: varchar("eCreatedBy", { length: 25 }).references(() => users.code),
  eLastUpdateAt: timestamp("eLastUpdateAt"),
  eLastUpdateBy: varchar("eLastUpdateBy", { length: 25 }).references(() => users.code),
});
