ALTER TABLE "domains" ADD COLUMN "intro" text;--> statement-breakpoint
ALTER TABLE "domains" ADD COLUMN "meta" varchar(200);--> statement-breakpoint
ALTER TABLE "domains" ADD COLUMN "image" varchar(300);--> statement-breakpoint
ALTER TABLE "domains" ADD COLUMN "image_alt" varchar(300);--> statement-breakpoint
ALTER TABLE "domains" ADD COLUMN "thumbnail" varchar(300);--> statement-breakpoint
ALTER TABLE "domains" ADD COLUMN "thumbnail_hover" varchar(300);--> statement-breakpoint
ALTER TABLE "domains" ADD COLUMN "families" jsonb DEFAULT '[]'::jsonb NOT NULL;--> statement-breakpoint
ALTER TABLE "domains" ADD COLUMN "example_note" text;--> statement-breakpoint
ALTER TABLE "domains" ADD COLUMN "medallion" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "equipment" ADD COLUMN "family" varchar(120);--> statement-breakpoint
ALTER TABLE "equipment" ADD COLUMN "kind" varchar(20) DEFAULT 'ghost' NOT NULL;--> statement-breakpoint
ALTER TABLE "equipment" ADD COLUMN "image" varchar(300);--> statement-breakpoint
ALTER TABLE "equipment" ADD COLUMN "image_hover" varchar(300);--> statement-breakpoint
ALTER TABLE "equipment" ADD COLUMN "non_contractual" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "equipment" ADD COLUMN "source" varchar(300);