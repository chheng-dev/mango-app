import { ContactPersonInsert, ContactPersonModel, ContactPersonSelect } from "../models/ContactPersonModel";
import { ModelController } from "./ModelController";
import { ApiResponse } from "@/types/api";

export class ContactPersonController extends ModelController<ContactPersonSelect, ContactPersonInsert, ContactPersonModel> {
  constructor() {
    super(new ContactPersonModel());
  }

  async getByCode(cpCode: string): Promise<ApiResponse<ContactPersonSelect>> {
    const result = await this.model.findByCode(cpCode);
    return this.convertResponse<ContactPersonSelect>(result);
  }

  /**
   * Get contact person by email
   */
  async getByEmail(cEmail: string): Promise<ApiResponse<ContactPersonSelect>> {
    const result = await this.model.findByEmail(cEmail);
    return this.convertResponse<ContactPersonSelect>(result);
  }

  /**
   * Get all contact persons for a customer
   */
  async getByCustomer(cCode: string): Promise<ApiResponse<ContactPersonSelect[]>> {
    const result = await this.model.findByCustomer(cCode);
    return this.convertResponse<ContactPersonSelect[]>(result as any);
  }

  /**
   * Get contact person with customer details
   */
  async getWithCustomer(cpCode: string): Promise<ApiResponse<any>> {
    const result = await this.model.findWithCustomer(cpCode);
    return this.convertResponse<any>(result as any);
  }

  /**
   * Validate email format
   */
  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Validate contact person data before create
   */
  protected validateCreateData(data: ContactPersonInsert): ApiResponse<any> | null {
    const errors = this.validateRequiredFields(data, ['cpCode', 'cpName', 'cEmail']);
    if (errors.length) {
      return { 
        success: false, 
        error: errors.map(e => e.message).join(', ') 
      };
    }

    // Validate email format
    if (data.cEmail && !this.isValidEmail(data.cEmail)) {
      return { 
        success: false, 
        error: 'Invalid email format' 
      };
    }

    // Validate code format (alphanumeric, hyphens, underscores)
    if (data.cpCode && !/^[A-Z0-9_-]+$/i.test(data.cpCode)) {
      return { 
        success: false, 
        error: 'Contact person code can only contain letters, numbers, hyphens, and underscores' 
      };
    }

    return null;
  }

  /**
   * Validate contact person data before update
   */
  protected validateUpdateData(data: Partial<ContactPersonInsert>): ApiResponse<any> | null {
    // Validate email format if provided
    if (data.cEmail !== undefined && data.cEmail && !this.isValidEmail(data.cEmail)) {
      return { 
        success: false, 
        error: 'Invalid email format' 
      };
    }

    // Validate code format if provided
    if (data.cpCode !== undefined && data.cpCode && !/^[A-Z0-9_-]+$/i.test(data.cpCode)) {
      return { 
        success: false, 
        error: 'Contact person code can only contain letters, numbers, hyphens, and underscores' 
      };
    }

    return null;
  }

  /**
   * Transform data before create
   */
  protected beforeCreate(data: ContactPersonInsert): ContactPersonInsert {
    return {
      ...data,
      cpCode: data.cpCode?.toUpperCase(),
      cEmail: data.cEmail?.toLowerCase(),
      cStatus: data.cStatus ?? true,  // Default to active if not specified
    };
  }

  /**
   * Transform data before update
   */
  protected beforeUpdate(id: number | string, data: Partial<ContactPersonInsert>): Partial<ContactPersonInsert> {
    const updateData: Partial<ContactPersonInsert> = {
      ...data,
      cpLastUpdateAt: new Date(),
    };

    if (data.cEmail) {
      updateData.cEmail = data.cEmail.toLowerCase();
    }

    return updateData;
  }

  /**
   * Update contact person by code
   */
  async updateByCode(cpCode: string, data: Partial<ContactPersonInsert>): Promise<ApiResponse<ContactPersonSelect>> {
    const validation = await this.validateUpdateData?.(data);
    if (validation && !validation.success) {
      return validation;
    }

    const processedData = await this.beforeUpdate?.(cpCode, data) ?? data;
    const result = await this.model.update(cpCode, processedData);
    
    if (result.success && result.data) {
      await this.afterUpdate?.(result.data);
    }
    
    return this.convertResponse<ContactPersonSelect>(result);
  }

  /**
   * Delete contact person by code
   */
  async deleteByCode(cpCode: string): Promise<ApiResponse<boolean>> {
    const canDeleteCheck = await this.canDelete?.(cpCode);
    if (canDeleteCheck && !canDeleteCheck.allowed) {
      return {
        success: false,
        error: canDeleteCheck.reason || 'Cannot delete this contact person'
      };
    }

    await this.beforeDelete?.(cpCode);
    const result = await this.model.delete(cpCode);
    
    if (result.success) {
      await this.afterDelete?.(cpCode);
    }
    
    return this.convertResponse<boolean>(result);
  }
} 

export const contactPersonController = new ContactPersonController();