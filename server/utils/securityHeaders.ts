/**
 * En-têtes de sécurité HTTP — source unique de vérité.
 *
 * Le plugin `server/plugins/security-headers.ts` applique ces valeurs à chaque
 * réponse. La politique vit ici, isolée de h3, pour rester lisible et
 * vérifiable sans démarrer le serveur.
 *
 * La CSP est en `Report-Only` par défaut : on relève les violations réelles
 * dans la console du navigateur, puis on bascule en mode bloquant avec
 * `NUXT_SECURITY_CSP_MODE=enforce` (voir README, section « Sécurité »).
 */

/**
 * Gestionnaire `onerror` que `<NuxtImg>` sérialise côté serveur pour repérer
 * les images cassées avant l'hydratation (`@nuxt/image`, NuxtImg.vue). C'est le
 * seul attribut de type gestionnaire d'événement du rendu : on l'autorise par
 * empreinte plutôt que d'ouvrir `script-src-attr` à `'unsafe-inline'`.
 * Régénérer avec `npm run security:csp-hashes` si @nuxt/image change la chaîne.
 */
const NUXT_IMG_ONERROR_HASH = '\'sha256-bwK6T5wZVTANitXbrTsel7kl/PyCjCd/Dq5Qoz3imjM=\''

/** Carte de la page contact — seule origine tierce encadrée par le site. */
const OPENSTREETMAP_ORIGIN = 'https://www.openstreetmap.org'

/**
 * Directives CSP. `'self'` partout : polices (`/_fonts`), images (`/_ipx`),
 * scripts et styles sont tous auto-hébergés, aucun CDN n'est sollicité.
 */
const CSP_DIRECTIVES = {
  'default-src': ['\'self\''],
  // Aucune balise <base> : interdire l'injection d'une base d'URL.
  'base-uri': ['\'none\''],
  'object-src': ['\'none\''],
  // Doublon volontaire de X-Frame-Options, pour les navigateurs modernes.
  'frame-ancestors': ['\'none\''],
  // Le formulaire de devis poste sur /api/quotes, jamais ailleurs.
  'form-action': ['\'self\''],
  'script-src': ['\'self\''],
  'script-src-attr': ['\'unsafe-hashes\'', NUXT_IMG_ONERROR_HASH],
  'style-src': ['\'self\''],
  // Le rendu SSR de Vue émet des attributs `style` (transitions, révélations).
  'style-src-attr': ['\'unsafe-inline\''],
  'img-src': ['\'self\'', 'data:'],
  'font-src': ['\'self\''],
  // Hydratation : récupération de `_payload.json` et appels /api.
  'connect-src': ['\'self\''],
  'frame-src': [OPENSTREETMAP_ORIGIN],
  'media-src': ['\'self\''],
  'worker-src': ['\'self\''],
  'manifest-src': ['\'self\''],
} satisfies Record<string, string[]>

export interface SecurityHeadersOptions {
  /** `true` en développement : HSTS, cadrage et CSP sont alors relâchés. */
  dev: boolean
  /** `enforce` rend la CSP bloquante ; toute autre valeur reste en report-only. */
  cspMode?: string
  /**
   * Empreintes `sha256-…` des scripts en ligne des pages pré-rendues, séparées
   * par une virgule. Indispensables avant de passer en `enforce`, sinon le
   * script `window.__NUXT__.config` est bloqué et l'hydratation échoue.
   */
  cspScriptHashes?: string
  /**
   * Origine du serveur de mesure d'audience, quand il y en a un. Sans elle, la
   * CSP bloquerait le script et sa balise — un ajout de mesure d'audience se
   * traduirait par une page muette et un diagnostic long.
   */
  analyticsOrigin?: string
}

/** Garde l'origine d'une URL de configuration, sans son chemin. */
function toOrigin(value: string | undefined): string | null {
  if (!value) return null
  try {
    return new URL(value).origin
  } catch {
    console.warn(`[securite] origine de mesure d'audience invalide : ${value}`)
    return null
  }
}

