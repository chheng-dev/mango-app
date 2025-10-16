ALTER TABLE "tbl_contactPerson" ALTER COLUMN "cpName" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "tbl_contactPerson" ALTER COLUMN "cEmail" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "tbl_contactPerson" ALTER COLUMN "cStatus" SET DEFAULT true;--> statement-breakpoint
ALTER TABLE "tbl_contactPerson" ALTER COLUMN "cpCreatedAt" SET DEFAULT now();--> statement-breakpoint
ALTER TABLE "tbl_contactPerson" ALTER COLUMN "cpCreatedAt" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "tbl_contactPerson" ALTER COLUMN "cpLastUpdateAt" SET DEFAULT now();--> statement-breakpoint
ALTER TABLE "tbl_contactPerson" ALTER COLUMN "cpLastUpdateAt" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "tbl_contactPerson" ADD CONSTRAINT "tbl_contactPerson_cEmail_unique" UNIQUE("cEmail");