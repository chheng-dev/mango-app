export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface ValidationError {
  field: string;
  message: string;
}

export abstract class BaseController<TEntity, TCreateData, TUpdateData = Partial<TCreateData>, TService = any> {
  protected service: TService;

  constructor(service: TService) {
    this.service = service;
  }

  /**
   * Get all entities with pagination and filtering
   */
  async getAll(params?: {
    page?: number;
    limit?: number;
    query?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
    [key: string]: any;
  }): Promise<ApiResponse<TEntity[]>> {
    try {
      const result = await (this.service as any).getAll({
        page: params?.page || 1,
        limit: params?.limit || 10,
        query: params?.query,
        sortBy: params?.sortBy,
        sortOrder: params?.sortOrder || 'desc',
        ...this.extractServiceFilters(params)
      });

      return this.formatServiceResponse(result);
    } catch (error) {
      console.error(`${this.getControllerName()} getAll error:`, error);
      return {
        success: false,
        error: 'Failed to fetch records'
      };
    }
  }

  /**
   * Get entity by ID
   */
  async getById(id: number): Promise<ApiResponse<TEntity>> {
    try {
      if (isNaN(id)) {
        return {
          success: false,
          error: 'Invalid ID'
        };
      }

      const result = await (this.service as any).getById(id);

      if (!result.success || !result.data) {
        return {
          success: false,
          error: result.error || 'Record not found'
        };
      }

      return {
        success: true,
        data: result.data
      };
    } catch (error) {
      console.error(`${this.getControllerName()} getById error:`, error);
      return {
        success: false,
        error: 'Failed to get record'
      };
    }
  }

  /**
   * Create new entity
   */
  async create(data: TCreateData): Promise<ApiResponse<TEntity>> {
    try {
      // Validate required fields
      const validationError = this.validateCreateData(data);
      if (validationError) {
        return validationError;
      }

      // Process data before creation
      const processedData = await this.beforeCreate(data);

      const result = await (this.service as any).create(processedData);

      if (!result.success || !result.data) {
        return {
          success: false,
          error: result.error || 'Failed to create record'
        };
      }

      // Process data after creation
      const finalData = await this.afterCreate(result.data);

      return {
        success: true,
        data: finalData,
        message: this.getCreateSuccessMessage()
      };
    } catch (error) {
      console.error(`${this.getControllerName()} create error:`, error);
      return {
        success: false,
        error: 'Failed to create record'
      };
    }
  }

  /**
   * Update entity
   */
  async update(id: number, data: TUpdateData): Promise<ApiResponse<TEntity>> {
    try {
      if (isNaN(id)) {
        return {
          success: false,
          error: 'Invalid ID'
        };
      }

      // Validate update data
      const validationError = this.validateUpdateData(data);
      if (validationError) {
        return validationError;
      }

      // Process data before update
      const processedData = await this.beforeUpdate(id, data);

      const result = await (this.service as any).update(id, processedData);

      if (!result.success || !result.data) {
        return {
          success: false,
          error: result.error || 'Record not found'
        };
      }

      // Process data after update
      const finalData = await this.afterUpdate(result.data);

      return {
        success: true,
        data: finalData,
        message: this.getUpdateSuccessMessage()
      };
    } catch (error) {
      console.error(`${this.getControllerName()} update error:`, error);
      return {
        success: false,
        error: 'Failed to update record'
      };
    }
  }

  /**
   * Delete entity
   */
  async delete(id: number): Promise<ApiResponse<boolean>> {
    try {
      if (isNaN(id)) {
        return {
          success: false,
          error: 'Invalid ID'
        };
      }

      // Check if deletion is allowed
      const canDelete = await this.canDelete(id);
      if (!canDelete.allowed) {
        return {
          success: false,
          error: canDelete.reason || 'Deletion not allowed'
        };
      }

      // Process before deletion
      await this.beforeDelete(id);

      const result = await (this.service as any).delete(id);

      if (!result.success) {
        return {
          success: false,
          error: result.error || 'Record not found'
        };
      }

      // Process after deletion
      await this.afterDelete(id);

      return {
        success: true,
        data: true,
        message: this.getDeleteSuccessMessage()
      };
    } catch (error) {
      console.error(`${this.getControllerName()} delete error:`, error);
      return {
        success: false,
        error: 'Failed to delete record'
      };
    }
  }

