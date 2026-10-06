/**
 * Métadonnées SEO + données structurées.
 *
 * `usePageSeo` pose titre, description, Open Graph et Twitter Card pour une
 * page ; `useOrganizationSchema` et `useFaqSchema` injectent le JSON-LD que
 * Google exploite pour le knowledge panel et les résultats enrichis.
 */
import type { FaqItem } from '#shared/types'
import { serialiserJsonLd } from '#shared/utils/jsonLd'

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
  const { locale, locales } = useI18n()
  const localePath = useLocalePath()

  /**
   * L'URL canonique porte le préfixe de langue : sans lui, la version anglaise
   * se déclarerait canonique de la page française et les deux entreraient en
   * concurrence dans l'index.
   */
  const url = `${cfg.siteUrl}${localePath(options.path ?? route.path)}`
  const image = `${cfg.siteUrl}${options.image ?? '/og-image.jpg'}`

  const langue = computed(() => {
    const trouve = (locales.value as { code: string, language?: string }[])
      .find(l => l.code === locale.value)
    return (trouve?.language ?? 'fr-TG').replace('-', '_')
  })

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
    ogLocale: langue,
    twitterCard: 'summary_large_image',
    twitterTitle: options.title,
    twitterDescription: options.description,
    twitterImage: image,
    twitterImageAlt: options.title,
  })
}

/** JSON-LD LocalBusiness — à poser une seule fois, dans le layout. */
/** Noms sous lesquels l'entreprise est cherchée — cf. `alternateName`. */
const NOMS_ALTERNATIFS = ['TBS Togo', 'TBS Distribution', 'TBS Distribution Togo', 'TBS'] as const

export function useOrganizationSchema() {
  const { public: cfg } = useRuntimeConfig()
  const { tm, rt } = useI18n()

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
    'name': cfg.siteName,
    /**
     * Les noms sous lesquels on cherche l'entreprise. « TBS » seul est disputé
     * — chaînes de télévision américaine et japonaise —, si bien que c'est
     * « TBS Togo » ou « TBS Distribution » qui ramènent le site : les déclarer
     * aide le moteur à rattacher ces requêtes à cette entité-ci.
     */
    'alternateName': [...NOMS_ALTERNATIFS],
    'description':
      'Fourniture de matériels et d\'équipements, location de matériel de réception, études et conseils, agriculture et agro-industrie. Lomé, Togo.',
    'url': cfg.siteUrl,
    'logo': `${cfg.siteUrl}/images/logo-tbs.png`,
    'image': `${cfg.siteUrl}/images/hero-reception.jpg`,
    // Les deux lignes de l'entreprise : schema.org accepte la répétition, et
    // un appel manqué sur la première ne doit pas coûter la demande.
    'telephone': [cfg.phonePrimary, cfg.phoneSecondary].filter(Boolean),
    'email': cfg.email,
    'priceRange': '$$',
    'address': {
      '@type': 'PostalAddress',
      'streetAddress': 'Agôè - Démakpoè',
      'addressLocality': 'Lomé',
      'addressCountry': 'TG',
    },
    // Position et fiche : publiées seulement si elles sont connues.
    ...(coords
      ? {
          geo: {
            '@type': 'GeoCoordinates',
            'latitude': coords.latitude,
            'longitude': coords.longitude,
          },
        }
      : {}),
    ...(cfg.googleBusinessUrl ? { hasMap: cfg.googleBusinessUrl } : {}),
    ...(sameAs.length ? { sameAs } : {}),
    'areaServed': [
      { '@type': 'City', 'name': 'Lomé' },
      { '@type': 'Country', 'name': 'Togo' },
    ],
    'openingHoursSpecification': [
      {
        '@type': 'OpeningHoursSpecification',
        'dayOfWeek': [
          'Monday',
          'Tuesday',
          'Wednesday',
          'Thursday',
          'Friday',
          'Saturday',
        ],
        'opens': '08:00',
        'closes': '19:00',
      },
    ],
    /**
     * Les quatre branches, dans la langue de la page. Elles reprennent les
     * intitulés du formulaire de devis — mêmes mots des deux côtés, sans
     * seconde liste à tenir à jour. La dernière entrée, « Plusieurs
     * branches », n'est pas une offre.
     */
    'makesOffer': (tm('form.branches') as unknown[])
      .slice(0, 4)
      .map(entree => rt(entree as string))
      .map(name => ({ '@type': 'Offer', 'itemOffered': { '@type': 'Service', name } })),
  }

  /**
   * Le site lui-même. C'est là que Google lit le **nom de site** qu'il affiche
   * au-dessus de chaque résultat ; sans lui, il le devine à partir du titre ou
   * du domaine, et « tbstogo.com » n'est pas un nom d'entreprise.
   */
  const site = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': `${cfg.siteUrl}/#website`,
    'name': 'TBS Distribution',
    'alternateName': [...NOMS_ALTERNATIFS],
    'url': `${cfg.siteUrl}/`,
    'inLanguage': ['fr-TG', 'en'],
    'publisher': { '@id': `${cfg.siteUrl}/#organization` },
  }

  useHead({
    script: [
      { type: 'application/ld+json', innerHTML: serialiserJsonLd(schema), tagPriority: 'low' },
      { type: 'application/ld+json', innerHTML: serialiserJsonLd(site), tagPriority: 'low' },
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
          serialiserJsonLd({
            '@context': 'https://schema.org',
            '@type': 'FAQPage',
            'mainEntity': toValue(items).map(item => ({
              '@type': 'Question',
              'name': item.question,
              'acceptedAnswer': { '@type': 'Answer', 'text': item.answer },
            })),
          }),
        ),
      },
    ],
  })
}

/**
 * JSON-LD BreadcrumbList.
 *
 * Les chemins reçus ne portent **pas** le préfixe de langue — les appelants
 * donnent `/conseils`, pas `/en/conseils`. `localePath` l'ajoute : sans lui,
 * le fil d'Ariane d'une page anglaise désignait les URL françaises, et
 * annonçait donc à un moteur un chemin de navigation qui n'existe pas dans
 * cette langue.
 */
export function useBreadcrumbSchema(trail: { name: string, path: string }[]) {
  const { public: cfg } = useRuntimeConfig()
  const { t } = useI18n()
  const localePath = useLocalePath()

  useHead({
    script: [
      {
        type: 'application/ld+json',
        innerHTML: serialiserJsonLd({
          '@context': 'https://schema.org',
          '@type': 'BreadcrumbList',
          'itemListElement': [{ name: t('nav.home'), path: '/' }, ...trail].map((item, i) => ({
            '@type': 'ListItem',
            'position': i + 1,
            'name': item.name,
            'item': `${cfg.siteUrl}${localePath(item.path)}`,
          })),
        }),
      },
    ],
  })
}
