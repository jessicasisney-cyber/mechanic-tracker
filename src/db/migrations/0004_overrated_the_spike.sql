CREATE TYPE "public"."labor_rate_type" AS ENUM('standard', 'specialty');--> statement-breakpoint
CREATE TABLE "shop_settings" (
	"id" text PRIMARY KEY DEFAULT 'default' NOT NULL,
	"standard_labor_rate" numeric(8, 2) DEFAULT '125.00' NOT NULL,
	"specialty_labor_rate_min" numeric(8, 2) DEFAULT '100.00' NOT NULL,
	"specialty_labor_rate_max" numeric(8, 2) DEFAULT '175.00' NOT NULL,
	"sales_tax_rate" numeric(5, 4) DEFAULT '0' NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "work_entries" ADD COLUMN "labor_rate_type" "labor_rate_type" DEFAULT 'standard' NOT NULL;--> statement-breakpoint
ALTER TABLE "work_entries" ADD COLUMN "labor_rate" numeric(8, 2);