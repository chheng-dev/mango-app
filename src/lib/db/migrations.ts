import { sql } from 'drizzle-orm';
import { db } from './index';

/**
 * Migration utility to safely apply database changes with proper timestamps
 */
export class MigrationManager {
  private static readonly MIGRATION_TABLE = '_drizzle_migrations';

  /**
   * Check if migrations table exists
   */
  static async ensureMigrationTable(): Promise<void> {
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS ${sql.identifier(this.MIGRATION_TABLE)} (
        id SERIAL PRIMARY KEY,
        hash VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
        applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
      );
    `);
  }

  /**
   * Get list of applied migrations
   */
  static async getAppliedMigrations(): Promise<string[]> {
    await this.ensureMigrationTable();
    
    const result = await db.execute(sql`
      SELECT hash FROM ${sql.identifier(this.MIGRATION_TABLE)}
      ORDER BY applied_at ASC;
    `);
    
    return result.rows.map((row: any) => row.hash);
  }

  /**
   * Mark migration as applied
   */
  static async markMigrationApplied(hash: string): Promise<void> {
    await db.execute(sql`
      INSERT INTO ${sql.identifier(this.MIGRATION_TABLE)} (hash, applied_at)
      VALUES (${hash}, CURRENT_TIMESTAMP);
    `);
  }

  /**
   * Create a backup table before applying destructive changes
   */
  static async createBackupTable(tableName: string): Promise<string> {
    const backupTableName = `${tableName}_backup_${Date.now()}`;
    
    await db.execute(sql`
      CREATE TABLE ${sql.identifier(backupTableName)} AS 
      SELECT * FROM ${sql.identifier(tableName)};
    `);
    
    console.log(`✅ Backup created: ${backupTableName}`);
    return backupTableName;
  }

  /**
   * Add column safely (if not exists)
   */
  static async addColumnSafely(
    tableName: string, 
    columnName: string, 
    columnDefinition: string
  ): Promise<void> {
    await db.execute(sql`
      DO $$ 
      BEGIN 
        IF NOT EXISTS (
          SELECT 1 FROM information_schema.columns 
          WHERE table_name = ${tableName} AND column_name = ${columnName}
        ) THEN
          EXECUTE 'ALTER TABLE ' || ${tableName} || ' ADD COLUMN ' || ${columnName} || ' ' || ${columnDefinition};
        END IF;
      END $$;
    `);
    
    console.log(`✅ Column ${columnName} added to ${tableName} (if not exists)`);
  }

  /**
   * Drop column safely (if exists)
   */
  static async dropColumnSafely(tableName: string, columnName: string): Promise<void> {
    // Create backup first
    await this.createBackupTable(tableName);
    
    await db.execute(sql`
      DO $$ 
      BEGIN 
        IF EXISTS (
          SELECT 1 FROM information_schema.columns 
          WHERE table_name = ${tableName} AND column_name = ${columnName}
        ) THEN
          EXECUTE 'ALTER TABLE ' || ${tableName} || ' DROP COLUMN ' || ${columnName};
        END IF;
      END $$;
    `);
    
    console.log(`✅ Column ${columnName} dropped from ${tableName} (if exists)`);
  }

  /**
   * Rename table safely
   */
  static async renameTableSafely(oldName: string, newName: string): Promise<void> {
    await db.execute(sql`
      DO $$ 
      BEGIN 
        IF EXISTS (
          SELECT 1 FROM information_schema.tables 
          WHERE table_name = ${oldName}
        ) THEN
          EXECUTE 'ALTER TABLE ' || ${oldName} || ' RENAME TO ' || ${newName};
        END IF;
      END $$;
    `);
    
    console.log(`✅ Table renamed from ${oldName} to ${newName}`);
  }

  /**
   * Update timestamp columns for existing records
   */
  static async updateTimestamps(tableName: string): Promise<void> {
    await db.execute(sql`
      UPDATE ${sql.identifier(tableName)} 
      SET updated_at = CURRENT_TIMESTAMP 
      WHERE updated_at IS NULL OR updated_at = created_at;
    `);
    
    console.log(`✅ Timestamps updated for ${tableName}`);
  }

  /**
   * Create indexes safely
   */
  static async createIndexSafely(
    indexName: string, 
    tableName: string, 
    columns: string[]
  ): Promise<void> {
    const columnList = columns.join(', ');
    
    await db.execute(sql`
      DO $$ 
      BEGIN 
        IF NOT EXISTS (
          SELECT 1 FROM pg_indexes 
          WHERE indexname = ${indexName}
        ) THEN
          EXECUTE 'CREATE INDEX ' || ${indexName} || ' ON ' || ${tableName} || ' (' || ${columnList} || ')';
        END IF;
      END $$;
    `);
    
    console.log(`✅ Index ${indexName} created on ${tableName}(${columnList})`);
  }
}
