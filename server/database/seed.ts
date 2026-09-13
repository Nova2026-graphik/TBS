/**
 * Seed de la base à partir de `server/data/content.ts`.
 *
 *   npm run db:push     # crée / met à jour les tables
 *   npm run db:seed     # insère le contenu éditorial
 *
 * Le script est idempotent : il vide les tables de contenu puis réinsère.
 * Les demandes de devis (`quote_requests`) ne sont jamais touchées.
 */
import { closeDb, useDb } from './client'
import * as schema from './schema'
import {
  branches as branchesContent,
  domains as domainsContent,
  equipment as equipmentContent,
  faqItems as faqContent,
  galleryItems as galleryContent,
  rentalCategories as categoriesContent,
  serviceBlocks as serviceBlocksContent,
  testimonials as testimonialsContent,
} from '../data/content'

async function seed() {
  const db = useDb()
  if (!db) {
    console.error(
      '✗ DATABASE_URL absent. Renseignez-le dans .env avant de lancer le seed.',
    )
    process.exit(1)
  }

  console.log('→ Nettoyage des tables de contenu…')
  await db.delete(schema.serviceBlocks)
  await db.delete(schema.equipment)
  await db.delete(schema.domains)
  await db.delete(schema.galleryItems)
  await db.delete(schema.rentalCategories)
  await db.delete(schema.testimonials)
  await db.delete(schema.faqItems)
  await db.delete(schema.branches)

  console.log('→ Branches…')
  await db.insert(schema.branches).values(
    branchesContent.map(b => ({
      slug: b.slug,
      position: b.index,
      name: b.name,
      tagline: b.tagline,
      description: b.description,
      color: b.color,
      image: b.image,
      imageAlt: b.imageAlt,
      tags: b.tags,
    })),
  )

  console.log('→ Catégories de location…')
  await db.insert(schema.rentalCategories).values(
    categoriesContent.map((c, i) => ({
      slug: c.slug,
      name: c.name,
      refCount: c.refCount,
      image: c.image,
      imageAlt: c.imageAlt,
      position: i,
    })),
  )

  console.log('→ Prestations…')
  await db.insert(schema.serviceBlocks).values(
    serviceBlocksContent.map((s, i) => ({
      branchSlug: s.branch,
      eyebrow: s.eyebrow,
      title: s.title,
      description: s.description,
      tags: s.tags,
      image: s.image,
      imageAlt: s.imageAlt,
      position: i,
    })),
  )

  console.log('→ Domaines d\'intervention…')
  await db.insert(schema.domains).values(
    domainsContent.map((d, i) => ({
      slug: d.slug,
      branchSlug: d.branch,
      title: d.title,
      description: d.description,
      intro: d.intro,
      meta: d.meta,
      image: d.image,
      imageAlt: d.imageAlt,
      thumbnail: d.thumbnail,
      thumbnailHover: d.thumbnailHover,
      families: d.families ?? [],
      exampleNote: d.exampleNote,
      medallion: d.medallion ?? false,
      position: i,
    })),
  )

  console.log('→ Références du catalogue…')
  await db.insert(schema.equipment).values(
    equipmentContent.map((e, i) => ({
      domainSlug: e.domain,
      name: e.name,
      description: e.description,
      specs: e.specs,
      family: e.family,
      kind: e.kind,
      image: e.image,
      imageHover: e.imageHover,
      nonContractual: e.nonContractual ?? false,
      source: e.source,
      position: i,
    })),
  )

  console.log('→ Galerie…')
  await db.insert(schema.galleryItems).values(
    galleryContent.map((g, i) => ({
      ref: g.id,
      title: g.title,
      location: g.location,
      category: g.category,
      branchSlug: g.branch,
      domainSlug: g.domain,
      image: g.image,
      imageAlt: g.imageAlt,
      position: i,
    })),
  )

  console.log('→ Témoignages…')
  await db.insert(schema.testimonials).values(
    testimonialsContent.map((t, i) => ({
      quote: t.quote,
      author: t.author,
      context: t.context,
      position: i,
    })),
  )

  console.log('→ FAQ…')
  await db.insert(schema.faqItems).values(
    faqContent.map((f, i) => ({
      ref: f.id,
      groupLabel: f.group,
      question: f.question,
      answer: f.answer,
      position: i,
    })),
  )

  console.log('✓ Seed terminé.')
  await closeDb()
}

seed().catch(async (error) => {
  console.error('✗ Échec du seed :', error)
  await closeDb()
  process.exit(1)
})
