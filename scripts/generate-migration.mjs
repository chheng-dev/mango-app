#!/usr/bin/env node

/**
 * Generate new migration with timestamp
 */

import fs from 'fs';
import path from 'path';

function generateMigration(name) {
  if (!name) {
    console.error('❌ Please provide a migration name');
    console.log('Usage: npm run migration:new <migration_name>');
    process.exit(1);
  }
  
  const timestamp = new Date().toISOString().replace(/[-:]/g, '').replace(/\..+/, '');
  const fileName = `${timestamp}_${name.toLowerCase().replace(/\s+/g, '_')}.sql`;
  const migrationPath = path.join(process.cwd(), 'drizzle', fileName);
  
  // Ensure drizzle directory exists
  const drizzleDir = path.dirname(migrationPath);
  if (!fs.existsSync(drizzleDir)) {
    fs.mkdirSync(drizzleDir, { recursive: true });
  }
  
  const template = `-- Migration: ${name}
-- Created: ${new Date().toISOString()}
-- Auto-generated timestamp: ${timestamp}

-- Add your SQL commands here
-- Example:
-- ALTER TABLE users ADD COLUMN new_field VARCHAR(255);

-- For data safety, consider:
-- 1. Create backup: CREATE TABLE users_backup AS SELECT * FROM users;
-- 2. Test changes on backup first
-- 3. Add NOT NULL columns with DEFAULT values
-- 4. Use transactions for multiple operations

BEGIN;

-- Your migration code here

COMMIT;
`;

  fs.writeFileSync(migrationPath, template);
  
  console.log(`✅ Migration created: ${fileName}`);
  console.log(`📁 Location: ${migrationPath}`);
  console.log('');
  console.log('Next steps:');
  console.log('1. Edit the migration file with your SQL commands');
  console.log('2. Run: npm run db:migrate');
  console.log('3. Test your changes');
}

const migrationName = process.argv[2];
generateMigration(migrationName);
