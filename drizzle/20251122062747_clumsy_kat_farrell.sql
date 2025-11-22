ALTER TABLE "permissions" DROP CONSTRAINT "permissions_slug_unique";--> statement-breakpoint
ALTER TABLE "permissions" ADD COLUMN "category" varchar(500);--> statement-breakpoint
ALTER TABLE "roles" ADD COLUMN "is_system_role" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "permissions" DROP COLUMN "slug";