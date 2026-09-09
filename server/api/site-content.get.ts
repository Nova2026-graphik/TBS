/**
 * Contenu du site en une seule requête.
 *
 * Un seul appel évite six aller-retours au chargement ; la réponse est
 * mise en cache 10 minutes côté serveur (SWR) car le contenu éditorial
 * bouge rarement.
 */
import {
  getBranches,
  getDomains,
  getEquipment,
  getFaqItems,
  getGalleryItems,
  getRentalCategories,
  getServiceBlocks,
  getTestimonials,
  parseLocale,
} from '../utils/repository'

export default defineCachedEventHandler(
  async (event) => {
    const locale = parseLocale(getQuery(event).locale)

    const [branches, categories, services, domains, equipment, gallery, testimonials, faq]
      = await Promise.all([
        getBranches(locale),
        getRentalCategories(locale),
        getServiceBlocks(locale),
        getDomains(locale),
        getEquipment(locale),
        getGalleryItems(locale),
        getTestimonials(locale),
        getFaqItems(locale),
      ])

    return {
      branches: branches.data,
      categories: categories.data,
      services: services.data,
      domains: domains.data,
      equipment: equipment.data,
      gallery: gallery.data,
      testimonials: testimonials.data,
      faq: faq.data,
      locale,
      source: branches.source,
    }
  },
  {
    name: 'site-content',
    maxAge: 60 * 10,
    swr: true,
    // La langue entre dans la clé : sans elle, la première réponse mise en
    // cache serait servie aux deux versions du site.
    getKey: event => `v1-${parseLocale(getQuery(event).locale)}`,
  },
)
