CREATE TYPE "public"."branch_slug" AS ENUM('equipements', 'events', 'etudes', 'agro');--> statement-breakpoint
CREATE TYPE "public"."gallery_category" AS ENUM('mariage', 'ceremonie', 'corporate', 'decor', 'fourniture');--> statement-breakpoint
CREATE TYPE "public"."quote_status" AS ENUM('nouveau', 'en_cours', 'devis_envoye', 'gagne', 'perdu', 'spam');--> statement-breakpoint
CREATE TABLE "branches" (
	"id" serial PRIMARY KEY NOT NULL,
	"slug" "branch_slug" NOT NULL,
	"position" integer NOT NULL,
	"name" varchar(120) NOT NULL,
	"tagline" varchar(200) NOT NULL,
	"description" text NOT NULL,
	"color" varchar(9) NOT NULL,
	"image" varchar(300) NOT NULL,
	"image_alt" varchar(300) NOT NULL,
	"tags" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"is_published" boolean DEFAULT true NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "branches_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "domains" (
	"id" serial PRIMARY KEY NOT NULL,
	"branch_slug" "branch_slug" NOT NULL,
	"title" varchar(200) NOT NULL,
	"description" text NOT NULL,
	"position" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "faq_items" (
	"id" serial PRIMARY KEY NOT NULL,
	"ref" varchar(40) NOT NULL,
	"group_label" varchar(160) NOT NULL,
	"question" text NOT NULL,
	"answer" text NOT NULL,
	"position" integer DEFAULT 0 NOT NULL,
	"is_published" boolean DEFAULT true NOT NULL
);
--> statement-breakpoint
CREATE TABLE "gallery_items" (
	"id" serial PRIMARY KEY NOT NULL,
	"ref" varchar(40) NOT NULL,
	"title" varchar(200) NOT NULL,
	"location" varchar(120),
	"category" "gallery_category" NOT NULL,
	"branch_slug" "branch_slug" NOT NULL,
	"image" varchar(300) NOT NULL,
	"image_alt" varchar(300) NOT NULL,
	"event_date" timestamp,
	"position" integer DEFAULT 0 NOT NULL,
	"is_published" boolean DEFAULT true NOT NULL
);
--> statement-breakpoint
CREATE TABLE "quote_requests" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(160) NOT NULL,
	"phone" varchar(40) NOT NULL,
	"email" varchar(200),
	"branch" varchar(120) NOT NULL,
	"request_type" varchar(120) NOT NULL,
	"event_date" varchar(20),
	"guest_count" integer,
	"location" varchar(200),
	"message" text NOT NULL,
	"status" "quote_status" DEFAULT 'nouveau' NOT NULL,
	"ip_hash" varchar(64),
	"user_agent" varchar(400),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"handled_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "rental_categories" (
	"id" serial PRIMARY KEY NOT NULL,
	"slug" varchar(80) NOT NULL,
	"name" varchar(120) NOT NULL,
	"ref_count" integer DEFAULT 0 NOT NULL,
	"image" varchar(300) NOT NULL,
	"image_alt" varchar(300) NOT NULL,
	"position" integer DEFAULT 0 NOT NULL,
	"is_published" boolean DEFAULT true NOT NULL
);
--> statement-breakpoint
CREATE TABLE "service_blocks" (
	"id" serial PRIMARY KEY NOT NULL,
	"branch_slug" "branch_slug" NOT NULL,
	"eyebrow" varchar(120) NOT NULL,
	"title" varchar(200) NOT NULL,
	"description" text NOT NULL,
	"tags" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"image" varchar(300) NOT NULL,
	"image_alt" varchar(300) NOT NULL,
	"position" integer DEFAULT 0 NOT NULL,
	"is_published" boolean DEFAULT true NOT NULL
);
--> statement-breakpoint
CREATE TABLE "testimonials" (
	"id" serial PRIMARY KEY NOT NULL,
	"quote" text NOT NULL,
	"author" varchar(120) NOT NULL,
	"context" varchar(160) NOT NULL,
	"position" integer DEFAULT 0 NOT NULL,
	"is_published" boolean DEFAULT true NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX "faq_items_ref_idx" ON "faq_items" USING btree ("ref");--> statement-breakpoint
CREATE UNIQUE INDEX "gallery_items_ref_idx" ON "gallery_items" USING btree ("ref");--> statement-breakpoint
CREATE INDEX "gallery_items_category_idx" ON "gallery_items" USING btree ("category","position");--> statement-breakpoint
CREATE INDEX "quote_requests_created_idx" ON "quote_requests" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "quote_requests_status_idx" ON "quote_requests" USING btree ("status");--> statement-breakpoint
CREATE INDEX "quote_requests_ip_idx" ON "quote_requests" USING btree ("ip_hash","created_at");--> statement-breakpoint
CREATE UNIQUE INDEX "rental_categories_slug_idx" ON "rental_categories" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "service_blocks_branch_idx" ON "service_blocks" USING btree ("branch_slug","position");