CREATE TABLE "tbl_contactPerson" (
	"cpCode" varchar(25) PRIMARY KEY NOT NULL,
	"cpName" varchar(100),
	"cCode" varchar(25),
	"cTel" varchar(50),
	"cEmail" varchar(50),
	"cStatus" boolean,
	"cpCreatedAt" timestamp,
	"cpCreatedBy" varchar(25),
	"cpLastUpdateAt" timestamp,
	"cpLastUpdateBy" varchar(25)
);
--> statement-breakpoint
CREATE TABLE "tbl_customer" (
	"cCode" varchar(25) PRIMARY KEY NOT NULL,
	"cName" varchar(100),
	"cDescription" varchar(255),
	"cAddress" varchar(255),
	"cTel" varchar(50),
	"cEmail" varchar(50),
	"cStatus" boolean,
	"cCreatedAt" timestamp,
	"cCreatedBy" varchar(25),
	"uLastUpdateAt" timestamp,
	"cLastUpdateBy" varchar(25)
);
--> statement-breakpoint
CREATE TABLE "tbl_employee" (
	"eCode" varchar(25) PRIMARY KEY NOT NULL,
	"eName" varchar(100),
	"eDescription" varchar(255),
	"eGender" varchar(7),
	"eDOB" date,
	"eAddress" varchar(255),
	"eTel" varchar(50),
	"eEmail" varchar(50),
	"eStatus" boolean,
	"eCreatedAt" timestamp,
	"eCreatedBy" varchar(25),
	"eLastUpdateAt" timestamp,
	"eLastUpdateBy" varchar(25)
);
--> statement-breakpoint
CREATE TABLE "tbl_quotationHeader" (
	"qhCode" varchar(15) PRIMARY KEY NOT NULL,
	"qhType" varchar(10),
	"qhStatus" boolean,
	"qhPostingDate" timestamp,
	"qhValidDate" timestamp,
	"qlDocDate" timestamp,
	"cCode" varchar(50),
	"eCode" varchar(50),
	"qhProjectID" varchar(50),
	"qhProjectName" varchar(255),
	"qhPaymentCode" varchar(50),
	"qhPaymentName" varchar(255),
	"qhShipping" varchar(50),
	"qlPicDelDate" timestamp,
	"qhDestinationCode" varchar(50),
	"qhDestinationName" varchar(255),
	"qhGTotal" numeric(19, 2),
	"qhDiscount" numeric(19, 2),
	"qhTotal" numeric(19, 2),
	"qhCreatedAt" timestamp,
	"qhCreatedBy" varchar(25),
	"qhLastUpdateAt" timestamp,
	"qhLastUpdateBy" varchar(25),
	"qhApprovedAt" timestamp,
	"qhApprovedBy" varchar(25),
	"qhClosedAt" timestamp,
	"qhClosedBy" varchar(25)
);
--> statement-breakpoint
CREATE TABLE "tbl_quotationLine" (
	"qlID" integer PRIMARY KEY NOT NULL,
	"qhCode" varchar(15),
	"qlLineNo" integer,
	"qlpCode" varchar(25),
	"qlpName" varchar(100),
	"qlpBaseUnit" varchar(10),
	"qlpUnitPrice" double precision,
	"qlQty" double precision,
	"qlGrandTotal" double precision,
	"qlDiscount" double precision,
	"qlTotal" double precision,
	"qlRemark" varchar(255)
);
--> statement-breakpoint
ALTER TABLE "tbl_contactPerson" ADD CONSTRAINT "tbl_contactPerson_cCode_tbl_customer_cCode_fk" FOREIGN KEY ("cCode") REFERENCES "public"."tbl_customer"("cCode") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tbl_contactPerson" ADD CONSTRAINT "tbl_contactPerson_cpCreatedBy_users_code_fk" FOREIGN KEY ("cpCreatedBy") REFERENCES "public"."users"("code") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tbl_contactPerson" ADD CONSTRAINT "tbl_contactPerson_cpLastUpdateBy_users_code_fk" FOREIGN KEY ("cpLastUpdateBy") REFERENCES "public"."users"("code") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tbl_customer" ADD CONSTRAINT "tbl_customer_cCreatedBy_users_code_fk" FOREIGN KEY ("cCreatedBy") REFERENCES "public"."users"("code") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tbl_customer" ADD CONSTRAINT "tbl_customer_cLastUpdateBy_users_code_fk" FOREIGN KEY ("cLastUpdateBy") REFERENCES "public"."users"("code") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tbl_employee" ADD CONSTRAINT "tbl_employee_eCreatedBy_users_code_fk" FOREIGN KEY ("eCreatedBy") REFERENCES "public"."users"("code") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tbl_employee" ADD CONSTRAINT "tbl_employee_eLastUpdateBy_users_code_fk" FOREIGN KEY ("eLastUpdateBy") REFERENCES "public"."users"("code") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tbl_quotationHeader" ADD CONSTRAINT "tbl_quotationHeader_cCode_tbl_customer_cCode_fk" FOREIGN KEY ("cCode") REFERENCES "public"."tbl_customer"("cCode") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tbl_quotationHeader" ADD CONSTRAINT "tbl_quotationHeader_eCode_tbl_employee_eCode_fk" FOREIGN KEY ("eCode") REFERENCES "public"."tbl_employee"("eCode") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tbl_quotationHeader" ADD CONSTRAINT "tbl_quotationHeader_qhCreatedBy_users_code_fk" FOREIGN KEY ("qhCreatedBy") REFERENCES "public"."users"("code") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tbl_quotationHeader" ADD CONSTRAINT "tbl_quotationHeader_qhLastUpdateBy_users_code_fk" FOREIGN KEY ("qhLastUpdateBy") REFERENCES "public"."users"("code") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tbl_quotationHeader" ADD CONSTRAINT "tbl_quotationHeader_qhApprovedBy_users_code_fk" FOREIGN KEY ("qhApprovedBy") REFERENCES "public"."users"("code") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tbl_quotationHeader" ADD CONSTRAINT "tbl_quotationHeader_qhClosedBy_users_code_fk" FOREIGN KEY ("qhClosedBy") REFERENCES "public"."users"("code") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tbl_quotationLine" ADD CONSTRAINT "tbl_quotationLine_qhCode_tbl_quotationHeader_qhCode_fk" FOREIGN KEY ("qhCode") REFERENCES "public"."tbl_quotationHeader"("qhCode") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tbl_quotationLine" ADD CONSTRAINT "tbl_quotationLine_qlpCode_tbl_stock_pCode_fk" FOREIGN KEY ("qlpCode") REFERENCES "public"."tbl_stock"("pCode") ON DELETE no action ON UPDATE no action;