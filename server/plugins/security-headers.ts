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
 * Attention : en génération entièrement statique (`npm run generate`), aucun
 * serveur Nitro ne tourne. Les en-têtes doivent alors être posés par
 * l'hébergeur (Netlify `_headers`, Nginx, Cloudflare) — cf. README.
 */
import {
  buildContentSecurityPolicy,
  buildSecurityHeaders,
  contentSecurityPolicyHeaderName,
  shouldSendContentSecurityPolicy,
} from '../utils/securityHeaders'

export default defineNitroPlugin((nitroApp) => {
  const { security } = useRuntimeConfig()

  const options = {
    dev: import.meta.dev,
    cspMode: security.cspMode,
    cspScriptHashes: security.cspScriptHashes,
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
