import { db } from '../db';
import { eq, desc, asc, and, or, like, count, SQL, inArray } from 'drizzle-orm';

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
 
export interface ModelResponse<T> {
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

export abstract class BaseModel<TSelect, TInsert> {
  protected abstract tableName: string;
  protected abstract table: any;
  protected searchableFields: any[] = [];
  protected requiredFields: string[] = [];

  constructor(searchableFields: any[] = [], requiredFields: string[] = []) {
    this.searchableFields = searchableFields;
    this.requiredFields = requiredFields;
  }

  async create(data: TInsert): Promise<ModelResponse<TSelect>> {
    try {
      const result = await db.insert(this.table).values(data as any).returning() as TSelect[];
      
      if (!result || result.length === 0) {
        return {
          success: false,
          error: 'Failed to create record'
        };
      }

      return {
        success: true,
        data: result[0],
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
  async findById(id: number): Promise<ModelResponse<TSelect>> {
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
        data: result[0]
      };
    } catch (error) {
      console.error(`${this.tableName} findById error:`, error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch record'
      };
    }
  }

  /**
   * Find record by specific field
   */
  async findByField(fieldName: string, value: string | number | boolean, options?: { 
    caseSensitive?: boolean;
    transformValue?: (val: string | number | boolean) => string | number | boolean;
  }): Promise<ModelResponse<TSelect>> {
    try {
      if (!this.table[fieldName]) {
        return {
          success: false,
          error: `Field '${fieldName}' does not exist in ${this.tableName} table`
        };
      }

      let searchValue = value;
      
      // Apply transformation if provided
      if (options?.transformValue) {
        searchValue = options.transformValue(value);
      } else if (typeof value === 'string' && !options?.caseSensitive) {
        // Default behavior: lowercase for strings unless case sensitive
        searchValue = value.toLowerCase();
      }

      const result = await db
        .select()
        .from(this.table)
        .where(eq(this.table[fieldName], searchValue))
        .limit(1);

      if (!result || result.length === 0) {
        return {
          success: false,
          error: 'Record not found'
        };
      }

      return {
        success: true,
        data: result[0]
      };
    } catch (error) {
      console.error(`${this.tableName} findByField error:`, error);
      return {
        success: false,
        error: error instanceof Error ? error.message : `Failed to find record by ${fieldName}`
      };
    }
  }

  /**
   * Get all records with pagination and search
   */
  async findMany(options: PaginationOptions & SearchOptions = {}): Promise<ModelResponse<TSelect[]>> {
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
        data: records,
        pagination: {
          page,
          limit,
          total,
          totalPages
        }
      };
    } catch (error) {
      console.error(`${this.tableName} findMany error:`, error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch records'
      };
    }
  }

  /**
   * Update record by ID
   */
  async update(id: number, data: Partial<TInsert>): Promise<ModelResponse<TSelect>> {
    try {
      const result = await db
        .update(this.table)
        .set({
          ...data,
          updatedAt: new Date()
        })
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
        data: result[0],
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
  async softDelete(id: number): Promise<ModelResponse<boolean>> {
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
      console.error(`${this.tableName} softDelete error:`, error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to delete record'
      };
    }
  }

  /**
   * Hard delete
   */
  async delete(id: number): Promise<ModelResponse<boolean>> {
    try {
      const result = await db.delete(this.table).where(eq(this.table.id, id));
      const success = (result.rowCount ?? 0) > 0;

      return {
        success,
        data: success,
        message: success ? 'Record deleted successfully' : 'Record not found'
      };
    } catch (error) {
      console.error(`${this.tableName} delete error:`, error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to delete record'
      };
    }
  }

  // ==================== UTILITY METHODS ====================

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
  async count(filters: Record<string, string | number | boolean> = {}): Promise<number> {
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

  /**
   * Find records by multiple IDs
   */
  async findByIds(ids: number[]): Promise<ModelResponse<TSelect[]>> {
    try {
      const result = await db
        .select()
        .from(this.table)
        .where(
          inArray(this.table.id, ids)
        );

      return {
        success: true,
        data: result
      };
    } catch (error) {
      console.error(`${this.tableName} findByIds error:`, error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch records'
      };
    }
  }

  /**
   * Bulk create records
   */
  async bulkCreate(data: TInsert[]): Promise<ModelResponse<TSelect[]>> {
    try {
      const records = await db.insert(this.table).values(data as any).returning() as TSelect[];

      return {
        success: true,
        data: records,
        message: `${records.length} records created successfully`
      };
    } catch (error) {
      console.error(`${this.tableName} bulkCreate error:`, error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create records'
      };
    }
  }

  /**
   * Bulk update records
   */
  async bulkUpdate(ids: number[], data: Partial<TInsert>): Promise<ModelResponse<boolean>> {
    try {
      if (ids.length === 0) {
        return {
          success: true,
          data: true,
          message: 'No records to update'
        };
      }

      const result = await db
        .update(this.table)
        .set({ ...data, updatedAt: new Date() } as any)
        .where(inArray(this.table.id, ids));

      const success = (result.rowCount ?? 0) > 0;

      return {
        success,
        data: success,
        message: success ? `Updated ${ids.length} records` : 'No records updated'
      };
    } catch (error) {
      console.error(`${this.tableName} bulkUpdate error:`, error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to update records'
      };
    }
  }

  /**
   * Execute raw query
   */
  async executeQuery<T>(query: any): Promise<ModelResponse<T[]>> {
    try {
      const result = await query;
      return {
        success: true,
        data: result
      };
    } catch (error) {
      console.error(`${this.tableName} executeQuery error:`, error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Query execution failed'
      };
    }
  }
}
