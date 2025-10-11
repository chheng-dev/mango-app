import { boolean, decimal, pgTable, timestamp, varchar } from "drizzle-orm/pg-core";
import { customers } from "./customers";
import { employees } from "./employees";
import { users } from "./users";

export const quotationHeader = pgTable("tbl_quotationHeader", {
  qhCode: varchar("qhCode", { length: 15 }).primaryKey(),
  qhType: varchar("qhType", { length: 10 }),
  qhStatus: boolean("qhStatus"),
  qhPostingDate: timestamp("qhPostingDate"),
  qhValidDate: timestamp("qhValidDate"),
  qlDocDate: timestamp("qlDocDate"),
  cCode: varchar("cCode", { length: 50 }).references(() => customers.cCode),
  eCode: varchar("eCode", { length: 50 }).references(() => employees.eCode),
  qhProjectID: varchar("qhProjectID", { length: 50 }),
  qhProjectName: varchar("qhProjectName", { length: 255 }),
  qhPaymentCode: varchar("qhPaymentCode", { length: 50 }),
  qhPaymentName: varchar("qhPaymentName", { length: 255 }),
  qhShipping: varchar("qhShipping", { length: 50 }),
  qlPicDelDate: timestamp("qlPicDelDate"),
  qhDestinationCode: varchar("qhDestinationCode", { length: 50 }),
  qhDestinationName: varchar("qhDestinationName", { length: 255 }),
  qhGTotal: decimal("qhGTotal", { precision: 19, scale: 2 }),
  qhDiscount: decimal("qhDiscount", { precision: 19, scale: 2 }),
  qhTotal: decimal("qhTotal", { precision: 19, scale: 2 }),
  qhCreatedAt: timestamp("qhCreatedAt"),
  qhCreatedBy: varchar("qhCreatedBy", { length: 25 }).references(() => users.code),
  qhLastUpdateAt: timestamp("qhLastUpdateAt"),
  qhLastUpdateBy: varchar("qhLastUpdateBy", { length: 25 }).references(() => users.code),
  qhApprovedAt: timestamp("qhApprovedAt"),
  qhApprovedBy: varchar("qhApprovedBy", { length: 25 }).references(() => users.code),
  qhClosedAt: timestamp("qhClosedAt"),
  qhClosedBy: varchar("qhClosedBy", { length: 25 }).references(() => users.code),
});
