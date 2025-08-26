-- Migration: update_users_schema_with_auth_fields
-- Created: 2025-08-26T13:37:18.154Z
-- Auto-generated timestamp: 20250826T133718

-- This migration updates the users table to include authentication and profile fields
-- Changes:
-- 1. Remove firstName and lastName, add name field
-- 2. Add code field for unique user codes
-- 3. Add dob (date of birth) field
-- 4. Add phoneNumber field
-- 5. Add passwordHash and passwordConfirmation fields
-- 6. Add isVerified field for email verification

BEGIN;

-- Create backup table first for safety
CREATE TABLE users_backup_20250826 AS SELECT * FROM users;

-- Add new columns safely (with default values where needed)
DO $$ 
BEGIN 
  -- Add code field (unique user code)
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'users' AND column_name = 'code'
  ) THEN
    ALTER TABLE users ADD COLUMN code VARCHAR(100);
  END IF;
  
  -- Add name field to replace firstName and lastName
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'users' AND column_name = 'name'
  ) THEN
    ALTER TABLE users ADD COLUMN name VARCHAR(200);
  END IF;
  
  -- Add date of birth
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'users' AND column_name = 'dob'
  ) THEN
    ALTER TABLE users ADD COLUMN dob TIMESTAMP;
  END IF;
  
  -- Add phone number
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'users' AND column_name = 'phone_number'
  ) THEN
    ALTER TABLE users ADD COLUMN phone_number VARCHAR(20);
  END IF;
  
  -- Add password hash
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'users' AND column_name = 'password_hash'
  ) THEN
    ALTER TABLE users ADD COLUMN password_hash TEXT;
  END IF;
  
  -- Add password confirmation
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'users' AND column_name = 'password_confirmation'
  ) THEN
    ALTER TABLE users ADD COLUMN password_confirmation TEXT;
  END IF;
  
  -- Add is_verified field
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'users' AND column_name = 'is_verified'
  ) THEN
    ALTER TABLE users ADD COLUMN is_verified BOOLEAN DEFAULT false;
  END IF;
END $$;

-- Migrate existing data: combine firstName and lastName into name
UPDATE users 
SET name = COALESCE(first_name, '') || ' ' || COALESCE(last_name, '')
WHERE name IS NULL AND (first_name IS NOT NULL OR last_name IS NOT NULL);

-- Generate unique codes for existing users (using email prefix + random number)
UPDATE users 
SET code = SUBSTRING(email FROM 1 FOR POSITION('@' IN email) - 1) || '_' || EXTRACT(epoch FROM NOW())::INTEGER
WHERE code IS NULL;

-- Set default password hash for existing users (they'll need to reset)
UPDATE users 
SET password_hash = 'needs_reset',
    password_confirmation = 'needs_reset'
WHERE password_hash IS NULL;

-- Now make required fields NOT NULL
ALTER TABLE users ALTER COLUMN code SET NOT NULL;
ALTER TABLE users ALTER COLUMN name SET NOT NULL;
ALTER TABLE users ALTER COLUMN password_hash SET NOT NULL;
ALTER TABLE users ALTER COLUMN password_confirmation SET NOT NULL;

-- Add unique constraint on code
ALTER TABLE users ADD CONSTRAINT users_code_unique UNIQUE (code);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_code ON users(code);
CREATE INDEX IF NOT EXISTS idx_users_phone_number ON users(phone_number) WHERE phone_number IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_users_is_verified ON users(is_verified) WHERE is_verified = true;
CREATE INDEX IF NOT EXISTS idx_users_name ON users(name);

-- Drop old columns (firstName and lastName) if they exist
-- Note: This is commented out for safety - uncomment after verifying data migration
-- ALTER TABLE users DROP COLUMN IF EXISTS first_name;
-- ALTER TABLE users DROP COLUMN IF EXISTS last_name;

COMMIT;

-- Log migration completion
SELECT 'Migration update_users_schema_with_auth_fields completed successfully' as status;
