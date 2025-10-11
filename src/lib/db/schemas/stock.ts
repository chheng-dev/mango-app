import { pgTable, varchar, doublePrecision } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { warehouse } from "./warehose";
import { products } from "./products";

export const stock = pgTable("stock", {
  pCode: varchar("p_code", { length: 25 }).primaryKey(),
  wCode: varchar("w_code", { length: 25 }).notNull(),
  pInstock: doublePrecision("p_instock").notNull(),
  pCommited: doublePrecision("p_commited").notNull(),
  pOrderd: doublePrecision("p_orderd").notNull(),
  pAvailable: doublePrecision("p_available").notNull(),
});

export const stockRelations = relations(stock, ({ one }) => ({
  warehouse: one(warehouse, {
    fields: [stock.wCode],
    references: [warehouse.wCode],
  }),
  product: one(products, {
    fields: [stock.pCode],
    references: [products.code], 
  }),
}));

export type Stock = typeof stock.$inferSelect;
export type NewStock = typeof stock.$inferInsert;