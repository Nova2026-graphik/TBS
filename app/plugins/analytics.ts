/**
 * Chargement du script de mesure d'audience, et capture des trois clics
 * sortants qui comptent.
 *
 * La délégation d'événements évite de semer des `@click` dans six composants :
 * un seul écouteur sur le document couvre les liens existants et ceux à venir,
 * y compris ceux rendus après coup.
 *
 * Le plugin est universel, non `.client` : la balise doit figurer dans le HTML
 * rendu côté serveur. Injectée seulement après hydratation, elle manquerait
 * les visites les plus courtes — précisément celles qu'on cherche à compter.
 *
 * Rien n'est chargé ni écouté sans prestataire configuré.
 */
import { ANALYTICS_EVENTS, analyticsScriptUrl, isAnalyticsEnabled } from '#shared/utils/analytics'

export default defineNuxtPlugin(() => {
  const { public: cfg } = useRuntimeConfig()
  if (!isAnalyticsEnabled(cfg.analytics)) return

  useHead({
    script: [
      cfg.analytics.provider === 'umami'
        ? {
            src: analyticsScriptUrl(cfg.analytics),
            defer: true,
            'data-website-id': cfg.analytics.siteId,
          }
        : {
            src: analyticsScriptUrl(cfg.analytics),
            defer: true,
            'data-domain': cfg.analytics.siteId,
          },
    ],
  })

  // La délégation n'a de sens que dans un navigateur.
  if (import.meta.server) return

  const { track } = useAnalytics()

  document.addEventListener(
    'click',
    (event) => {
      const link = (event.target as HTMLElement | null)?.closest('a')
      const href = link?.getAttribute('href')
      if (!href) return

      if (href.startsWith('tel:')) track(ANALYTICS_EVENTS.appelClic)
      else if (href.includes('wa.me')) track(ANALYTICS_EVENTS.whatsappClic)
      else {
        // `/services?branche=events` — la branche qui intéresse vraiment.
        const branch = href.match(/[?&]branche=([\w-]+)/)?.[1]
        if (branch) track(ANALYTICS_EVENTS.brancheConsultee, { branche: branch })
      }
    },
    // En capture : un composant qui arrête la propagation ne masque pas la mesure.
    { capture: true, passive: true },
  )
})
