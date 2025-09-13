import { db } from '../db';
import { and, asc, desc, eq, inArray, like, or, sql } from 'drizzle-orm';

export interface PaginationOptions {
  page: number;
  limit: number;
}

export interface SearchOptions {
  query?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface FilterOptions {
  [key: string]: any;
}

export interface PaginationResult {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface FindManyResult<T> {
  data: T[];
  pagination: PaginationResult;
}

export abstract class BaseService<TSelect, TInsert> {
  protected abstract table: any; // Use any for Drizzle table
  protected abstract searchableFields: any[]; // Array of actual column references

  /**
   * Find a single record by ID
   */
  async findById(id: number): Promise<TSelect | null> {
    const result = await db
      .select()
      .from(this.table)
      .where(eq(this.table.id, id))
      .limit(1);

    return (result[0] as TSelect) || null;
  }

  /**
   * Create a new record
   */
  async create(data: TInsert): Promise<TSelect> {
    const result = await db
      .insert(this.table)
      .values(data as any)
      .returning();

    return (result as any[])[0] as TSelect;
  }

  /**
   * Update a record by ID
   */
  async update(id: number, data: Partial<TSelect>): Promise<TSelect | null> {
    const result = await db
      .update(this.table)
      .set({ ...data, updatedAt: new Date() } as any)
      .where(eq(this.table.id, id))
      .returning();

    return (result[0] as TSelect) || null;
  }

  /**
   * Soft delete a record by setting isActive to false
   */
  async softDelete(id: number): Promise<boolean> {
    const result = await db
      .update(this.table)
      .set({ isActive: false, updatedAt: new Date() } as any)
      .where(eq(this.table.id, id))
      .returning();

    return result.length > 0;
  }

  /**
   * Hard delete a record
   */
  async delete(id: number): Promise<boolean> {
    const result = await db
      .delete(this.table)
      .where(eq(this.table.id, id))
      .returning();

    return (result as any[]).length > 0;
  }

  /**
   * Find multiple records with pagination, search, and filtering
   */
  async findMany(options: PaginationOptions & SearchOptions & {
    filters?: FilterOptions;
  }): Promise<FindManyResult<TSelect>> {
    const { page, limit, query, sortOrder = 'desc', filters = {} } = options;
    const offset = (page - 1) * limit;
    const sortFunction = sortOrder === 'desc' ? desc : asc;

    const conditions: any[] = [];

    // Build search conditions
    if (query && this.searchableFields.length > 0) {
      const searchConditions = this.searchableFields.map(field => 
        like(field, `%${query}%`)
      );
      conditions.push(or(...searchConditions));
    }

    // Build filter conditions
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && this.table[key]) {
        conditions.push(eq(this.table[key], value));
      }
    });

    // Build the base query
    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    // Get records
    const dataQuery = db
      .select()
      .from(this.table)
      .where(whereClause)
      .orderBy(sortFunction(this.table.createdAt))
      .limit(limit)
      .offset(offset);

    // Get total count
    const countQuery = db
      .select({ count: sql<number>`count(*)` })
      .from(this.table)
      .where(whereClause);

    const [data, totalResults] = await Promise.all([dataQuery, countQuery]);
    const total = totalResults[0]?.count || 0;

    return {
      data: data as TSelect[],
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    };
  }

  /**
   * Count records with optional filters
   */
  async count(filters: FilterOptions = {}): Promise<number> {
    const conditions: any[] = [];

    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && this.table[key]) {
        conditions.push(eq(this.table[key], value));
      }
    });

    const result = await db
      .select({ count: sql<number>`count(*)` })
      .from(this.table)
      .where(conditions.length > 0 ? and(...conditions) : undefined);

    return result[0]?.count || 0;
  }

  /**
   * Check if a record exists
   */
  async exists(id: number): Promise<boolean> {
    const result = await db
      .select({ id: this.table.id })
      .from(this.table)
      .where(eq(this.table.id, id))
      .limit(1);

    return result.length > 0;
  }

  /**
   * Bulk update records
   */
  async bulkUpdate(ids: number[], data: Partial<TSelect>): Promise<void> {
    await db
      .update(this.table)
      .set({ ...data, updatedAt: new Date() } as any)
      .where(inArray(this.table.id, ids));
  }

  /**
   * Bulk delete records (soft delete)
   */
  async bulkSoftDelete(ids: number[]): Promise<void> {
    await db
      .update(this.table)
      .set({ isActive: false, updatedAt: new Date() } as any)
      .where(inArray(this.table.id, ids));
  }

  /**
   * Search records by query
   */
  async search(query: string, limit: number = 10, additionalFilters: FilterOptions = {}): Promise<TSelect[]> {
    const conditions: any[] = [];

    // Add search conditions
    if (query && this.searchableFields.length > 0) {
      const searchConditions = this.searchableFields.map(field => 
        like(field, `%${query}%`)
      );
      conditions.push(or(...searchConditions));
    }

    // Add additional filters
    Object.entries(additionalFilters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && this.table[key]) {
        conditions.push(eq(this.table[key], value));
      }
    });

    const result = await db
      .select()
      .from(this.table)
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .limit(limit);

    return result as TSelect[];
  }

  /**
   * Get active records (where isActive = true)
   */
  async findActive(options: PaginationOptions & SearchOptions = { page: 1, limit: 10 }): Promise<FindManyResult<TSelect>> {
    return this.findMany({
      ...options,
      filters: { isActive: true }
    });
  }

  /**
   * Get inactive records (where isActive = false)
   */
  async findInactive(options: PaginationOptions & SearchOptions = { page: 1, limit: 10 }): Promise<FindManyResult<TSelect>> {
    return this.findMany({
      ...options,
      filters: { isActive: false }
    });
  }
}

export default BaseService;
