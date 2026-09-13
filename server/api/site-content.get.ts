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
    /**
     * La langue entre dans la clé : sans elle, la première réponse mise en
     * cache serait servie aux deux versions du site.
     *
     * L'identifiant du build y entre aussi, et c'est le point important : ce
     * cache **survit aux déploiements**. Une réponse d'hier, à laquelle manque
     * un champ ajouté depuis, était donc servie au pré-rendu du build suivant
     * — qui la scellait dans le payload de la page. Le client la relit ensuite
     * par `getCachedData` sans jamais redemander : la donnée neuve existait
     * dans l'API, mais aucune page ne la montrait.
     *
     * Ce préfixe fut d'abord une version écrite à la main, `v1` puis `v2`, à
     * incrémenter à chaque changement de forme. Le procédé a tenu une seule
     * livraison : l'ajout des visuels aux références l'a oublié, et le site a
     * servi pendant une heure des références sans image. Une règle qui dépend
     * de la mémoire de qui livre n'est pas une règle.
     *
     * `buildId` change à chaque build. Le cache garde donc tout son intérêt —
     * ne pas recalculer la même réponse sous la charge — sans jamais franchir
     * une mise en production.
     */
    getKey: (event) => {
      const { app } = useRuntimeConfig(event)
      return `${app.buildId}-${parseLocale(getQuery(event).locale)}`
    },
  },
)
