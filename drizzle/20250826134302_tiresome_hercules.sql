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
