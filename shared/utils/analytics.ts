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

/**
 * Prestataires acceptés. Les trois fonctionnent sans cookie ni bandeau.
 *
 * `vercel` — Vercel Web Analytics, chez l'hébergeur du site. Le script et la
 * collecte sont servis sous le domaine du site lui-même (`/_vercel/insights`) :
 * ni hôte ni identifiant à fournir, rien à ouvrir dans la CSP, et aucun
 * sous-traitant de plus que l'hébergeur. Les pages vues se lisent dans
 * l'onglet « Analytics » du projet Vercel ; les événements personnalisés
 * (`track`) n'y sont enregistrés qu'à partir de l'offre Pro.
 */
export type AnalyticsProvider = 'plausible' | 'umami' | 'vercel'

export interface AnalyticsConfig {
  /** `plausible`, `umami`, `vercel`, ou vide : la mesure est alors désactivée. */
  provider?: string
  /**
   * Origine du serveur d'analyse — `https://plausible.io` ou une instance à
   * soi. Inutile pour `vercel`.
   */
  host?: string
  /** Domaine déclaré (Plausible) ou identifiant de site (Umami). Inutile pour `vercel`. */
  siteId?: string
}

const PROVIDERS = new Set<string>(['plausible', 'umami', 'vercel'] satisfies AnalyticsProvider[])

/** Script de Vercel Web Analytics, servi par la plateforme sous le domaine du site. */
export const VERCEL_ANALYTICS_SCRIPT = '/_vercel/insights/script.js'

/**
 * Script de Vercel Speed Insights : la vitesse d'affichage réellement vécue
 * par les visiteurs (LCP, CLS, INP…), page par page, dans l'onglet « Speed
 * Insights » du projet. Chargé avec Web Analytics, sous le même domaine, sans
 * cookie ni donnée personnelle.
 */
export const VERCEL_SPEED_INSIGHTS_SCRIPT = '/_vercel/speed-insights/script.js'

/** `true` si la mesure d'audience est complètement configurée. */
export function isAnalyticsEnabled(
  config: AnalyticsConfig | undefined,
): config is Required<AnalyticsConfig> {
  if (!config?.provider || !PROVIDERS.has(config.provider)) return false
  // Vercel sert script et collecte sous le domaine du site : rien d'autre à fournir.
  if (config.provider === 'vercel') return true
  return Boolean(config.host && config.siteId)
}

/** URL du script à charger, selon le prestataire. */
export function analyticsScriptUrl(config: Required<AnalyticsConfig>): string {
  if (config.provider === 'vercel') return VERCEL_ANALYTICS_SCRIPT
  const host = config.host.replace(/\/$/, '')
  return config.provider === 'umami' ? `${host}/script.js` : `${host}/js/script.js`
}

/** Nom du prestataire tel que l'annonce la politique de confidentialité. */
export function analyticsProviderName(provider: string): string {
  if (provider === 'vercel') return 'Vercel Web Analytics'
  return provider === 'umami' ? 'Umami' : 'Plausible'
}

/**
 * Où vont les mesures, pour la politique de confidentialité : l'hôte
 * configuré, ou l'hébergeur lui-même pour Vercel.
 */
export function analyticsDestination(config: Required<AnalyticsConfig>): string {
  return config.provider === 'vercel' ? 'vercel.com' : config.host
}
