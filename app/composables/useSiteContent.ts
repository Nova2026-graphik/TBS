import type {
  Branch,
  Domain,
  Equipment,
  FaqItem,
  GalleryItem,
  RentalCategory,
  ServiceBlock,
  Testimonial,
} from '#shared/types'

interface SiteContent {
  branches: Branch[]
  categories: RentalCategory[]
  services: ServiceBlock[]
  domains: Domain[]
  equipment: Equipment[]
  gallery: GalleryItem[]
  testimonials: Testimonial[]
  faq: FaqItem[]
  locale: 'fr' | 'en'
  source: 'database' | 'static'
}

/**
 * Contenu du site, chargé une seule fois et partagé entre toutes les pages.
 *
 * `useAsyncData` avec une clé constante déduplique l'appel : naviguer entre
 * Accueil, Services et Galerie ne déclenche pas de nouvelle requête, et le
 * payload est intégré au HTML rendu côté serveur.
 */
export function useSiteContent() {
  const { locale } = useI18n()

  /**
   * La clé porte la langue : sans elle, le contenu français resterait en cache
   * au passage sur `/en`, et l'inverse. C'est aussi ce qui déclenche le
   * rechargement quand le visiteur change de langue.
   */
  return useAsyncData<SiteContent>(
    () => `site-content-${locale.value}`,
    () => $fetch('/api/site-content', { query: { locale: locale.value } }),
    {
    // Le contenu éditorial ne dépend pas de la route : on le garde en cache.
      getCachedData: (key, nuxtApp) =>
        nuxtApp.payload.data[key] ?? nuxtApp.static.data[key],
      default: () => ({
        branches: [],
        categories: [],
        services: [],
        domains: [],
        equipment: [],
        gallery: [],
        testimonials: [],
        faq: [],
        locale: 'fr' as const,
        source: 'static' as const,
      }),
      watch: [locale],
    },
  )
}

/** Coordonnées et informations de marque, issues de la runtime config. */
export function useSiteInfo() {
  const { public: cfg } = useRuntimeConfig()
  const { t } = useI18n()

  return {
    ...cfg,
    /** Numéro principal formaté pour l'affichage. */
    phoneDisplay: '(+228) 90 10 85 10',
    phoneSecondaryDisplay: '(+228) 97 80 08 80',
    whatsappUrl: `https://wa.me/${cfg.whatsapp}?text=${encodeURIComponent(
      t('common.whatsappMessage'),
    )}`,
    hours: [
      { days: t('common.hoursWeek'), time: t('common.hoursWeekTime') },
      { days: t('common.hoursSunday'), time: t('common.hoursSundayTime') },
    ],
  }
}
