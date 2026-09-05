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
  getFaqItems,
  getGalleryItems,
  getRentalCategories,
  getServiceBlocks,
  getTestimonials,
} from '../utils/repository'

export default defineCachedEventHandler(
  async () => {
    const [branches, categories, services, domains, gallery, testimonials, faq] =
      await Promise.all([
        getBranches(),
        getRentalCategories(),
        getServiceBlocks(),
        getDomains(),
        getGalleryItems(),
        getTestimonials(),
        getFaqItems(),
      ])

    return {
      branches: branches.data,
      categories: categories.data,
      services: services.data,
      domains: domains.data,
      gallery: gallery.data,
      testimonials: testimonials.data,
      faq: faq.data,
      source: branches.source,
    }
  },
  {
    name: 'site-content',
    maxAge: 60 * 10,
    swr: true,
    getKey: () => 'v1',
  },
)
