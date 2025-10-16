import { ApiResponse } from '@/types/api';
import { BaseModel, ModelResponse } from '../models/BaseModel';

export abstract class ModelController<TSelect, TInsert, TModel extends BaseModel<TSelect, TInsert>> {
  protected model: TModel;

  constructor(model: TModel) {
    this.model = model;
  }

  // Convert ModelResponse to ApiResponse for consistency
  protected convertResponse<T>(modelResponse: ModelResponse<T>): ApiResponse<T> {
    return {
      success: modelResponse.success,
      data: modelResponse.data,
      error: modelResponse.error,
      message: modelResponse.message,
      pagination: modelResponse.pagination
    };
  }

  // Standard CRUD operations
  async getAll(options?: {
    page?: number;
    limit?: number;
    query?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
    filters?: Record<string, string | number | boolean>;
  }): Promise<ApiResponse<TSelect[]>> {
    const result = await this.model.findMany(options);
    return this.convertResponse<TSelect[]>(result);
  }

  async getById(id: number): Promise<ApiResponse<TSelect>> {
    const result = await this.model.findById(id);
    return this.convertResponse<TSelect>(result);
  }

  async create(data: TInsert): Promise<ApiResponse<TSelect>> {
    // Allow subclasses to validate and process data
    const validation = await this.validateCreateData?.(data);
    if (validation && !validation.success) {
      return validation;
    }

    const processedData = await this.beforeCreate?.(data) ?? data;
    const result = await this.model.create(processedData);
    
    if (result.success && result.data) {
      await this.afterCreate?.(result.data);
    }
    
    return this.convertResponse<TSelect>(result);
  }

  async update(id: number, data: Partial<TInsert>): Promise<ApiResponse<TSelect>> {
    // Allow subclasses to validate and process data
    const validation = await this.validateUpdateData?.(data);
    if (validation && !validation.success) {
      return validation;
    }

    const processedData = await this.beforeUpdate?.(id, data) ?? data;
    const result = await this.model.update(id, processedData);
    
    if (result.success && result.data) {
      await this.afterUpdate?.(result.data);
    }
    
    return this.convertResponse<TSelect>(result);
  }

  async delete(id: number): Promise<ApiResponse<boolean>> {
    // Check if deletion is allowed
    const canDelete = await this.canDelete?.(id);
    if (canDelete && !canDelete.allowed) {
      return { 
        success: false, 
        error: canDelete.reason || 'Deletion not allowed' 
      };
    }

    await this.beforeDelete?.(id);
    const result = await this.model.delete(id);
    
    if (result.success) {
      await this.afterDelete?.(id);
    }
    
    return this.convertResponse<boolean>(result);
  }

  // Utility methods
  async exists(id: number): Promise<boolean> {
    return await this.model.exists(id);
  }

  async count(filters?: Record<string, string | number | boolean>): Promise<number> {
    return await this.model.count(filters);
  }

  // Hook methods that subclasses can override
  protected validateCreateData?(data: TInsert): Promise<ApiResponse<any> | null> | ApiResponse<any> | null;
  protected validateUpdateData?(data: Partial<TInsert>): Promise<ApiResponse<any> | null> | ApiResponse<any> | null;

  protected beforeCreate?(data: TInsert): Promise<TInsert> | TInsert;
  protected afterCreate?(created: TSelect): Promise<void> | void;

  protected beforeUpdate?(id: number | string, data: Partial<TInsert>): Promise<Partial<TInsert>> | Partial<TInsert>;
  protected afterUpdate?(updated: TSelect): Promise<void> | void;

  protected canDelete?(id: number | string): Promise<{ allowed: boolean; reason?: string }> | { allowed: boolean; reason?: string };
  protected beforeDelete?(id: number | string): Promise<void> | void;
  protected afterDelete?(id: number | string): Promise<void> | void;

  // Helper for validation
  protected validateRequiredFields(data: Record<string, any>, fields: string[]): Array<{ field: string; message: string }> {
    const errors: Array<{ field: string; message: string }> = [];
    fields.forEach(field => {
      if (
        data[field] === undefined || 
        data[field] === null || 
        (typeof data[field] === 'string' && data[field].trim() === '')
      ) {
        errors.push({ field, message: `${field} is required` });
      }
    });
    return errors;
  }
}
