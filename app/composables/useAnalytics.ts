/**
 * Mesure d'audience — interface unique, quel que soit le prestataire.
 *
 * Sans configuration, `track` ne fait rien : aucun script n'est chargé, aucune
 * requête ne part. Les appels restent en place dans le code, ils sont
 * simplement muets — pas de `if` à semer dans les composants.
 */
import type { AnalyticsEvent } from '#shared/utils/analytics'
import { isAnalyticsEnabled } from '#shared/utils/analytics'

declare global {
  interface Window {
    plausible?: (event: string, options?: { props?: Record<string, string> }) => void
    umami?: { track: (event: string, data?: Record<string, string>) => void }
  }
}

export function useAnalytics() {
  const { public: cfg } = useRuntimeConfig()
  const enabled = isAnalyticsEnabled(cfg.analytics)

  /**
   * Envoie un événement. Sans effet côté serveur et sans prestataire
   * configuré ; ne lève jamais — une mesure ratée ne casse pas une page.
   */
  function track(event: AnalyticsEvent, props?: Record<string, string>) {
    if (!enabled || import.meta.server) return

    try {
      if (cfg.analytics.provider === 'umami') window.umami?.track(event, props)
      else window.plausible?.(event, props ? { props } : undefined)
    }
    catch {
      // Un bloqueur de publicité peut avoir retiré la fonction en cours de route.
    }
  }

  return { enabled, track }
}
