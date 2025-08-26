#!/usr/bin/env node

/**
 * Safe migration runner with data protection
 */

import { MigrationManager } from '../src/lib/db/migrations.js';
import { db } from '../src/lib/db/index.js';

async function runMigrations() {
  console.log('🚀 Starting safe migrations...');
  
  try {
    // Ensure migration tracking table exists
    await MigrationManager.ensureMigrationTable();
    
    // Get applied migrations
    const appliedMigrations = await MigrationManager.getAppliedMigrations();
    console.log(`📋 Applied migrations: ${appliedMigrations.length}`);
    
    // Example: Add updated_at trigger for automatic timestamp updates
    const migrationHash = 'add_updated_at_triggers_' + Date.now();
    
    if (!appliedMigrations.includes(migrationHash)) {
      console.log('🔄 Adding updated_at triggers...');
      
      // Create function to update timestamps
      await db.execute(`
        CREATE OR REPLACE FUNCTION update_updated_at_column()
        RETURNS TRIGGER AS $$
        BEGIN
          NEW.updated_at = CURRENT_TIMESTAMP;
          RETURN NEW;
        END;
        $$ language 'plpgsql';
      `);
      
      // Add triggers for each table
      const tables = ['users', 'posts', 'comments'];
      
      for (const table of tables) {
        await db.execute(`
          DROP TRIGGER IF EXISTS update_${table}_updated_at ON ${table};
          CREATE TRIGGER update_${table}_updated_at
            BEFORE UPDATE ON ${table}
            FOR EACH ROW
            EXECUTE FUNCTION update_updated_at_column();
        `);
      }
      
      // Mark migration as applied
      await MigrationManager.markMigrationApplied(migrationHash);
      console.log('✅ Updated_at triggers added successfully');
    }
    
    // Add indexes for better performance
    const indexMigrationHash = 'add_performance_indexes_' + Date.now();
    
    if (!appliedMigrations.includes(indexMigrationHash)) {
      console.log('🔄 Adding performance indexes...');
      
      await MigrationManager.createIndexSafely('idx_users_email', 'users', ['email']);
      await MigrationManager.createIndexSafely('idx_users_created_at', 'users', ['created_at']);
      await MigrationManager.createIndexSafely('idx_posts_author_id', 'posts', ['author_id']);
      await MigrationManager.createIndexSafely('idx_posts_published', 'posts', ['is_published', 'published_at']);
      await MigrationManager.createIndexSafely('idx_comments_post_id', 'comments', ['post_id']);
      await MigrationManager.createIndexSafely('idx_comments_author_id', 'comments', ['author_id']);
      
      await MigrationManager.markMigrationApplied(indexMigrationHash);
      console.log('✅ Performance indexes added successfully');
    }
    
    console.log('🎉 All migrations completed successfully!');
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

// Run migrations if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runMigrations();
}