  /**
   * Search entities
   */
  async search(query: string, limit: number = 10): Promise<ApiResponse<TEntity[]>> {
    try {
      if (!query || query.trim().length < 2) {
        return {
          success: false,
          error: 'Search query must be at least 2 characters long'
        };
      }

      const result = await (this.service as any).search ? 
        await (this.service as any).search(query.trim(), { limit }) :
        await this.defaultSearch(query.trim(), limit);

      return this.formatServiceResponse(result, 'Records found successfully');
    } catch (error) {
      console.error(`${this.getControllerName()} search error:`, error);
      return {
        success: false,
        error: 'Failed to search records'
      };
    }
  }

  // ==================== HOOK METHODS (Override in subclasses) ====================

  /**
   * Validate data before creation
   */
  protected validateCreateData(data: TCreateData): ApiResponse<TEntity> | null {
    return null; // Override in subclasses for custom validation
  }

  /**
   * Validate data before update
   */
  protected validateUpdateData(data: TUpdateData): ApiResponse<TEntity> | null {
    return null; // Override in subclasses for custom validation
  }

  /**
   * Process data before creation
   */
  protected async beforeCreate(data: TCreateData): Promise<TCreateData> {
    return data; // Override in subclasses for custom processing
  }

  /**
   * Process data after creation
   */
  protected async afterCreate(data: TEntity): Promise<TEntity> {
    return data; // Override in subclasses for custom processing
  }

  /**
   * Process data before update
   */
  protected async beforeUpdate(id: number, data: TUpdateData): Promise<TUpdateData> {
    return data; // Override in subclasses for custom processing
  }

  /**
   * Process data after update
   */
  protected async afterUpdate(data: TEntity): Promise<TEntity> {
    return data; // Override in subclasses for custom processing
  }

  /**
   * Check if entity can be deleted
   */
  protected async canDelete(id: number): Promise<{ allowed: boolean; reason?: string }> {
    return { allowed: true }; // Override in subclasses for custom logic
  }

  /**
   * Process before deletion
   */
  protected async beforeDelete(id: number): Promise<void> {
    // Override in subclasses for custom processing
  }

  /**
   * Process after deletion
   */
  protected async afterDelete(id: number): Promise<void> {
    // Override in subclasses for custom processing
  }

  /**
   * Default search implementation (when service doesn't have search method)
   */
  protected async defaultSearch(query: string, limit: number): Promise<any> {
    // Fallback to getAll with query
    return await (this.service as any).getAll({
      page: 1,
      limit,
      query
    });
  }

  // ==================== UTILITY METHODS ====================

  /**
   * Format service response to API response
   */
  protected formatServiceResponse<T>(serviceResponse: any, successMessage?: string): ApiResponse<T> {
    return {
      success: serviceResponse.success,
      data: serviceResponse.data,
      error: serviceResponse.error,
      message: serviceResponse.success ? successMessage : undefined,
      pagination: serviceResponse.pagination
    };
  }

  /**
   * Extract service-specific filters from params
   */
  protected extractServiceFilters(params?: Record<string, any>): Record<string, any> {
    if (!params) return {};
    
    // Remove standard pagination/search params
    const { page, limit, query, sortBy, sortOrder, ...filters } = params;
    return filters;
  }

  /**
   * Get controller name for logging
   */
  protected getControllerName(): string {
    return this.constructor.name;
  }

  /**
   * Get success message for creation
   */
  protected getCreateSuccessMessage(): string {
    return 'Record created successfully';
  }

  /**
   * Get success message for update
   */
  protected getUpdateSuccessMessage(): string {
    return 'Record updated successfully';
  }

  /**
   * Get success message for deletion
   */
  protected getDeleteSuccessMessage(): string {
    return 'Record deleted successfully';
  }

  /**
   * Validate required fields
   */
  protected validateRequiredFields(data: Record<string, any>, fields: string[]): ValidationError[] {
    const errors: ValidationError[] = [];
    
    fields.forEach(field => {
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
   * Generate slug from text
   */
  protected generateSlug(text: string, separator: string = '_'): string {
    return text
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '') // Remove special characters
      .replace(/[\s-]+/g, separator) // Replace spaces and hyphens with separator
      .replace(new RegExp(`^${separator}+|${separator}+$`, 'g'), ''); // Remove leading/trailing separators
  }
}
