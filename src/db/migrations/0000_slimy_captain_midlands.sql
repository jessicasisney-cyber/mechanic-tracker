CREATE TYPE "public"."part_status" AS ENUM('Ordered', 'In Transit', 'Arrived', 'Installed', 'Returned', 'N/A');--> statement-breakpoint
CREATE TYPE "public"."project_type" AS ENUM('Repair', 'Maintenance', 'Diagnostic', 'Custom Build', 'Inspection', 'Other');--> statement-breakpoint
CREATE TYPE "public"."sms_status" AS ENUM('queued', 'sent', 'failed');--> statement-breakpoint
CREATE TYPE "public"."user_role" AS ENUM('owner', 'mechanic');--> statement-breakpoint
CREATE TYPE "public"."vehicle_type" AS ENUM('Car', 'Truck', 'SUV', 'Motorcycle', 'RV', 'Other');--> statement-breakpoint
CREATE TABLE "customers" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"phone" text,
	"email" text,
	"sms_opt_in" text DEFAULT 'pending' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "parts" (
	"id" text PRIMARY KEY NOT NULL,
	"work_entry_id" text NOT NULL,
	"part_name" text,
	"vendor" text,
	"part_cost" numeric(10, 2),
	"part_status" "part_status",
	"receipt_ref" text,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "photos" (
	"id" text PRIMARY KEY NOT NULL,
	"work_entry_id" text NOT NULL,
	"url" text NOT NULL,
	"caption" text,
	"uploaded_by" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "sms_messages" (
	"id" text PRIMARY KEY NOT NULL,
	"customer_id" text NOT NULL,
	"work_entry_id" text,
	"body" text NOT NULL,
	"status" "sms_status" DEFAULT 'queued' NOT NULL,
	"provider" text DEFAULT 'twilio' NOT NULL,
	"provider_message_id" text,
	"error_message" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"password_hash" text NOT NULL,
	"role" "user_role" DEFAULT 'mechanic' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "work_entries" (
	"id" text PRIMARY KEY NOT NULL,
	"customer_id" text NOT NULL,
	"created_by" text,
	"date" text NOT NULL,
	"vehicle_type" "vehicle_type",
	"make_model" text,
	"project_type" "project_type",
	"project_description" text,
	"time_spent" numeric(6, 2),
	"work_notes" text,
	"customer_notes" text,
	"scope_change_date" text,
	"scope_change_notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "parts" ADD CONSTRAINT "parts_work_entry_id_work_entries_id_fk" FOREIGN KEY ("work_entry_id") REFERENCES "public"."work_entries"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "photos" ADD CONSTRAINT "photos_work_entry_id_work_entries_id_fk" FOREIGN KEY ("work_entry_id") REFERENCES "public"."work_entries"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "photos" ADD CONSTRAINT "photos_uploaded_by_users_id_fk" FOREIGN KEY ("uploaded_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sms_messages" ADD CONSTRAINT "sms_messages_customer_id_customers_id_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."customers"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sms_messages" ADD CONSTRAINT "sms_messages_work_entry_id_work_entries_id_fk" FOREIGN KEY ("work_entry_id") REFERENCES "public"."work_entries"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "work_entries" ADD CONSTRAINT "work_entries_customer_id_customers_id_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."customers"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "work_entries" ADD CONSTRAINT "work_entries_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;