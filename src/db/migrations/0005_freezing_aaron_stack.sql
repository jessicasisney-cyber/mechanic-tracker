CREATE TABLE "work_log_entries" (
	"id" text PRIMARY KEY NOT NULL,
	"work_entry_id" text NOT NULL,
	"author_id" text,
	"note" text NOT NULL,
	"visible_to_customer" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "work_log_entries" ADD CONSTRAINT "work_log_entries_work_entry_id_work_entries_id_fk" FOREIGN KEY ("work_entry_id") REFERENCES "public"."work_entries"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "work_log_entries" ADD CONSTRAINT "work_log_entries_author_id_users_id_fk" FOREIGN KEY ("author_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;