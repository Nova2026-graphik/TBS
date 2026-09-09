CREATE TABLE "equipment" (
	"id" serial PRIMARY KEY NOT NULL,
	"domain_slug" varchar(60) NOT NULL,
	"name" varchar(200) NOT NULL,
	"description" text NOT NULL,
	"specs" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"position" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE INDEX "equipment_domain_idx" ON "equipment" USING btree ("domain_slug","position");