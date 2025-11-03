import { eq } from "drizzle-orm";
import { db } from "../db";
import { contactPersons } from "../db/schema";
import { customers } from "../db/schemas/customers";
import { BaseModel, ModelResponse } from "./BaseModel";

export type ContactPersonSelect = typeof contactPersons.$inferSelect;
export type ContactPersonInsert = typeof contactPersons.$inferInsert;

export class ContactPersonModel extends BaseModel<ContactPersonSelect, ContactPersonInsert> {
  protected tableName: string = "tbl_contactPerson";
  protected table = contactPersons;

  constructor() {
    super(
      [contactPersons.cpCode, contactPersons.cpName, contactPersons.cEmail, contactPersons.cTel],
      ['cpCode', 'cpName', 'cEmail'],
      {
        primaryKey: 'cpCode',
        createdAtField: 'cpCreatedAt',
        updatedAtField: 'cpLastUpdateAt'
      }
    );
  }

  // ==================== VALIDATION HELPERS ====================

  private async validateCustomerExists(cCode: string | null | undefined): Promise<void> {
    if (!cCode) {
      throw new Error('Customer code is required');
    }

    const customer = await db
      .select()
      .from(customers)
      .where(eq(customers.cCode, cCode))
      .limit(1);

    if (!customer || customer.length === 0) {
      throw new Error(`Customer '${cCode}' does not exist. Please create the customer first.`);
    }
  }

  private async validateUniqueFields(
    cpCode: string, 
    cEmail: string, 
    cpName: string, 
    excludeId?: string
  ): Promise<void> {
    const codeExists = await this.existsByField('cpCode', cpCode.toUpperCase(), excludeId);
    if (codeExists) {
      throw new Error(`Contact person code '${cpCode}' already exists`);
    }

    const emailExists = await this.existsByField('cEmail', cEmail.toLowerCase(), excludeId);
    if (emailExists) {
      throw new Error(`Email '${cEmail}' is already registered`);
    }

    const nameExists = await this.existsByField('cpName', cpName, excludeId);
    if (nameExists) {
      throw new Error(`Contact person name '${cpName}' already exists`);
    }
  }

  protected async beforeCreate(data: ContactPersonInsert): Promise<ContactPersonInsert> {
    await this.validateCustomerExists(data.cCode);

    await this.validateUniqueFields(data.cpCode, data.cEmail, data.cpName);

    return {
      ...data,
      cpCode: data.cpCode.toUpperCase(),
      cEmail: data.cEmail.toLowerCase(),
      cStatus: data.cStatus ?? true,
    };
  }

  protected async beforeUpdate(
    id: string, 
    data: Partial<ContactPersonInsert>
  ): Promise<Partial<ContactPersonInsert>> {
    if (data.cpCode && data.cpCode !== id) {
      throw new Error('Cannot change contact person code (primary key)');
    }

    if (data.cCode !== undefined) {
      await this.validateCustomerExists(data.cCode);
    }

    const updateData: Partial<ContactPersonInsert> = { ...data };
    delete updateData.cpCode; // Remove primary key

    if (updateData.cEmail) {
      updateData.cEmail = updateData.cEmail.toLowerCase();
    }

    if (updateData.cEmail) {
      const emailExists = await this.existsByField('cEmail', updateData.cEmail, id);
      if (emailExists) {
        throw new Error(`Email '${updateData.cEmail}' is already used by another contact person`);
      }
    }

    if (updateData.cpName) {
      const nameExists = await this.existsByField('cpName', updateData.cpName, id);
      if (nameExists) {
        throw new Error(`Contact person name '${updateData.cpName}' is already used by another contact person`);
      }
    }

    return updateData;
  }

  async findByCode(cpCode: string): Promise<ModelResponse<ContactPersonSelect>> {
    return this.findById(cpCode.toUpperCase());
  }

  async findByEmail(cEmail: string): Promise<ModelResponse<ContactPersonSelect>> {
    return this.findByField('cEmail', cEmail.toLowerCase());
  }

  async findByCustomer(cCode: string): Promise<ModelResponse<ContactPersonSelect[]>> {
    try {
      const result = await db
        .select()
        .from(contactPersons)
        .where(eq(contactPersons.cCode, cCode));

      return {
        success: true,
        data: result,
        message: 'Contact persons retrieved successfully'
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch contact persons'
      };
    }
  }

  async findWithCustomer(cpCode: string): Promise<ModelResponse<any>> {
    try {
      const result = await db
        .select({
          contactPerson: contactPersons,
          customer: customers,
        })
        .from(contactPersons)
        .leftJoin(customers, eq(contactPersons.cCode, customers.cCode))
        .where(eq(contactPersons.cpCode, cpCode.toUpperCase()))
        .limit(1);

      if (!result || result.length === 0) {
        return {
          success: false,
          error: 'Contact person not found'
        };
      }

      const { contactPerson, customer } = result[0];
      const data = {
        ...contactPerson,
        customer: customer ? {
          cCode: customer.cCode,
          cName: customer.cName || '',
        } : undefined,
      };

      return {
        success: true,
        data,
        message: 'Contact person retrieved successfully'
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch contact person with customer'
      };
    }
  }
}