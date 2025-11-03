import { db } from '../db';
import { eq, desc, asc, and, or, like, count, SQL, inArray, ne } from 'drizzle-orm';

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
  
  // Allow customization of primary key and timestamp fields
  protected primaryKey: string = 'id';
  protected createdAtField: string = 'createdAt';
  protected updatedAtField: string = 'updatedAt';

  constructor(
    searchableFields: any[] = [], 
    requiredFields: string[] = [],
    options?: {
      primaryKey?: string;
      createdAtField?: string;
      updatedAtField?: string;
    }
  ) {
    this.searchableFields = searchableFields;
    this.requiredFields = requiredFields;
    if (options?.primaryKey) this.primaryKey = options.primaryKey;
    if (options?.createdAtField) this.createdAtField = options.createdAtField;
    if (options?.updatedAtField) this.updatedAtField = options.updatedAtField;
  }

  // ==================== LIFECYCLE HOOKS ====================
  /**
   * Hook called before creating a record
   * Override this in child classes to transform or validate data
   */
  protected beforeCreate?(data: TInsert): Promise<TInsert> | TInsert;

  /**
   * Hook called after creating a record
   * Override this in child classes for post-creation actions
   */
  protected afterCreate?(created: TSelect): Promise<void> | void;

  /**
   * Hook called before updating a record
   * Override this in child classes to transform or validate data
   */
  protected beforeUpdate?(id: number | string, data: Partial<TInsert>): Promise<Partial<TInsert>> | Partial<TInsert>;

  /**
   * Hook called after updating a record
   * Override this in child classes for post-update actions
   */
  protected afterUpdate?(updated: TSelect): Promise<void> | void;

  /**
   * Hook called before deleting a record
   * Override this in child classes to prevent deletion or perform cleanup
   */
  protected beforeDelete?(id: number | string): Promise<void> | void;

  /**
   * Hook called after deleting a record
   * Override this in child classes for post-deletion actions
   */
  protected afterDelete?(id: number | string): Promise<void> | void;

  /**
   * Check if deletion is allowed
   * Override this in child classes to add custom deletion rules
   */
  protected canDelete?(id: number | string): Promise<{ allowed: boolean; reason?: string }> | { allowed: boolean; reason?: string };

  // ==================== CRUD OPERATIONS ====================

  async create(data: TInsert): Promise<ModelResponse<TSelect>> {
    try {
      // Call beforeCreate hook if defined
      let processedData = data;
      if (this.beforeCreate) {
        processedData = await this.beforeCreate(data);
      }

      const result = await db.insert(this.table).values(processedData as any).returning() as TSelect[];
      
      if (!result || result.length === 0) {
        return {
          success: false,
          error: 'Failed to create record'
        };
      }

      // Call afterCreate hook if defined
      if (this.afterCreate) {
        await this.afterCreate(result[0]);
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
  async findById(id: number | string): Promise<ModelResponse<TSelect>> {
    try {
      const pkField = this.table[this.primaryKey];
      if (!pkField) {
        return {
          success: false,
          error: `Primary key field '${this.primaryKey}' not found`
        };
      }

      const result = await db.select().from(this.table).where(eq(pkField, id));

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
        sortBy = this.createdAtField,
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

      // Get records - use configurable sort field
      const sortColumn = this.table[sortBy] || this.table[this.createdAtField] || this.table[this.primaryKey];
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
  async update(id: number | string, data: Partial<TInsert>): Promise<ModelResponse<TSelect>> {
    try {
      // Check if record exists
      const recordExists = await this.exists(id);
      if (!recordExists) {
        return {
          success: false,
          error: 'Record not found'
        };
      }

      const pkField = this.table[this.primaryKey];
      if (!pkField) {
        return {
          success: false,
          error: `Primary key field '${this.primaryKey}' not found`
        };
      }

      // Call beforeUpdate hook if defined
      let processedData = data;
      if (this.beforeUpdate) {
        processedData = await this.beforeUpdate(id, data);
      }

      const updateData: any = { ...processedData };
      
      // Add updated timestamp if the field exists
      if (this.table[this.updatedAtField]) {
        updateData[this.updatedAtField] = new Date();
      }

      const result = await db
        .update(this.table)
        .set(updateData)
        .where(eq(pkField, id))
        .returning();

      if (!result || result.length === 0) {
        return {
          success: false,
          error: 'Record not found'
        };
      }

      // Call afterUpdate hook if defined
      if (this.afterUpdate) {
        await this.afterUpdate(result[0]);
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
  async softDelete(id: number | string): Promise<ModelResponse<boolean>> {
    try {
      if (!this.table.isActive) {
        return {
          success: false,
          error: 'Soft delete not supported for this table'
        };
      }

      const pkField = this.table[this.primaryKey];
      const updateData: any = { isActive: false };
      
      // Add updated timestamp if the field exists
      if (this.table[this.updatedAtField]) {
        updateData[this.updatedAtField] = new Date();
      }

      const result = await db
        .update(this.table)
        .set(updateData)
        .where(eq(pkField, id));

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
  async delete(id: number | string): Promise<ModelResponse<boolean>> {
    try {
      // Check if record exists
      const recordExists = await this.exists(id);
      if (!recordExists) {
        return {
          success: false,
          error: 'Record not found'
        };
      }

      // Check if deletion is allowed via canDelete hook
      if (this.canDelete) {
        const deleteCheck = await this.canDelete(id);
        if (!deleteCheck.allowed) {
          return {
            success: false,
            error: deleteCheck.reason || 'Deletion not allowed'
          };
        }
      }

      const pkField = this.table[this.primaryKey];
      if (!pkField) {
        return {
          success: false,
          error: `Primary key field '${this.primaryKey}' not found`
        };
      }

      // Call beforeDelete hook if defined
      if (this.beforeDelete) {
        await this.beforeDelete(id);
      }

      const result = await db.delete(this.table).where(eq(pkField, id));
      const success = (result.rowCount ?? 0) > 0;

      // Call afterDelete hook if defined
      if (this.afterDelete && success) {
        await this.afterDelete(id);
      }

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
   * Check if record exists by ID
   */
  async exists(id: number | string): Promise<boolean> {
    try {
      const pkField = this.table[this.primaryKey];
      if (!pkField) return false;

      const result = await db.select().from(this.table).where(eq(pkField, id)).limit(1);

      return result.length > 0;
    } catch (error) {
      console.error(`${this.tableName} exists check error:`, error);
      return false;
    }
  }

  /**
   * Check if record exists by specific field
   * Useful for checking uniqueness (e.g., email, username, code)
   */
  async existsByField(fieldName: string, value: string | number | boolean, excludeId?: number | string): Promise<boolean> {
    try {
      if (!this.table[fieldName]) {
        console.warn(`Field '${fieldName}' does not exist in ${this.tableName} table`);
        return false;
      }

      const pkField = this.table[this.primaryKey];
      const conditions: SQL[] = [eq(this.table[fieldName], value)];

      // Exclude current record if ID is provided (useful for updates)
      if (excludeId !== undefined && pkField) {
        conditions.push(ne(pkField, excludeId));
      }

      const whereClause = conditions.length > 1 ? and(...conditions) : conditions[0];
      const result = await db.select().from(this.table).where(whereClause).limit(1);

      return result.length > 0;
    } catch (error) {
      console.error(`${this.tableName} existsByField check error:`, error);
      return false;
    }
  }

  /**
   * Check if any record exists matching the given conditions
   */
  async existsByConditions(conditions: Record<string, string | number | boolean>): Promise<boolean> {
    try {
      const whereConditions = Object.entries(conditions)
        .filter(([key]) => this.table[key])
        .map(([key, value]) => eq(this.table[key], value));

      if (whereConditions.length === 0) {
        return false;
      }

      const whereClause = whereConditions.length > 1 ? and(...whereConditions) : whereConditions[0];
      const result = await db.select().from(this.table).where(whereClause).limit(1);

      return result.length > 0;
    } catch (error) {
      console.error(`${this.tableName} existsByConditions check error:`, error);
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
