import { pgTable, varchar, doublePrecision } from "drizzle-orm/pg-core";
import { products } from "./products";
import { warehouse } from "./warehose";

export const stocks = pgTable("tbl_stock", {
  pCode: varchar("pCode", { length: 25 }).primaryKey().references(() => products.code),
  wCode: varchar("wCode", { length: 25 }).references(() => warehouse.wCode),
  pInstock: doublePrecision("pInstock"),
  pCommited: doublePrecision("pCommited"),
  pOrderd: doublePrecision("pOrderd"),
  pAvailable: doublePrecision("pAvailable"),
});
