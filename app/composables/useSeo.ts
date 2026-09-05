/**
 * Métadonnées SEO + données structurées.
 *
 * `usePageSeo` pose titre, description, Open Graph et Twitter Card pour une
 * page ; `useOrganizationSchema` et `useFaqSchema` injectent le JSON-LD que
 * Google exploite pour le knowledge panel et les résultats enrichis.
 */
import type { FaqItem } from '#shared/types'

interface PageSeoOptions {
  title: string
  description: string
  /** Chemin absolu de l'image sociale (défaut : visuel de réception). */
  image?: string
  /** Chemin de la page, pour l'URL canonique. */
  path?: string
}

export function usePageSeo(options: PageSeoOptions) {
  const { public: cfg } = useRuntimeConfig()
  const route = useRoute()

  const url = `${cfg.siteUrl}${options.path ?? route.path}`
  const image = `${cfg.siteUrl}${options.image ?? '/images/hero-reception.jpg'}`

  useHead({
    link: [{ rel: 'canonical', href: url }],
  })

  useSeoMeta({
    title: options.title,
    description: options.description,
    ogTitle: `${options.title} · ${cfg.siteName}`,
    ogDescription: options.description,
    ogType: 'website',
    ogUrl: url,
    ogImage: image,
    ogImageAlt: options.title,
    ogSiteName: cfg.siteName,
    ogLocale: 'fr_TG',
    twitterCard: 'summary_large_image',
    twitterTitle: options.title,
    twitterDescription: options.description,
    twitterImage: image,
  })
}

/** JSON-LD LocalBusiness — à poser une seule fois, dans le layout. */
export function useOrganizationSchema() {
  const { public: cfg } = useRuntimeConfig()

  const schema = {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    '@id': `${cfg.siteUrl}/#organization`,
    name: cfg.siteName,
    alternateName: 'TBS',
    description:
      "Fourniture de matériels et d'équipements, location de matériel de réception, études et conseils, agriculture et agro-industrie. Lomé, Togo.",
    url: cfg.siteUrl,
    logo: `${cfg.siteUrl}/images/logo-tbs.png`,
    image: `${cfg.siteUrl}/images/hero-reception.jpg`,
    telephone: cfg.phonePrimary,
    email: cfg.email,
    priceRange: '$$',
    address: {
      '@type': 'PostalAddress',
      streetAddress: 'Agôè - Démakpoè',
      addressLocality: 'Lomé',
      addressCountry: 'TG',
    },
    areaServed: [
      { '@type': 'City', name: 'Lomé' },
      { '@type': 'Country', name: 'Togo' },
    ],
    openingHoursSpecification: [
      {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: [
          'Monday',
          'Tuesday',
          'Wednesday',
          'Thursday',
          'Friday',
          'Saturday',
        ],
        opens: '08:00',
        closes: '19:00',
      },
    ],
    makesOffer: [
      'TBS Équipements — fourniture de matériels & équipements',
      'TBS Events — location de matériel de réception',
      'TBS Études & Conseils — études & prestations intellectuelles',
      'TBS Agro — agriculture & agro-industrie',
    ].map((name) => ({ '@type': 'Offer', itemOffered: { '@type': 'Service', name } })),
  }

  useHead({
    script: [
      { type: 'application/ld+json', innerHTML: JSON.stringify(schema), tagPriority: 'low' },
    ],
  })
}

/** JSON-LD FAQPage — résultats enrichis sur la page /faq. */
export function useFaqSchema(items: MaybeRefOrGetter<FaqItem[]>) {
  useHead({
    script: [
      {
        type: 'application/ld+json',
        innerHTML: computed(() =>
          JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'FAQPage',
            mainEntity: toValue(items).map((item) => ({
              '@type': 'Question',
              name: item.question,
              acceptedAnswer: { '@type': 'Answer', text: item.answer },
            })),
          }),
        ),
      },
    ],
  })
}

/** JSON-LD BreadcrumbList. */
export function useBreadcrumbSchema(trail: { name: string; path: string }[]) {
  const { public: cfg } = useRuntimeConfig()

  useHead({
    script: [
      {
        type: 'application/ld+json',
        innerHTML: JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'BreadcrumbList',
          itemListElement: [{ name: 'Accueil', path: '/' }, ...trail].map((item, i) => ({
            '@type': 'ListItem',
            position: i + 1,
            name: item.name,
            item: `${cfg.siteUrl}${item.path}`,
          })),
        }),
      },
    ],
  })
}
