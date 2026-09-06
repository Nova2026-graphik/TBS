/**
 * Métadonnées SEO + données structurées.
 *
 * `usePageSeo` pose titre, description, Open Graph et Twitter Card pour une
 * page ; `useOrganizationSchema` et `useFaqSchema` injectent le JSON-LD que
 * Google exploite pour le knowledge panel et les résultats enrichis.
 */
import type { FaqItem } from '#shared/types'

/**
 * Format imposé aux images sociales : 1200 × 630, le rapport 1,91:1 qu'attendent
 * Facebook, LinkedIn et WhatsApp. Les dimensions sont déclarées dans les
 * métadonnées pour que l'aperçu s'affiche dès le premier partage, sans que la
 * plate-forme ait à télécharger l'image pour les deviner — c'est ce qui
 * produisait un lien nu au premier envoi.
 *
 * Toutes les cartes de `public/og-*.jpg` sont donc fabriquées à ce format par
 * `scripts/generate-icons.mjs`. Une image d'un autre gabarit ferait mentir ces
 * deux nombres : passer par le script, pas par un chemin quelconque.
 */
const OG_IMAGE_WIDTH = 1200
const OG_IMAGE_HEIGHT = 630

interface PageSeoOptions {
  title: string
  description: string
  /** Carte sociale de la page — un fichier 1200 × 630 de `public/`. */
  image?: string
  /** Chemin de la page, pour l'URL canonique. */
  path?: string
}

export function usePageSeo(options: PageSeoOptions) {
  const { public: cfg } = useRuntimeConfig()
  const route = useRoute()

  const url = `${cfg.siteUrl}${options.path ?? route.path}`
  const image = `${cfg.siteUrl}${options.image ?? '/og-image.jpg'}`

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
    ogImageWidth: OG_IMAGE_WIDTH,
    ogImageHeight: OG_IMAGE_HEIGHT,
    ogImageType: 'image/jpeg',
    ogSiteName: cfg.siteName,
    ogLocale: 'fr_TG',
    twitterCard: 'summary_large_image',
    twitterTitle: options.title,
    twitterDescription: options.description,
    twitterImage: image,
    twitterImageAlt: options.title,
  })
}

/** JSON-LD LocalBusiness — à poser une seule fois, dans le layout. */
export function useOrganizationSchema() {
  const { public: cfg } = useRuntimeConfig()

  const coords = parseCoordinates(cfg.geoLatitude, cfg.geoLongitude)

  /**
   * Comptes et fiches à rattacher à l'établissement. `sameAs` est ce qui
   * permet à un moteur de recouper le site, la fiche Google et les réseaux :
   * c'est le lien entre l'entité et ses représentations ailleurs. Les entrées
   * non renseignées sont écartées plutôt que publiées vides.
   */
  const sameAs = [
    cfg.googleBusinessUrl,
    ...SOCIAL_ACCOUNTS.map(compte => compte.url),
  ].filter((url): url is string => Boolean(url))

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
    // Les deux lignes de l'entreprise : schema.org accepte la répétition, et
    // un appel manqué sur la première ne doit pas coûter la demande.
    telephone: [cfg.phonePrimary, cfg.phoneSecondary].filter(Boolean),
    email: cfg.email,
    priceRange: '$$',
    address: {
      '@type': 'PostalAddress',
      streetAddress: 'Agôè - Démakpoè',
      addressLocality: 'Lomé',
      addressCountry: 'TG',
    },
    // Position et fiche : publiées seulement si elles sont connues.
    ...(coords
      ? {
          geo: {
            '@type': 'GeoCoordinates',
            latitude: coords.latitude,
            longitude: coords.longitude,
          },
        }
      : {}),
    ...(cfg.googleBusinessUrl ? { hasMap: cfg.googleBusinessUrl } : {}),
    ...(sameAs.length ? { sameAs } : {}),
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
