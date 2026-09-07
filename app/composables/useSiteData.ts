import type { Inspiration, Offer, ProcessStep, StatItem } from '#shared/types'
import type { ProcessBlock } from '#shared/utils/siteData'

/**
 * Contenu de présentation, dans la langue affichée.
 *
 * `shared/utils/siteData.ts` garde la **structure** — ordre, images, couleurs,
 * slugs, valeurs chiffrées — et les fichiers de langue portent le **texte**.
 * La séparation évite le piège classique du site bilingue : deux copies
 * complètes qui divergent, l'une recevant une correction que l'autre ignore.
 *
 * Les valeurs chiffrées passent quand même par la traduction, parce qu'elles
 * ne s'écrivent pas partout pareil : « 7j / 7 » n'a pas de sens en anglais, et
 * un séparateur de milliers change de forme d'une langue à l'autre.
 */
export function useSiteData() {
  const { t, tm, rt } = useI18n()

  /** Lit un tableau de messages sans perdre le typage à chaque appel. */
  const liste = (cle: string) => tm(cle) as unknown[]
  const texte = (valeur: unknown) => rt(valeur as string)

  const process = computed<Record<string, ProcessBlock>>(() =>
    Object.fromEntries(
      Object.entries(PROCESS_BY_BRANCH).map(([slug, bloc]) => {
        const etapes = liste(`data.process.${slug}.steps`)
        return [slug, {
          ...bloc,
          eyebrow: t(`data.process.${slug}.eyebrow`),
          title: t(`data.process.${slug}.title`),
          titleAccent: t(`data.process.${slug}.titleAccent`),
          steps: bloc.steps.map((etape, i): ProcessStep => {
            const traduite = etapes[i] as unknown[] | undefined
            return {
              ...etape,
              title: traduite ? texte(traduite[0]) : etape.title,
              description: traduite ? texte(traduite[1]) : etape.description,
            }
          }),
          ...(bloc.footnote ? { footnote: t(`data.process.${slug}.footnote`) } : {}),
        }]
      }),
    ),
  )

  const offers = computed<Offer[]>(() =>
    EVENT_OFFERS.map((offre, i) => {
      const traduite = liste('data.offers')[i] as unknown[] | undefined
      if (!traduite) return offre
      return {
        ...offre,
        label: texte(traduite[0]),
        title: texte(traduite[1]),
        description: texte(traduite[2]),
        note: texte(traduite[3]),
      }
    }),
  )

  const inspirations = computed<Inspiration[]>(() =>
    INSPIRATIONS.map((item, i) => {
      const traduite = liste('data.inspirations')[i] as unknown[] | undefined
      if (!traduite) return item
      return {
        ...item,
        title: texte(traduite[0]),
        description: texte(traduite[1]),
        imageAlt: texte(traduite[2]),
      }
    }),
  )

  const homeStats = computed<StatItem[]>(() =>
    HOME_STATS.map((stat, i) => {
      const traduite = liste('data.homeStats')[i] as unknown[] | undefined
      const valeurs = liste('data.homeStatsValues')
      return {
        ...stat,
        value: valeurs[i] ? texte(valeurs[i]) : stat.value,
        label: traduite ? texte(traduite[0]) : stat.label,
        hint: traduite ? texte(traduite[1]) : stat.hint,
      }
    }),
  )

  const aboutStats = computed<StatItem[]>(() =>
    ABOUT_STATS.map((stat, i) => {
      const traduit = liste('data.aboutStats')[i]
      return { ...stat, label: traduit ? texte(traduit) : stat.label }
    }),
  )

  const branchTabs = computed(() =>
    BRANCH_TABS.map(tab => ({ ...tab, label: t(`data.branchTabs.${tab.slug}`) })),
  )

  return { process, offers, inspirations, homeStats, aboutStats, branchTabs }
}