/** Normalise une liste d'empreintes saisie en variable d'environnement. */
function parseHashes(raw: string | undefined): string[] {
  return (raw ?? '')
    .split(',')
    .map(hash => hash.trim().replace(/^'|'$/g, ''))
    .filter(Boolean)
    .map(hash => `'${hash}'`)
}

/** `true` quand la politique doit bloquer plutôt que se contenter de signaler. */
function isEnforced(options: SecurityHeadersOptions): boolean {
  return !options.dev && options.cspMode === 'enforce'
}

/** Assemble la valeur d'un en-tête `Content-Security-Policy`. */
export function buildContentSecurityPolicy(options: SecurityHeadersOptions): string {
  // Les scripts en ligne de Nuxt sont autorisés par empreinte, jamais par
  // `'unsafe-inline'` : sans elles, la politique bloquante casse l'hydratation.
  const analytics = toOrigin(options.analyticsOrigin)

  const directives: Record<string, string[]> = {
    ...CSP_DIRECTIVES,
    'script-src': [
      ...CSP_DIRECTIVES['script-src'],
      ...parseHashes(options.cspScriptHashes),
      ...(analytics ? [analytics] : []),
    ],
    // Le script d'analyse poste ses événements sur sa propre origine.
    'connect-src': [...CSP_DIRECTIVES['connect-src'], ...(analytics ? [analytics] : [])],
  }

  const policy = Object.entries(directives).map(([name, values]) => `${name} ${values.join(' ')}`)

  // Les sous-ressources restent en HTTP si un lien absolu traîne : on force.
  // Le navigateur ignore cette directive dans une politique report-only et
  // journalise une erreur — on ne l'émet donc qu'en mode bloquant.
  if (isEnforced(options)) policy.push('upgrade-insecure-requests')

  return policy.join('; ')
}

/**
 * En-têtes à poser sur toutes les réponses, CSP exclue.
 *
 * En développement, `X-Frame-Options` et les politiques d'isolement sont
 * omises : elles casseraient l'iframe des Nuxt DevTools. HSTS n'a aucun sens
 * hors HTTPS et n'est donc envoyée qu'en production.
 */
export function buildSecurityHeaders(options: SecurityHeadersOptions): Record<string, string> {
  const headers: Record<string, string> = {
    'X-Content-Type-Options': 'nosniff',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Permissions-Policy':
      'camera=(), microphone=(), geolocation=(), payment=(), usb=(), midi=(), interest-cohort=(), browsing-topics=()',
    'X-DNS-Prefetch-Control': 'off',
    'Origin-Agent-Cluster': '?1',
  }

  if (options.dev) return headers

  return {
    ...headers,
    'X-Frame-Options': 'DENY',
    'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload',
    'Cross-Origin-Opener-Policy': 'same-origin',
    'Cross-Origin-Resource-Policy': 'same-origin',
  }
}

/** Nom de l'en-tête CSP selon le mode, ou `null` si la CSP est désactivée. */
export function contentSecurityPolicyHeaderName(
  options: SecurityHeadersOptions,
): 'Content-Security-Policy' | 'Content-Security-Policy-Report-Only' | null {
  // En dev, Vite injecte styles et modules à la volée : une CSP n'y apporte
  // rien et bloquerait le rechargement à chaud.
  if (options.dev) return null

  return isEnforced(options) ? 'Content-Security-Policy' : 'Content-Security-Policy-Report-Only'
}

/**
 * Ressources auto-générées ou statiques : elles héritent des en-têtes de base
 * mais pas de la CSP, qui ne s'applique qu'aux documents.
 */
const STATIC_ASSET_PATH = /^\/(?:_nuxt|_fonts|_ipx|images)\/|^\/(?:favicon\.ico|robots\.txt|sitemap[\w-]*\.xml)$/

/** `true` si la réponse mérite un en-tête CSP (documents et routes API). */
export function shouldSendContentSecurityPolicy(path: string): boolean {
  // `event.path` porte la chaîne de requête (`/_payload.json?_b=…`).
  return !STATIC_ASSET_PATH.test(path.split('?')[0] ?? path)
}
