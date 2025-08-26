# 🗄️ Drizzle Migrations with Data Safety

## Overview
This setup provides a robust migration system that prevents data loss and ensures database integrity with proper timestamp tracking.

## 🚀 Quick Start

### 1. Create a New Migration
```bash
npm run migration:new "add_user_profile_fields"
```

### 2. Edit the Generated Migration
Edit the file in `drizzle/` folder with your SQL commands.

### 3. Apply Migrations
```bash
npm run db:migrate
```

### 4. Create Backup (Recommended before major changes)
```bash
npm run db:backup
```

## 📋 Available Commands

| Command | Description |
|---------|-------------|
| `npm run migration:new <name>` | Generate new migration file with timestamp |
| `npm run migration:run` | Run custom safe migrations |
| `npm run db:generate` | Generate migrations from schema changes |
| `npm run db:migrate` | Apply pending migrations |
| `npm run db:backup` | Create timestamped database backup |
| `npm run db:restore <file>` | Restore from backup file |
| `npm run db:studio` | Open Drizzle Studio |
| `npm run db:push` | Push schema changes directly (dev only) |

## 🛡️ Data Safety Features

### 1. Automatic Backups
- Backups are created with timestamps
- Only last 10 backups are kept
- Automatic cleanup of old backups

### 2. Safe Column Operations
```typescript
// Add column safely (if not exists)
await MigrationManager.addColumnSafely(
  'users', 
  'phone', 
  'VARCHAR(20)'
);

// Drop column safely (creates backup first)
await MigrationManager.dropColumnSafely('users', 'old_field');
```

### 3. Timestamp Tracking
- All tables have `created_at` and `updated_at`
- Automatic triggers update `updated_at` on changes
- Migration history is tracked with timestamps

### 4. Safe Index Creation
```typescript
await MigrationManager.createIndexSafely(
  'idx_users_email', 
  'users', 
  ['email']
);
```

## 📝 Migration Best Practices

### 1. Always Test First
```sql
-- Create backup before destructive changes
CREATE TABLE users_backup AS SELECT * FROM users;

-- Test your changes
ALTER TABLE users_backup ADD COLUMN new_field VARCHAR(255);

-- If successful, apply to main table
ALTER TABLE users ADD COLUMN new_field VARCHAR(255);
```

### 2. Use Transactions
```sql
BEGIN;

-- Multiple related changes
ALTER TABLE users ADD COLUMN status VARCHAR(20) DEFAULT 'active';
UPDATE users SET status = 'active' WHERE status IS NULL;
ALTER TABLE users ALTER COLUMN status SET NOT NULL;

COMMIT;
```

### 3. Handle NULL Values
```sql
-- Add column with default for existing records
ALTER TABLE users ADD COLUMN created_by INTEGER DEFAULT 1;

-- Update existing records
UPDATE users SET created_by = 1 WHERE created_by IS NULL;

-- Make NOT NULL after data is populated
ALTER TABLE users ALTER COLUMN created_by SET NOT NULL;
```

### 4. Create Indexes Concurrently
```sql
-- For large tables, create indexes concurrently
CREATE INDEX CONCURRENTLY idx_users_email ON users(email);
```

## 🔄 Common Migration Patterns

### Adding a New Table
```sql
CREATE TABLE user_profiles (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id),
  bio TEXT,
  avatar_url VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- Add indexes
CREATE INDEX idx_user_profiles_user_id ON user_profiles(user_id);
CREATE INDEX idx_user_profiles_created_at ON user_profiles(created_at);
```

### Adding a Column with Data Migration
```sql
-- 1. Add column (nullable first)
ALTER TABLE users ADD COLUMN full_name VARCHAR(255);

-- 2. Populate with existing data
UPDATE users SET full_name = CONCAT(first_name, ' ', last_name);

-- 3. Make NOT NULL if needed
ALTER TABLE users ALTER COLUMN full_name SET NOT NULL;
```

### Renaming a Column
```sql
-- 1. Add new column
ALTER TABLE users ADD COLUMN email_address VARCHAR(255);

-- 2. Copy data
UPDATE users SET email_address = email;

-- 3. Update application code to use new column

-- 4. Drop old column (in next migration)
-- ALTER TABLE users DROP COLUMN email;
```

## 🚨 Recovery Procedures

### Restore from Backup
```bash
# List available backups
ls backups/

# Restore specific backup
npm run db:restore backups/backup_20241227_143022.sql
```

### Rollback Migration
```sql
-- Find migration in _drizzle_migrations table
SELECT * FROM _drizzle_migrations ORDER BY applied_at DESC LIMIT 5;

-- Manual rollback (create reverse migration)
npm run migration:new "rollback_user_profile_fields"
```

## 📊 Monitoring

### Check Migration Status
```sql
-- See applied migrations
SELECT hash, applied_at FROM _drizzle_migrations ORDER BY applied_at DESC;

-- Check table sizes
SELECT 
  schemaname,
  tablename,
  attname,
  n_distinct,
  null_frac
FROM pg_stats 
WHERE schemaname = 'public';
```

### Performance Monitoring
```sql
-- Check index usage
SELECT 
  schemaname,
  tablename,
  indexname,
  idx_scan,
  idx_tup_read,
  idx_tup_fetch
FROM pg_stat_user_indexes
ORDER BY idx_scan DESC;
```

## 🔧 Troubleshooting

### Migration Fails
1. Check database connection
2. Verify DATABASE_URL in `.env.local`
3. Check migration SQL syntax
4. Look for conflicting constraints

### Performance Issues
1. Check for missing indexes
2. Analyze query performance
3. Consider partitioning for large tables
4. Use `EXPLAIN ANALYZE` for slow queries

### Data Integrity Issues
1. Restore from backup
2. Check foreign key constraints
3. Verify data types match
4. Test with small dataset first
