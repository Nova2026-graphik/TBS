/**
 * Rubrique Conseils, dans les deux langues.
 *
 * Les articles vivent dans deux collections `@nuxt/content` — `conseils` pour
 * le français, `conseilsEn` pour l'anglais — appariées par nom de fichier.
 * Ce qui dépend de la langue est rassemblé ici plutôt que recopié dans le
 * sommaire et dans la page d'article : la collection interrogée, le préfixe
 * des chemins, le libellé des thèmes et le format des dates.
 *
 * Le `category` d'un article reste écrit en français dans les deux langues.
 * C'est une **clé de données**, pas un texte : elle sert au filtrage, et sa
 * traduction se fait ici, au rendu. Deux énumérations à tenir en
 * correspondance auraient fini par diverger, et le filtre avec elles.
 */

/** Thèmes de la rubrique, dans l'ordre d'affichage. */
export const THEMES_CONSEILS = [
  { slug: 'reception', category: 'Réception' },
  { slug: 'equipements', category: 'Équipements' },
  { slug: 'appels-d-offres', category: 'Appels d’offres' },
  { slug: 'agro', category: 'Agro' },
] as const

export type ThemeConseil = (typeof THEMES_CONSEILS)[number]

/** Langues de rédaction, pour `Intl` et pour `inLanguage` du JSON-LD. */
const ETIQUETTES_LANGUE: Record<string, string> = { fr: 'fr-FR', en: 'en-GB' }

export function useConseils() {
  const { locale, t } = useI18n()

  const anglais = computed(() => locale.value === 'en')

  /** Collection à interroger. */
  const collection = computed(() => (anglais.value ? 'conseilsEn' as const : 'conseils' as const))

  /** Préfixe des chemins stockés — il porte déjà le préfixe de langue. */
  const basePath = computed(() => (anglais.value ? '/en/conseils' : '/conseils'))

  /** Étiquette BCP 47, pour `Intl` et pour `inLanguage`. */
  const langue = computed(() => ETIQUETTES_LANGUE[locale.value] ?? 'fr-FR')

  /** Libellé affichable d'un thème, à partir de sa clé de données. */
  function libelleTheme(category: string): string {
    const theme = THEMES_CONSEILS.find(t => t.category === category)
    return theme ? t(`advice.themes.${theme.slug}`) : category
  }

  /** Date en toutes lettres, dans la langue de la page. */
  function dateLisible(valeur: string): string {
    return new Date(valeur).toLocaleDateString(langue.value, {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  return { anglais, collection, basePath, langue, libelleTheme, dateLisible }
}
