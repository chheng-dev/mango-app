import { customers } from "../db/schema";
import { BaseModel } from "./BaseModel";

export type CustomerSelect = typeof customers.$inferSelect;
export type CustomerInsert = typeof customers.$inferInsert;

export class CustomerModel extends BaseModel<CustomerSelect, CustomerInsert> {
  protected tableName: string = "tbl_customers";
  protected table = customers;
  
  constructor() { 
    super(  
      [customers.cCode, customers.cName, customers.cAddress, customers.cEmail],
      ['cCode', 'cName', 'cEmail'],
      {
        primaryKey: 'cCode',
        createdAtField: 'cCreatedAt',
        updatedAtField: 'cLastUpdateAt'
      }
    );
  }
}