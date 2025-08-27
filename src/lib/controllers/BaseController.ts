import { db } from '../db';
import { eq, desc, asc, and, or, like, count, SQL } from 'drizzle-orm';

export interface PaginationOptions {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface SearchOptions {
  query?: string;
  filters?: Record<string, string | number | boolean>;
}

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

/**
 * Simple base controller that provides common CRUD operations
 */
export abstract class BaseController<TSelect, TInsert> {
  protected abstract tableName: string;
  protected abstract table: any;
  protected searchableFields: string[] = [];
  protected requiredFields: string[] = [];

  constructor(searchableFields: string[] = [], requiredFields: string[] = []) {
    this.searchableFields = searchableFields;
    this.requiredFields = requiredFields;
  }

  /**
   * Validate required fields
   */
  protected validateRequired(data: Record<string, unknown>): ValidationError[] {
    const errors: ValidationError[] = [];
    
    for (const field of this.requiredFields) {
      const value = data[field];
      if (!value || (typeof value === 'string' && value.trim() === '')) {
        errors.push({
          field,
          message: `${field} is required`
        });
      }
    }
    
    return errors;
  }

  /**
   * Custom validation hook - override in child classes
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  protected async validate(data: any, isUpdate = false): Promise<ValidationError[]> {
    if (isUpdate) {
      return [];
    }
    return this.validateRequired(data as Record<string, unknown>);
  }

  /**
   * Transform data before save - override in child classes
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  protected async transformForSave(data: any): Promise<any> {
    return data;
  }

  /**
   * Transform data after fetch - override in child classes
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  protected transformAfterFetch(data: any): any {
    return data;
  }

  /**
   * Create a new record
   */
  async create(data: TInsert): Promise<ApiResponse<TSelect>> {
    try {
      const validationErrors = await this.validate(data, false);
      if (validationErrors.length > 0) {
        return {
          success: false,
          error: `Validation failed: ${validationErrors.map(e => e.message).join(', ')}`
        };
      }

      const transformedData = await this.transformForSave(data);
      const result = await db.insert(this.table).values(transformedData).returning() as TSelect[];
      
      if (!result || result.length === 0) {
        return {
          success: false,
          error: 'Failed to create record'
        };
      }

      return {
        success: true,
        data: this.transformAfterFetch(result[0]),
        message: 'Record created successfully'
      };
    } catch (error) {
      console.error(`${this.tableName} create error:`, error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create record'
      };
    }
  }

  /**
   * Get record by ID
   */
  async getById(id: number): Promise<ApiResponse<TSelect>> {
    try {
      const result = await db.select().from(this.table).where(eq(this.table.id, id));

      if (!result || result.length === 0) {
        return {
          success: false,
          error: 'Record not found'
        };
      }

      return {
        success: true,
        data: this.transformAfterFetch(result[0])
      };
    } catch (error) {
      console.error(`${this.tableName} get by ID error:`, error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch record'
      };
    }
  }

  /**
   * Get all records with pagination and search
   */
  async getAll(options: PaginationOptions & SearchOptions = {}): Promise<ApiResponse<TSelect[]>> {
    try {
      const {
        page = 1,
        limit = 10,
        sortBy = 'createdAt',
        sortOrder = 'desc',
        query,
        filters = {}
      } = options;

      const offset = (page - 1) * limit;
      const conditions: SQL[] = [];

      // Search conditions
      if (query && this.searchableFields.length > 0) {
        const searchConditions = this.searchableFields
          .filter(field => this.table[field])
          .map(field => like(this.table[field], `%${query}%`));
        
        if (searchConditions.length > 0) {
          const orCondition = or(...searchConditions);
          if (orCondition) {
            conditions.push(orCondition);
          }
        }
      }

      // Filter conditions
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && this.table[key]) {
          conditions.push(eq(this.table[key], value));
        }
      });

      const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

      // Get total count
      const countResult = await db.select({ total: count() }).from(this.table).where(whereClause);
      const total = countResult[0]?.total || 0;

      // Get records
      const sortColumn = this.table[sortBy] || this.table.createdAt || this.table.id;
      const orderBy = sortOrder === 'asc' ? asc(sortColumn) : desc(sortColumn);

