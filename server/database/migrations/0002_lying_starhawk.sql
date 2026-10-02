-- Ajout en deux temps : un `NOT NULL` sec échouerait sur une table déjà
-- peuplée. La valeur par défaut sert de remplissage le temps de la
-- migration, puis disparaît — le seed réécrit les huit lignes.
ALTER TABLE "domains" ADD COLUMN "slug" varchar(60) DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE "domains" ALTER COLUMN "slug" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "gallery_items" ADD COLUMN "domain_slug" varchar(60);--> statement-breakpoint
CREATE INDEX "gallery_items_domain_idx" ON "gallery_items" USING btree ("domain_slug","position");