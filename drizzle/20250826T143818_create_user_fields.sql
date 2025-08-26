-- Migration: create_user_fields
-- Created: 2025-08-26T14:38:18.616Z
-- Auto-generated timestamp: 20250826T143818

-- Add your SQL commands here
-- Example:
-- ALTER TABLE users ADD COLUMN new_field VARCHAR(255);

-- For data safety, consider:
-- 1. Create backup: CREATE TABLE users_backup AS SELECT * FROM users;
-- 2. Test changes on backup first
-- 3. Add NOT NULL columns with DEFAULT values
-- 4. Use transactions for multiple operations

BEGIN;

CREATE TABLE "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"email" varchar(255) NOT NULL,
	"code" varchar(100) NOT NULL,
	"name" varchar(200) NOT NULL,
	"dob" timestamp,
	"phone_number" varchar(20),
	"password_hash" text NOT NULL,
	"password_confirmation" text NOT NULL,
	"is_active" boolean DEFAULT true,
	"is_verified" boolean DEFAULT false,
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updated_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email"),
	CONSTRAINT "users_code_unique" UNIQUE("code")
);

COMMIT;
