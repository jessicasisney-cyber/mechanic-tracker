CREATE TABLE "customer_updates" (
	"id" text PRIMARY KEY NOT NULL,
	"work_entry_id" text NOT NULL,
	"message" text NOT NULL,
	"tracking_number" text,
	"resolved" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "customer_updates" ADD CONSTRAINT "customer_updates_work_entry_id_work_entries_id_fk" FOREIGN KEY ("work_entry_id") REFERENCES "public"."work_entries"("id") ON DELETE cascade ON UPDATE no action;