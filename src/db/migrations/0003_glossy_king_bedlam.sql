CREATE TABLE "testimonials" (
	"id" text PRIMARY KEY NOT NULL,
	"customer_name" text NOT NULL,
	"quote" text NOT NULL,
	"rating" integer,
	"published" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
