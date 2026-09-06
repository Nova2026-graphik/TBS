/**
 * Schéma PostgreSQL — Drizzle ORM.
 *
 * Deux familles de tables :
 *  1. Contenu éditorial (branches, catégories, prestations, galerie, FAQ…)
 *     — alimenté par le seed, modifiable ensuite depuis un back-office.
 *  2. Données transactionnelles (demandes de devis) — écrites par le site.
 */
import { relations, sql } from 'drizzle-orm'
import {
  boolean,
  index,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  serial,
  text,
  timestamp,
  uniqueIndex,
  uuid,
  varchar,
} from 'drizzle-orm/pg-core'

/* ── Énumérations ─────────────────────────────────────────────────────────── */

export const branchSlugEnum = pgEnum('branch_slug', [
  'equipements',
  'events',
  'etudes',
  'agro',
])

export const galleryCategoryEnum = pgEnum('gallery_category', [
  'mariage',
  'ceremonie',
  'corporate',
  'decor',
  'fourniture',
])

export const quoteStatusEnum = pgEnum('quote_status', [
  'nouveau',
  'en_cours',
  'devis_envoye',
  'gagne',
  'perdu',
  'spam',
])

/* ── Contenu éditorial ────────────────────────────────────────────────────── */

/** Les quatre branches d'activité. */
export const branches = pgTable('branches', {
  id: serial('id').primaryKey(),
  slug: branchSlugEnum('slug').notNull().unique(),
  position: integer('position').notNull(),
  name: varchar('name', { length: 120 }).notNull(),
  tagline: varchar('tagline', { length: 200 }).notNull(),
  description: text('description').notNull(),
  color: varchar('color', { length: 9 }).notNull(),
  image: varchar('image', { length: 300 }).notNull(),
  imageAlt: varchar('image_alt', { length: 300 }).notNull(),
  tags: jsonb('tags').$type<string[]>().notNull().default(sql`'[]'::jsonb`),
  isPublished: boolean('is_published').notNull().default(true),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
})

/** Catégories du parc locatif TBS Events (mobilier, nappage…). */
export const rentalCategories = pgTable(
  'rental_categories',
  {
    id: serial('id').primaryKey(),
    slug: varchar('slug', { length: 80 }).notNull(),
    name: varchar('name', { length: 120 }).notNull(),
    refCount: integer('ref_count').notNull().default(0),
    image: varchar('image', { length: 300 }).notNull(),
    imageAlt: varchar('image_alt', { length: 300 }).notNull(),
    position: integer('position').notNull().default(0),
    isPublished: boolean('is_published').notNull().default(true),
  },
  t => [uniqueIndex('rental_categories_slug_idx').on(t.slug)],
)

/** Blocs de prestation affichés sur /services, rattachés à une branche. */
export const serviceBlocks = pgTable(
  'service_blocks',
  {
    id: serial('id').primaryKey(),
    branchSlug: branchSlugEnum('branch_slug').notNull(),
    eyebrow: varchar('eyebrow', { length: 120 }).notNull(),
    title: varchar('title', { length: 200 }).notNull(),
    description: text('description').notNull(),
    tags: jsonb('tags').$type<string[]>().notNull().default(sql`'[]'::jsonb`),
    image: varchar('image', { length: 300 }).notNull(),
    imageAlt: varchar('image_alt', { length: 300 }).notNull(),
    position: integer('position').notNull().default(0),
    isPublished: boolean('is_published').notNull().default(true),
  },
  t => [index('service_blocks_branch_idx').on(t.branchSlug, t.position)],
)

/** Domaines d'intervention listés en page d'accueil. */
export const domains = pgTable('domains', {
  id: serial('id').primaryKey(),
  branchSlug: branchSlugEnum('branch_slug').notNull(),
  title: varchar('title', { length: 200 }).notNull(),
  description: text('description').notNull(),
  position: integer('position').notNull().default(0),
})

