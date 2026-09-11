/**
 * Couche d'accès au contenu.
 *
 * Chaque fonction tente la base de données ; en cas d'absence de connexion ou
 * de table vide, elle renvoie le contenu statique. Le site ne tombe donc
 * jamais en panne à cause de la base — il se dégrade en site statique.
 */
import { asc, eq } from 'drizzle-orm'
import { useDb } from '../database/client'
import * as schema from '../database/schema'
import * as contentFr from '../data/content'
import * as contentEn from '../data/content.en'
import type {
  Branch,
  Domain,
  Equipment,
  FaqItem,
  GalleryItem,
  RentalCategory,
  ServiceBlock,
  Testimonial,
} from '../../shared/types'

/**
 * Langues servies. La valeur par défaut est le français : une locale inconnue
 * — ou absente, comme dans les appels internes — retombe dessus plutôt que de
 * renvoyer une page vide.
 */
export type ContentLocale = 'fr' | 'en'

const CONTENU: Record<ContentLocale, typeof contentFr> = {
  fr: contentFr,
  en: contentEn as typeof contentFr,
}

/** Contenu statique de la langue demandée. */
function statique(locale: ContentLocale = 'fr') {
  return CONTENU[locale] ?? CONTENU.fr
}

export function parseLocale(value: unknown): ContentLocale {
  return value === 'en' ? 'en' : 'fr'
}

/** Exécute `query` et retombe sur `fallback` si la base est absente ou vide. */
async function withFallback<T>(
  query: () => Promise<T[]>,
  fallback: T[],
): Promise<{ data: T[], source: 'database' | 'static' }> {
  const db = useDb()
  if (!db) return { data: fallback, source: 'static' }

  try {
    const rows = await query()
    if (!rows.length) return { data: fallback, source: 'static' }
    return { data: rows, source: 'database' }
  }
  catch (error) {
    console.error('[repository] requête échouée, repli statique :', error)
    return { data: fallback, source: 'static' }
  }
}

export function getBranches(locale: ContentLocale = 'fr') {
  return withFallback<Branch>(async () => {
    const db = useDb()!
    const rows = await db
      .select()
      .from(schema.branches)
      .where(eq(schema.branches.isPublished, true))
      .orderBy(asc(schema.branches.position))

    return rows.map(r => ({
      slug: r.slug,
      index: r.position,
      name: r.name,
      tagline: r.tagline,
      description: r.description,
      color: r.color,
      image: r.image,
      imageAlt: r.imageAlt,
      tags: r.tags ?? [],
    }))
  }, statique(locale).branches)
}

export function getRentalCategories(locale: ContentLocale = 'fr') {
  return withFallback<RentalCategory>(async () => {
    const db = useDb()!
    const rows = await db
      .select()
      .from(schema.rentalCategories)
      .where(eq(schema.rentalCategories.isPublished, true))
      .orderBy(asc(schema.rentalCategories.position))

    return rows.map(r => ({
      slug: r.slug,
      name: r.name,
      refCount: r.refCount,
      image: r.image,
      imageAlt: r.imageAlt,
    }))
  }, statique(locale).rentalCategories)
}

export function getServiceBlocks(locale: ContentLocale = 'fr') {
  return withFallback<ServiceBlock>(async () => {
    const db = useDb()!
    const rows = await db
      .select()
      .from(schema.serviceBlocks)
      .where(eq(schema.serviceBlocks.isPublished, true))
      .orderBy(asc(schema.serviceBlocks.position))

    return rows.map(r => ({
      branch: r.branchSlug,
      eyebrow: r.eyebrow,
      title: r.title,
      description: r.description,
      tags: r.tags ?? [],
      image: r.image,
      imageAlt: r.imageAlt,
    }))
  }, statique(locale).serviceBlocks)
}

export function getDomains(locale: ContentLocale = 'fr') {
  return withFallback<Domain>(async () => {
    const db = useDb()!
    const rows = await db
      .select()
      .from(schema.domains)
      .orderBy(asc(schema.domains.position))

    return rows.map(r => ({
      slug: r.slug as Domain['slug'],
      branch: r.branchSlug,
      title: r.title,
      description: r.description,
      // `?? undefined` et non `?? null` : le type dit « absent », pas « vide ».
      // Une chaîne nulle rendue telle quelle produirait `src="null"`.
      intro: r.intro ?? undefined,
      meta: r.meta ?? undefined,
      image: r.image ?? undefined,
      imageAlt: r.imageAlt ?? undefined,
      thumbnail: r.thumbnail ?? undefined,
      thumbnailHover: r.thumbnailHover ?? undefined,
      families: r.families ?? [],
      exampleNote: r.exampleNote ?? undefined,
      medallion: r.medallion,
    }))
  }, statique(locale).domains)
}

/**
 * Références du catalogue, dans l'ordre où elles ont été semées.
 *
 * Le tri par `position` puis par `id` importe : deux références d'un même
 * domaine partagent leur position quand le seed les a insérées ensemble, et
 * un ordre instable ferait sautiller la liste d'un rendu à l'autre.
 */
export function getEquipment(locale: ContentLocale = 'fr') {
  return withFallback<Equipment>(async () => {
    const db = useDb()!
    const rows = await db
      .select()
      .from(schema.equipment)
      .orderBy(asc(schema.equipment.position), asc(schema.equipment.id))

    return rows.map(r => ({
      domain: r.domainSlug as Equipment['domain'],
      name: r.name,
      description: r.description,
      specs: r.specs ?? [],
      family: r.family ?? undefined,
      kind: r.kind as Equipment['kind'],
      image: r.image ?? undefined,
      imageHover: r.imageHover ?? undefined,
      nonContractual: r.nonContractual,
      source: r.source ?? undefined,
    }))
  }, statique(locale).equipment)
}

export function getGalleryItems(locale: ContentLocale = 'fr') {
  return withFallback<GalleryItem>(async () => {
    const db = useDb()!
    const rows = await db
      .select()
      .from(schema.galleryItems)
      .where(eq(schema.galleryItems.isPublished, true))
      .orderBy(asc(schema.galleryItems.position))

    return rows.map(r => ({
      id: r.ref,
      title: r.title,
      location: r.location,
      category: r.category,
      branch: r.branchSlug,
      domain: (r.domainSlug ?? null) as GalleryItem['domain'],
      image: r.image,
      imageAlt: r.imageAlt,
    }))
  }, statique(locale).galleryItems)
}

export function getTestimonials(locale: ContentLocale = 'fr') {
  return withFallback<Testimonial>(async () => {
    const db = useDb()!
    const rows = await db
      .select()
      .from(schema.testimonials)
      .where(eq(schema.testimonials.isPublished, true))
      .orderBy(asc(schema.testimonials.position))

    return rows.map(r => ({
      quote: r.quote,
      author: r.author,
      context: r.context,
    }))
  }, statique(locale).testimonials)
}

export function getFaqItems(locale: ContentLocale = 'fr') {
  return withFallback<FaqItem>(async () => {
    const db = useDb()!
    const rows = await db
      .select()
      .from(schema.faqItems)
      .where(eq(schema.faqItems.isPublished, true))
      .orderBy(asc(schema.faqItems.position))

    return rows.map(r => ({
      id: r.ref,
      group: r.groupLabel,
      question: r.question,
      answer: r.answer,
    }))
  }, statique(locale).faqItems)
}
