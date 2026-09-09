/**
 * Plugin Nitro — en-têtes de sécurité sur toutes les réponses.
 *
 * Pourquoi un plugin et non un middleware `server/middleware/` : Nitro
 * enregistre le gestionnaire d'assets publics comme premier middleware. Les
 * pages pré-rendues (`/`, `/contact`…) et les fichiers de `public/` sont donc
 * servis avant qu'un middleware applicatif ne s'exécute, et n'auraient reçu
 * aucun en-tête. Le hook `request` du plugin, lui, court en amont de toute la
 * pile : documents pré-rendus, assets et routes `/api` sont couverts.
 *
 * Attention : ce plugin ne couvre que ce qui traverse Nitro. Une page
 * pré-rendue servie directement par un CDN — le cas de Vercel, et celui de
 * `npm run generate` — n'y passe jamais. Ces réponses-là sont couvertes par
 * `routeRules` dans `nuxt.config.ts`, qui écrit les mêmes en-têtes dans la
 * sortie du build. Les deux mécanismes lisent la même politique, ici et dans
 * `utils/securityHeaders.ts` : une seule vérité, deux points d'application.
 */
import {
  buildContentSecurityPolicy,
  buildSecurityHeaders,
  contentSecurityPolicyHeaderName,
  shouldSendContentSecurityPolicy,
} from '../utils/securityHeaders'

export default defineNitroPlugin((nitroApp) => {
  const config = useRuntimeConfig()
  const { security } = config

  const options = {
    dev: import.meta.dev,
    cspMode: security.cspMode,
    cspScriptHashes: security.cspScriptHashes,
    analyticsOrigin: config.public.analytics?.host,
  }

  // La politique ne dépend que de la configuration : on l'assemble une fois.
  const headers = buildSecurityHeaders(options)
  const cspHeader = contentSecurityPolicyHeaderName(options)
  const csp = cspHeader ? buildContentSecurityPolicy(options) : ''

  nitroApp.hooks.hook('request', (event) => {
    setResponseHeaders(event, headers)

    if (cspHeader && shouldSendContentSecurityPolicy(event.path)) {
      setResponseHeader(event, cspHeader, csp)
    }
  })
})
