/**
 * Événements de mesure d'audience.
 *
 * Six événements, choisis pour répondre à des questions commerciales
 * précises — pas pour remplir un tableau de bord. Le rapport
 * `devis_commence` → `devis_envoye` est le plus parlant : il dit si le
 * formulaire décourage, ce qu'aucune autre mesure ne révèle.
 *
 * Les noms sont figés ici pour que le code et l'outil d'analyse ne dérivent
 * pas l'un de l'autre.
 */
export const ANALYTICS_EVENTS = {
  /** Arrivée sur /contact. */
  devisOuvert: 'devis_ouvert',
  /** Premier champ du formulaire réellement rempli. */
  devisCommence: 'devis_commence',
  /** Demande envoyée et acceptée par le serveur. */
  devisEnvoye: 'devis_envoye',
  /** Clic sur un lien WhatsApp, où qu'il soit. */
  whatsappClic: 'whatsapp_clic',
  /** Clic sur un numéro de téléphone. */
  appelClic: 'appel_clic',
  /** Ouverture d'une branche depuis une carte ou le menu. */
  brancheConsultee: 'branche_consultee',
} as const

export type AnalyticsEvent = (typeof ANALYTICS_EVENTS)[keyof typeof ANALYTICS_EVENTS]

/** Prestataires acceptés. Tous deux fonctionnent sans cookie ni bandeau. */
export type AnalyticsProvider = 'plausible' | 'umami'

export interface AnalyticsConfig {
  /** `plausible`, `umami`, ou vide : la mesure est alors désactivée. */
  provider?: string
  /** Origine du serveur d'analyse — `https://plausible.io` ou une instance à soi. */
  host?: string
  /** Domaine déclaré (Plausible) ou identifiant de site (Umami). */
  siteId?: string
}

const PROVIDERS = new Set<string>(['plausible', 'umami'] satisfies AnalyticsProvider[])

/** `true` si la mesure d'audience est complètement configurée. */
export function isAnalyticsEnabled(
  config: AnalyticsConfig | undefined,
): config is Required<AnalyticsConfig> {
  return Boolean(
    config?.provider && PROVIDERS.has(config.provider) && config.host && config.siteId,
  )
}

/** URL du script à charger, selon le prestataire. */
export function analyticsScriptUrl(config: Required<AnalyticsConfig>): string {
  const host = config.host.replace(/\/$/, '')
  return config.provider === 'umami' ? `${host}/script.js` : `${host}/js/script.js`
}
