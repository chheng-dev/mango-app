CREATE TABLE "products" (
	"id" serial PRIMARY KEY NOT NULL,
	"code" varchar(100) NOT NULL,
	"name" varchar(255) NOT NULL,
	"description" text,
	"base_unit" varchar(50) NOT NULL,
	"unit_price" varchar(50) NOT NULL,
	"status" varchar(50) NOT NULL,
	"last_updated_by" varchar(100) NOT NULL,
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updated_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
	CONSTRAINT "products_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE "tbl_stock" (
	"p_code" varchar(25) PRIMARY KEY NOT NULL,
	"w_code" varchar(25) NOT NULL,
	"p_instock" double precision NOT NULL,
	"p_commited" double precision NOT NULL,
	"p_orderd" double precision NOT NULL,
	"p_available" double precision NOT NULL
);
--> statement-breakpoint
CREATE TABLE "warehouses" (
	"id" serial PRIMARY KEY NOT NULL,
	"w_code" varchar(100) NOT NULL,
	"w_description" text NOT NULL,
	"w_status" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updated_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"created_by" varchar(100) NOT NULL,
	"updated_by" varchar(100) NOT NULL,
	CONSTRAINT "warehouses_w_code_unique" UNIQUE("w_code")
);
