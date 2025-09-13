import { ValidationError, ModelResponse } from '../models/BaseModel';

export interface ServiceResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  validation?: ValidationError[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface BusinessRuleResult {
  valid: boolean;
  message?: string;
}
export abstract class BaseService<TModel, TSelect, TInsert> {
  protected model: TModel;
  protected serviceName: string;

  constructor(model: TModel, serviceName: string) {
    this.model = model;
    this.serviceName = serviceName;
  }

  // ==================== VALIDATION METHODS ====================

  /**
   * Validate data before create/update operations
   */
  protected abstract validateData(data: Partial<TInsert>, isUpdate?: boolean): ValidationError[];

  /**
   * Validate business rules
   */
  protected abstract validateBusinessRules(data: Partial<TInsert>, existingData?: TSelect): Promise<BusinessRuleResult>;

  /**
   * Common validation helper
   */
  protected validateRequired(data: any, requiredFields: string[]): ValidationError[] {
    const errors: ValidationError[] = [];

    requiredFields.forEach(field => {
      if (!data[field] || (typeof data[field] === 'string' && data[field].trim() === '')) {
        errors.push({
          field,
          message: `${field} is required`
        });
      }
    });

    return errors;
  }

  /**
   * Validate email format
   */
  protected validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  // ==================== BUSINESS LOGIC METHODS ====================

  /**
   * Create with validation and business rules
   */
  async create(data: TInsert): Promise<ServiceResponse<TSelect>> {
    try {
      // Data validation
      const validationErrors = this.validateData(data);
      if (validationErrors.length > 0) {
        return {
          success: false,
          error: 'Validation failed',
          validation: validationErrors
        };
      }

      // Business rules validation
      const businessRuleResult = await this.validateBusinessRules(data);
      if (!businessRuleResult.valid) {
        return {
          success: false,
          error: businessRuleResult.message || 'Business rule validation failed'
        };
      }

      // Transform data before creation
      const processedData = await this.beforeCreate(data);

      // Create via model
      const result = await (this.model as any).create(processedData);
      
      if (!result.success) {
        return result;
      }

      // Post-creation processing
      const finalData = await this.afterCreate(result.data);

      return {
        success: true,
        data: finalData,
        message: result.message
      };

    } catch (error) {
      console.error(`${this.serviceName} create error:`, error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Service operation failed'
      };
    }
  }

  /**
   * Update with validation and business rules
   */
  async update(id: number, data: Partial<TInsert>): Promise<ServiceResponse<TSelect>> {
    try {
      // Check if record exists
      const existingRecord = await (this.model as any).findById(id);
      if (!existingRecord.success) {
        return {
          success: false,
          error: 'Record not found'
        };
      }

      // Data validation
      const validationErrors = this.validateData(data, true);
      if (validationErrors.length > 0) {
        return {
          success: false,
          error: 'Validation failed',
          validation: validationErrors
        };
      }

      // Business rules validation
      const businessRuleResult = await this.validateBusinessRules(data, existingRecord.data);
      if (!businessRuleResult.valid) {
        return {
          success: false,
          error: businessRuleResult.message || 'Business rule validation failed'
        };
      }

      // Transform data before update
      const processedData = await this.beforeUpdate(data, existingRecord.data);

      // Update via model
      const result = await (this.model as any).update(id, processedData);
      
      if (!result.success) {
        return result;
      }

      // Post-update processing
      const finalData = await this.afterUpdate(result.data, existingRecord.data);

      return {
        success: true,
        data: finalData,
        message: result.message
      };

    } catch (error) {
      console.error(`${this.serviceName} update error:`, error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Service operation failed'
      };
    }
  }

  /**
   * Delete with business rules
   */
  async delete(id: number): Promise<ServiceResponse<boolean>> {
    try {
      // Check if record exists
      const existingRecord = await (this.model as any).findById(id);
      if (!existingRecord.success) {
        return {
          success: false,
          error: 'Record not found'
        };
      }

      // Check if deletion is allowed
      const canDelete = await this.canDelete(existingRecord.data);
      if (!canDelete.valid) {
        return {
          success: false,
          error: canDelete.message || 'Deletion not allowed'
        };
      }

      // Pre-deletion processing
      await this.beforeDelete(existingRecord.data);

      // Delete via model
      const result = await (this.model as any).delete(id);
      
      if (!result.success) {
        return result;
      }

      // Post-deletion processing
      await this.afterDelete(existingRecord.data);

      return {
        success: true,
        data: result.data,
        message: result.message
      };

    } catch (error) {
      console.error(`${this.serviceName} delete error:`, error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Service operation failed'
      };
    }
  }

  /**
   * Get with business logic
   */
  async getById(id: number): Promise<ServiceResponse<TSelect>> {
    try {
      const result = await (this.model as any).findById(id);
      
      if (!result.success) {
        return result;
      }

      // Transform data after retrieval
      const processedData = await this.afterGet(result.data);

      return {
        success: true,
        data: processedData
      };

    } catch (error) {
      console.error(`${this.serviceName} getById error:`, error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Service operation failed'
      };
    }
  }

  /**
   * Get all with business logic
   */
  async getAll(options: any = {}): Promise<ServiceResponse<TSelect[]>> {
    try {
      const result = await (this.model as any).findMany(options);
      
      if (!result.success) {
        return result;
      }

      // Transform data after retrieval
      const processedData = await Promise.all(
        result.data.map((item: TSelect) => this.afterGet(item))
      );

      return {
        success: true,
        data: processedData,
        pagination: result.pagination
      };

    } catch (error) {
      console.error(`${this.serviceName} getAll error:`, error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Service operation failed'
      };
    }
  }

  // ==================== LIFECYCLE HOOKS ====================

  /**
   * Process data before creation
   */
  protected async beforeCreate(data: TInsert): Promise<TInsert> {
    return data;
  }

  /**
   * Process data after creation
   */
  protected async afterCreate(data: TSelect): Promise<TSelect> {
    return data;
  }

  /**
   * Process data before update
   */
  protected async beforeUpdate(data: Partial<TInsert>, existingData: TSelect): Promise<Partial<TInsert>> {
    return data;
  }

  /**
   * Process data after update
   */
  protected async afterUpdate(newData: TSelect, oldData: TSelect): Promise<TSelect> {
    return newData;
  }

  /**
   * Process data before deletion
   */
  protected async beforeDelete(data: TSelect): Promise<void> {
    // Override in subclasses
  }

  /**
   * Process data after deletion
   */
  protected async afterDelete(data: TSelect): Promise<void> {
    // Override in subclasses
  }

  /**
   * Check if record can be deleted
   */
  protected async canDelete(data: TSelect): Promise<BusinessRuleResult> {
    return { valid: true };
  }

  /**
   * Process data after retrieval
   */
  protected async afterGet(data: TSelect): Promise<TSelect> {
    return data;
  }

  // ==================== UTILITY METHODS ====================

  /**
   * Convert model response to service response
   */
  protected modelToServiceResponse<T>(modelResponse: ModelResponse<T>): ServiceResponse<T> {
    return {
      success: modelResponse.success,
      data: modelResponse.data,
      error: modelResponse.error,
      message: modelResponse.message,
      pagination: modelResponse.pagination
    };
  }

  /**
   * Log service operations
   */
  protected logOperation(operation: string, data?: any): void {
    console.log(`[${this.serviceName}] ${operation}`, data ? { ...data } : '');
  }

  /**
   * Handle async operations safely
   */
  protected async safeAsync<T>(operation: () => Promise<T>, fallback: T): Promise<T> {
    try {
      return await operation();
    } catch (error) {
      console.error(`${this.serviceName} async operation failed:`, error);
      return fallback;
    }
  }
}