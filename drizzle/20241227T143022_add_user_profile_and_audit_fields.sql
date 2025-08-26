-- Migration: Add user profile and audit fields
-- Created: 2024-12-27T14:30:22.000Z
-- Auto-generated timestamp: 20241227T143022

-- This migration demonstrates safe practices:
-- 1. Adding new tables with proper relationships
-- 2. Adding columns with default values
-- 3. Creating indexes for performance
-- 4. Using transactions for atomicity

BEGIN;

-- Create user_profiles table
CREATE TABLE IF NOT EXISTS user_profiles (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  bio TEXT,
  avatar_url VARCHAR(500),
  phone VARCHAR(20),
  date_of_birth DATE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
  UNIQUE(user_id)
);

-- Add audit fields to existing tables (safely)
DO $$ 
BEGIN 
  -- Add last_login to users if not exists
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'users' AND column_name = 'last_login_at'
  ) THEN
    ALTER TABLE users ADD COLUMN last_login_at TIMESTAMP;
  END IF;
  
  -- Add version field for optimistic locking
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'users' AND column_name = 'version'
  ) THEN
    ALTER TABLE users ADD COLUMN version INTEGER DEFAULT 1;
  END IF;
END $$;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_user_profiles_user_id ON user_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_profiles_created_at ON user_profiles(created_at);
CREATE INDEX IF NOT EXISTS idx_users_last_login ON users(last_login_at) WHERE last_login_at IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_users_email_active ON users(email, is_active) WHERE is_active = true;

-- Add triggers for automatic updated_at handling
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  IF TG_TABLE_NAME = 'users' THEN
    NEW.version = OLD.version + 1;
  END IF;
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply triggers to tables
DROP TRIGGER IF EXISTS update_users_updated_at ON users;
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_user_profiles_updated_at ON user_profiles;
CREATE TRIGGER update_user_profiles_updated_at
  BEFORE UPDATE ON user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_posts_updated_at ON posts;
CREATE TRIGGER update_posts_updated_at
  BEFORE UPDATE ON posts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_comments_updated_at ON comments;
CREATE TRIGGER update_comments_updated_at
  BEFORE UPDATE ON comments
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Insert sample data (optional, for development)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM users WHERE email = 'admin@example.com') THEN
    INSERT INTO users (email, first_name, last_name, is_active) 
    VALUES ('admin@example.com', 'Admin', 'User', true);
  END IF;
END $$;

COMMIT;

-- Log migration completion
SELECT 'Migration 20241227T143022 completed successfully' as status;
