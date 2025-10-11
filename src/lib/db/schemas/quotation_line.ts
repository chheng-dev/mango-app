import { doublePrecision, integer, pgTable, varchar } from "drizzle-orm/pg-core";
import { stocks } from "./stocks";
import { quotationHeader } from "./quotations";

export const quotationLine = pgTable("tbl_quotationLine", {
  qlID: integer("qlID").primaryKey(),
  qhCode: varchar("qhCode", { length: 15 }).references(() => quotationHeader.qhCode),
  qlLineNo: integer("qlLineNo"),
  qlpCode: varchar("qlpCode", { length: 25 }).references(() => stocks.pCode),
  qlpName: varchar("qlpName", { length: 100 }),
  qlpBaseUnit: varchar("qlpBaseUnit", { length: 10 }),
  qlpUnitPrice: doublePrecision("qlpUnitPrice"),
  qlQty: doublePrecision("qlQty"),
  qlGrandTotal: doublePrecision("qlGrandTotal"),
  qlDiscount: doublePrecision("qlDiscount"),
  qlTotal: doublePrecision("qlTotal"),
  qlRemark: varchar("qlRemark", { length: 255 }),
});
