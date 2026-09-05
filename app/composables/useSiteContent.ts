import type {
  Branch,
  Domain,
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
  gallery: GalleryItem[]
  testimonials: Testimonial[]
  faq: FaqItem[]
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
  return useAsyncData<SiteContent>('site-content', () => $fetch('/api/site-content'), {
    // Le contenu éditorial ne dépend pas de la route : on le garde en cache.
    getCachedData: (key, nuxtApp) =>
      nuxtApp.payload.data[key] ?? nuxtApp.static.data[key],
    default: () => ({
      branches: [],
      categories: [],
      services: [],
      domains: [],
      gallery: [],
      testimonials: [],
      faq: [],
      source: 'static' as const,
    }),
  })
}

/** Coordonnées et informations de marque, issues de la runtime config. */
export function useSiteInfo() {
  const { public: cfg } = useRuntimeConfig()

  return {
    ...cfg,
    /** Numéro principal formaté pour l'affichage. */
    phoneDisplay: '(+228) 90 10 85 10',
    phoneSecondaryDisplay: '(+228) 97 80 08 80',
    whatsappUrl: `https://wa.me/${cfg.whatsapp}?text=${encodeURIComponent(
      'Bonjour TBS, je souhaite un devis pour…',
    )}`,
    hours: [
      { days: 'Lundi — Samedi', time: '8h — 19h' },
      { days: 'Dimanche', time: 'sur rendez-vous' },
    ],
  }
}