      const records = await db
        .select()
        .from(this.table)
        .where(whereClause)
        .orderBy(orderBy)
        .limit(limit)
        .offset(offset);

      const totalPages = Math.ceil(total / limit);

      return {
        success: true,
        data: records.map(record => this.transformAfterFetch(record)),
        pagination: {
          page,
          limit,
          total,
          totalPages
        }
      };
    } catch (error) {
      console.error(`${this.tableName} get all error:`, error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch records'
      };
    }
  }

  /**
   * Update record by ID
   */
  async update(id: number, data: Partial<TInsert>): Promise<ApiResponse<TSelect>> {
    try {
      const validationErrors = await this.validate(data, true);
      if (validationErrors.length > 0) {
        return {
          success: false,
          error: `Validation failed: ${validationErrors.map(e => e.message).join(', ')}`
        };
      }

      const transformedData = await this.transformForSave({
        ...data,
        updatedAt: new Date()
      });

      const result = await db
        .update(this.table)
        .set(transformedData)
        .where(eq(this.table.id, id))
        .returning();

      if (!result || result.length === 0) {
        return {
          success: false,
          error: 'Record not found'
        };
      }

      return {
        success: true,
        data: this.transformAfterFetch(result[0]),
        message: 'Record updated successfully'
      };
    } catch (error) {
      console.error(`${this.tableName} update error:`, error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to update record'
      };
    }
  }

  /**
   * Soft delete (if isActive field exists)
   */
  async softDelete(id: number): Promise<ApiResponse<boolean>> {
    try {
      if (!this.table.isActive) {
        return {
          success: false,
          error: 'Soft delete not supported for this table'
        };
      }

      const result = await db
        .update(this.table)
        .set({ 
          isActive: false, 
          updatedAt: new Date() 
        })
        .where(eq(this.table.id, id));

      const success = (result.rowCount ?? 0) > 0;

      return {
        success,
        data: success,
        message: success ? 'Record deleted successfully' : 'Record not found'
      };
    } catch (error) {
      console.error(`${this.tableName} soft delete error:`, error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to delete record'
      };
    }
  }

  /**
   * Hard delete
   */
  async delete(id: number): Promise<ApiResponse<boolean>> {
    try {
      const result = await db.delete(this.table).where(eq(this.table.id, id));
      const success = (result.rowCount ?? 0) > 0;

      return {
        success,
        data: success,
        message: success ? 'Record deleted permanently' : 'Record not found'
      };
    } catch (error) {
      console.error(`${this.tableName} delete error:`, error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to delete record'
      };
    }
  }

  /**
   * Bulk create
   */
  async bulkCreate(data: TInsert[]): Promise<ApiResponse<TSelect[]>> {
    try {
      for (const item of data) {
        const validationErrors = await this.validate(item, false);
        if (validationErrors.length > 0) {
          return {
            success: false,
            error: `Validation failed: ${validationErrors.map(e => e.message).join(', ')}`
          };
        }
      }

      const transformedData = await Promise.all(
        data.map(item => this.transformForSave(item))
      );
      const records = await db.insert(this.table).values(transformedData).returning() as TSelect[];

      return {
        success: true,
        data: records.map((record: TSelect) => this.transformAfterFetch(record)),
        message: `${records.length} records created successfully`
      };
    } catch (error) {
      console.error(`${this.tableName} bulk create error:`, error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create records'
      };
    }
  }

  /**
   * Check if record exists
   */
  async exists(id: number): Promise<boolean> {
    try {
      const result = await db
        .select({ id: this.table.id })
        .from(this.table)
        .where(eq(this.table.id, id))
        .limit(1);

      return result.length > 0;
    } catch (error) {
      console.error(`${this.tableName} exists check error:`, error);
      return false;
    }
  }

  /**
   * Get record count
   */
  async getCount(filters: Record<string, string | number | boolean> = {}): Promise<number> {
    try {
      const conditions = Object.entries(filters)
        .filter(([key]) => this.table[key])
        .map(([key, value]) => eq(this.table[key], value));

      const whereClause = conditions.length > 0 ? and(...conditions) : undefined;
      const result = await db.select({ total: count() }).from(this.table).where(whereClause);
      
      return result[0]?.total || 0;
    } catch (error) {
      console.error(`${this.tableName} count error:`, error);
      return 0;
    }
  }
}