/** Réalisations affichées dans la galerie. */
export const galleryItems = pgTable(
  'gallery_items',
  {
    id: serial('id').primaryKey(),
    ref: varchar('ref', { length: 40 }).notNull(),
    title: varchar('title', { length: 200 }).notNull(),
    location: varchar('location', { length: 120 }),
    category: galleryCategoryEnum('category').notNull(),
    branchSlug: branchSlugEnum('branch_slug').notNull(),
    image: varchar('image', { length: 300 }).notNull(),
    imageAlt: varchar('image_alt', { length: 300 }).notNull(),
    eventDate: timestamp('event_date', { withTimezone: false }),
    position: integer('position').notNull().default(0),
    isPublished: boolean('is_published').notNull().default(true),
  },
  t => [
    uniqueIndex('gallery_items_ref_idx').on(t.ref),
    index('gallery_items_category_idx').on(t.category, t.position),
  ],
)

/** Témoignages clients. */
export const testimonials = pgTable('testimonials', {
  id: serial('id').primaryKey(),
  quote: text('quote').notNull(),
  author: varchar('author', { length: 120 }).notNull(),
  context: varchar('context', { length: 160 }).notNull(),
  position: integer('position').notNull().default(0),
  isPublished: boolean('is_published').notNull().default(true),
})

/** Questions fréquentes — également exposées en JSON-LD FAQPage. */
export const faqItems = pgTable(
  'faq_items',
  {
    id: serial('id').primaryKey(),
    ref: varchar('ref', { length: 40 }).notNull(),
    groupLabel: varchar('group_label', { length: 160 }).notNull(),
    question: text('question').notNull(),
    answer: text('answer').notNull(),
    position: integer('position').notNull().default(0),
    isPublished: boolean('is_published').notNull().default(true),
  },
  t => [uniqueIndex('faq_items_ref_idx').on(t.ref)],
)

/* ── Transactionnel ───────────────────────────────────────────────────────── */

/** Demandes de devis soumises depuis /contact. */
export const quoteRequests = pgTable(
  'quote_requests',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    name: varchar('name', { length: 160 }).notNull(),
    phone: varchar('phone', { length: 40 }).notNull(),
    email: varchar('email', { length: 200 }),
    branch: varchar('branch', { length: 120 }).notNull(),
    requestType: varchar('request_type', { length: 120 }).notNull(),
    eventDate: varchar('event_date', { length: 20 }),
    guestCount: integer('guest_count'),
    location: varchar('location', { length: 200 }),
    message: text('message').notNull(),
    status: quoteStatusEnum('status').notNull().default('nouveau'),
    /**
     * Note du commercial qui traite la demande — jamais montrée au client.
     * Anonymisée en même temps que le reste, passé le délai de conservation.
     */
    internalNote: text('internal_note'),
    /** Conservé pour la limitation de débit et l'analyse anti-spam. */
    ipHash: varchar('ip_hash', { length: 64 }),
    userAgent: varchar('user_agent', { length: 400 }),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    handledAt: timestamp('handled_at', { withTimezone: true }),
  },
  t => [
    index('quote_requests_created_idx').on(t.createdAt),
    index('quote_requests_status_idx').on(t.status),
    index('quote_requests_ip_idx').on(t.ipHash, t.createdAt),
  ],
)

/* ── Relations ────────────────────────────────────────────────────────────── */

export const branchesRelations = relations(branches, ({ many }) => ({
  serviceBlocks: many(serviceBlocks),
  domains: many(domains),
  galleryItems: many(galleryItems),
}))

export const serviceBlocksRelations = relations(serviceBlocks, ({ one }) => ({
  branch: one(branches, {
    fields: [serviceBlocks.branchSlug],
    references: [branches.slug],
  }),
}))

export const domainsRelations = relations(domains, ({ one }) => ({
  branch: one(branches, {
    fields: [domains.branchSlug],
    references: [branches.slug],
  }),
}))

export const galleryItemsRelations = relations(galleryItems, ({ one }) => ({
  branch: one(branches, {
    fields: [galleryItems.branchSlug],
    references: [branches.slug],
  }),
}))

/* ── Types inférés ────────────────────────────────────────────────────────── */

export type BranchRow = typeof branches.$inferSelect
export type GalleryItemRow = typeof galleryItems.$inferSelect
export type FaqItemRow = typeof faqItems.$inferSelect
export type QuoteRequestRow = typeof quoteRequests.$inferSelect
export type NewQuoteRequest = typeof quoteRequests.$inferInsert
