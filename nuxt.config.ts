import tailwindcss from '@tailwindcss/vite'
import {
  buildContentSecurityPolicy,
  buildSecurityHeaders,
  contentSecurityPolicyHeaderName,
} from './server/utils/securityHeaders'

/**
 * En-têtes de sécurité des réponses **statiques**.
 *
 * `server/plugins/security-headers.ts` les pose sur chaque réponse qui
 * traverse Nitro. Sur Vercel, les pages pré-rendues n'en traversent aucune :
 * elles sont écrites au build et servies par le CDN. Résultat mesuré en
 * production le 8 septembre 2026 — `/api/health` portait les cinq en-têtes,
 * `/` n'en portait aucun. Toute la surface qu'un navigateur interprète comme
 * du HTML était sans protection ; la seule surface protégée rendait du JSON.
 *
 * `routeRules` est la réponse : le préréglage Vercel les inscrit dans
 * `.vercel/output/config.json`, qui s'applique aux fichiers statiques. Le
 * dépôt en avait déjà la preuve — le `cache-control` des images passe par là
 * et arrive bien.
 *
 * Les valeurs sont calculées à la construction, donc lues dans
 * `process.env` : `routeRules` est figé dans la sortie du build, il ne peut
 * pas dépendre de `runtimeConfig`. Pour des pages elles-mêmes figées au build,
 * ce n'est pas une concession.
 */
function buildEnTetesStatiques(): Record<string, string> {
  // `nuxt dev` n'écrit pas de sortie statique, et X-Frame-Options casserait
  // l'iframe des DevTools : on ne pose rien hors production.
  if (process.env.NODE_ENV !== 'production') return {}

  const options = {
    dev: false,
    cspMode: process.env.NUXT_SECURITY_CSP_MODE ?? 'report-only',
    cspScriptHashes: process.env.NUXT_SECURITY_CSP_SCRIPT_HASHES ?? '',
    analyticsOrigin: process.env.NUXT_PUBLIC_ANALYTICS_HOST ?? '',
  }

  return buildSecurityHeaders(options)
}

/** La CSP seule, à réserver aux documents — cf. `shouldSendContentSecurityPolicy`. */
function buildCspStatique(): Record<string, string> {
  if (process.env.NODE_ENV !== 'production') return {}

  const options = {
    dev: false,
    cspMode: process.env.NUXT_SECURITY_CSP_MODE ?? 'report-only',
    cspScriptHashes: process.env.NUXT_SECURITY_CSP_SCRIPT_HASHES ?? '',
    analyticsOrigin: process.env.NUXT_PUBLIC_ANALYTICS_HOST ?? '',
  }

  const nom = contentSecurityPolicyHeaderName(options)
  return nom ? { [nom]: buildContentSecurityPolicy(options) } : {}
}

const enTetesStatiques = buildEnTetesStatiques()
const enTetesDocuments = { ...enTetesStatiques, ...buildCspStatique() }

export default defineNuxtConfig({

  modules: [
    '@nuxt/image',
    '@nuxt/fonts',
    '@nuxt/content',
    '@nuxt/eslint',
    '@nuxtjs/i18n',
    '@vueuse/nuxt',
    '@nuxtjs/sitemap',
    '@nuxtjs/robots',
  ],
  devtools: { enabled: true },

  app: {
    head: {
      htmlAttrs: { lang: 'fr' },
      titleTemplate: '%s · TBS Distribution',
      /**
       * Jeu d'icônes complet — fabriqué depuis le logo par
       * `node scripts/generate-icons.mjs`, et versionné dans `public/`.
       * L'ICO couvre 16, 32 et 48 px pour les onglets et les favoris ; le PNG
       * de 96 px sert les écrans à forte densité ; le SVG est préféré par les
       * navigateurs modernes, qui l'affichent net à toute taille ; `mask-icon`
       * est l'icône épinglée de Safari, monochrome par contrat ;
       * `apple-touch-icon` évite
       * qu'iOS ne mette une capture de la page sur l'écran d'accueil ; le
       * manifeste rend l'installation possible sous Android.
       */
      link: [
        { rel: 'icon', href: '/favicon.ico', sizes: '32x32' },
        { rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' },
        { rel: 'icon', type: 'image/png', href: '/favicon-96.png', sizes: '96x96' },
        { rel: 'apple-touch-icon', href: '/apple-touch-icon.png', sizes: '180x180' },
        { rel: 'mask-icon', href: '/mask-icon.svg', color: '#2E78C0' },
        { rel: 'manifest', href: '/site.webmanifest' },
        { rel: 'canonical', href: 'https://www.tbs-distribution.tg' },
      ],
      meta: [
        { name: 'theme-color', content: '#3e3524' },
        { name: 'apple-mobile-web-app-title', content: 'TBS' },
        { name: 'format-detection', content: 'telephone=no' },
      ],
    },
    pageTransition: { name: 'page', mode: 'out-in' },
  },

  css: ['~/assets/css/main.css'],

  site: {
    url: 'https://www.tbs-distribution.tg',
    name: 'TBS Distribution S.A.R.L',
  },

  /**
   * Public values are inlined in the client bundle. Everything secret
   * (DATABASE_URL, SMTP…) stays in the private half and is read only from
   * Nitro server routes.
   */
  runtimeConfig: {
    databaseUrl: '',
    notifyEmail: '',
    /**
     * Envoi des notifications de devis — cf. `server/utils/mailer.ts`.
     * `provider` : `resend` ou `brevo`. Sans `apiKey`, l'envoi est simplement
     * désactivé : la demande reste enregistrée et journalisée.
     * Le domaine de `from` doit être vérifié chez le prestataire.
     */
    mail: {
      provider: 'resend',
      apiKey: '',
      from: 'TBS Distribution <devis@tbs-distribution.tg>',
    },
    quoteRateLimitPerHour: '10',
    /**
     * Espace de suivi des devis — cf. `server/utils/adminSession.ts`.
     * Vide : `/admin` et `/api/admin/*` répondent 404. Un déploiement qui
     * oublie la variable n'ouvre pas un accès libre aux demandes.
     */
    admin: {
      password: '',
    },
    /**
     * En-têtes de sécurité — cf. `server/utils/securityHeaders.ts`.
     * `cspMode` : `report-only` (défaut) ou `enforce`.
     * `cspScriptHashes` : empreintes des scripts en ligne des pages
     * pré-rendues, à relever avec `npm run security:csp-hashes` avant de
     * passer en `enforce`.
     */
    security: {
      cspMode: 'report-only',
      cspScriptHashes: '',
      /**
       * Ce qui se trouve devant l'application, et donc quel en-tête peut être
       * cru pour identifier le client — cf. `server/utils/clientIp.ts`.
       * `direct` (défaut) : aucun en-tête n'est lu, seule l'adresse de la
       * connexion fait foi. Sinon `cloudflare`, `vercel`, `netlify`, ou
       * `x-forwarded-for` avec le nombre de proxys de confiance.
       *
       * Sur Vercel, `direct` ne verrait que l'adresse du proxy : les dix
       * demandes de devis par heure et par IP deviendraient dix pour la
       * planète entière, sans que rien ne le signale. La plate-forme se
       * détecte à la construction, le défaut suit — `NUXT_SECURITY_TRUSTED_PROXY`
       * reste prioritaire pour tout autre hébergement.
       */
      trustedProxy: process.env.VERCEL ? 'vercel' : 'direct',
      trustedProxyHops: '1',
    },
    public: {
      siteUrl: 'https://www.tbs-distribution.tg',
      siteName: 'TBS Distribution S.A.R.L',
      phonePrimary: '+22890108510',
      phoneSecondary: '+22897800880',
      whatsapp: '22890108510',
      email: 'tbstogo228@gmail.com',
      address: 'Agôè - Démakpoè, Lomé, Togo',
      /**
       * Mesure d'audience — cf. `shared/utils/analytics.ts`.
       * `provider` : `plausible` ou `umami`, tous deux sans cookie, donc sans
       * bandeau de consentement. Vide : rien n'est chargé, aucune requête ne
       * part, et la politique de confidentialité l'annonce en conséquence.
       * `host` alimente aussi la CSP.
       */
      analytics: {
        provider: '',
        host: '',
        siteId: '',
      },
      /**
       * Coordonnées de l'entrepôt, à relever sur place — cf.
       * `app/utils/businessLocation.ts`. Laissées vides tant que le relevé
       * n'a pas eu lieu : le JSON-LD n'annonce alors aucune position, et la
       * carte de `/contact` reste sur son cadrage de quartier. Une latitude
       * approximative publiée comme un fait vaut moins que rien.
       */
      geoLatitude: '',
      geoLongitude: '',
      /** Fiche d'établissement Google, une fois créée et validée. */
      googleBusinessUrl: '',
    },
  },

  /**
   * Cache des images. Les URL `/_ipx/` portent format, qualité et dimensions
   * dans leur chemin : elles sont adressées par leur contenu, donc immuables
   * par construction — exactement comme les fichiers hachés de `/_nuxt/`.
   * Les originaux de `/images/` gardent un nom fixe : un an serait un piège,
   * trente jours laissent une purge possible.
   */
  routeRules: {
    /**
     * En-têtes de sécurité — cf. `buildEnTetesStatiques()` en tête de fichier.
     *
     * Chaque règle porte les siens, sans compter sur `/**` pour compléter :
     * dans la table de routage produite pour Vercel, une règle d'asset qui
     * correspond **arrête** le routage, et `/(.*)` n'est jamais atteint. Le
     * vérifier vaut mieux que le supposer — `.vercel/output/config.json` le
     * montre en clair.
     *
     * La CSP ne va qu'aux documents : un navigateur l'ignore sur une réponse
     * qui n'en est pas un, et c'est déjà la règle que suit le plugin Nitro
     * (`shouldSendContentSecurityPolicy`). Deux points d'application, une
     * seule politique.
     */
    '/**': { headers: enTetesDocuments },
    '/admin/**': { prerender: false },
    '/_ipx/**': {
      headers: { ...enTetesStatiques, 'cache-control': 'public, max-age=31536000, immutable' },
    },
    '/images/**': {
      headers: { ...enTetesStatiques, 'cache-control': 'public, max-age=2592000' },
    },
  },
  future: { compatibilityVersion: 4 },

  experimental: {
    payloadExtraction: true,
  },
  compatibilityDate: '2025-07-15',

  nitro: {
    compressPublicAssets: { gzip: true, brotli: true },

    /**
     * Anonymisation des demandes de devis expirées, chaque nuit à 3 h.
     * Le planificateur est fourni par le préréglage Node ; sur une plate-forme
     * sans cron intégré, déclencher `quotes:anonymise` depuis le cron maison.
     */
    experimental: { tasks: true },
    scheduledTasks: { '0 3 * * *': ['quotes:anonymise'] },

    prerender: {
      crawlLinks: true,
      /**
       * L'optimiseur d'images de Vercel n'existe qu'à l'exécution : le
       * crawler qui suit les `src` des pages y récolte autant de 404, et le
       * build s'arrête sur « Exiting due to prerender errors ». Ces URL sont
       * servies par la plate-forme, elles n'ont rien à faire dans le rendu
       * anticipé.
       */
      ignore: ['/_vercel/image'],
      routes: [
        '/',
        '/services',
        '/galerie',
        '/a-propos',
        '/contact',
        '/faq',
        '/mentions-legales',
        '/conditions-de-location',
        '/confidentialite',
        '/conseils',
        // Les articles sont découverts par `crawlLinks` depuis le sommaire.
      ],
    },
  },

  vite: {
    plugins: [tailwindcss()],
  },

  typescript: {
    strict: true,
    typeCheck: false,
  },

  /**
   * Le module fournit la configuration Vue + TypeScript adaptée à
   * l'arborescence du projet ; `eslint.config.mjs` l'étend à la racine.
   * `stylistic` active le formatage dans ESLint : une seule chaîne d'outils,
   * pas de Prettier à tenir en parallèle.
   */
  eslint: {
    config: {
      stylistic: {
        indent: 2,
        quotes: 'single',
        semi: false,
        commaDangle: 'always-multiline',
      },
    },
  },

  fonts: {
    families: [
      { name: 'Cormorant Garamond', provider: 'google', weights: [300, 400, 500], styles: ['normal', 'italic'] },
      { name: 'Jost', provider: 'google', weights: [300, 400, 500], styles: ['normal'] },
    ],
    defaults: { subsets: ['latin', 'latin-ext'] },
  },

  /**
   * Français par défaut, anglais sous `/en/`.
   *
   * `prefix_except_default` garde les URL françaises inchangées — aucune
   * redirection, aucun lien cassé, aucun capital de référencement perdu.
   *
   * La détection par la langue du navigateur est **désactivée**. Elle
   * enverrait un moteur d'indexation ou un visiteur francophone en voyage sur
   * une version qu'il n'a pas demandée, et rendrait le pré-rendu non
   * déterministe. Le choix passe par le sélecteur du bandeau supérieur, qui
   * est explicite et se voit.
   *
   * Les trois pages légales et la rubrique Conseils n'existent qu'en
   * français : les premières engagent la société au regard du droit togolais,
   * la seconde vise une clientèle locale et se traduirait au prix d'une
   * décision éditoriale à part.
   */
  i18n: {
    defaultLocale: 'fr',
    strategy: 'prefix_except_default',
    locales: [
      { code: 'fr', language: 'fr-TG', name: 'Français', file: 'fr.json', dir: 'ltr' },
      { code: 'en', language: 'en', name: 'English', file: 'en.json', dir: 'ltr' },
    ],
    // Le chargement à la demande des fichiers de langue est le défaut en v10.
    detectBrowserLanguage: false,
    baseUrl: 'https://www.tbs-distribution.tg',
  },

  image: {
    /**
     * Sans `provider` explicite, `@nuxt/image` devine la plate-forme, et ne
     * devine pas la même chose d'un build à l'autre : un déploiement a servi
     * des URL `/_ipx/…`, le suivant des `/_vercel/image?…`. Or le pré-rendu
     * échoue sur les secondes — elles n'existent qu'à l'exécution — et le
     * build casse sans qu'une seule ligne du dépôt ait changé.
     *
     * Sur Vercel on prend donc l'optimiseur natif de la plate-forme, qui
     * dispense la fonction d'embarquer `sharp` ; ailleurs, IPX, qui tourne
     * dans le processus et sert aussi `nuxt dev`.
     */
    provider: process.env.VERCEL ? 'vercel' : 'ipx',
    quality: 74,
    format: ['webp'],
    presets: {
      // 60 au lieu de 72 : sur une vignette rendue à ~300 px de large, la
      // différence est indiscernable et le fichier perd un cinquième de son
      // poids. La galerie en affiche vingt-trois.
      card: { modifiers: { format: 'webp', quality: 60 } },
      hero: { modifiers: { format: 'webp', quality: 78 } },
    },
  },

  /**
   * L'espace de suivi est privé : ni indexé, ni pré-rendu. `noindex` double la
   * garde d'authentification — une page protégée qui fuit dans un index reste
   * une fuite d'information.
   */
  robots: {
    disallow: ['/admin'],
  },

  sitemap: {
    autoLastmod: true,
    exclude: ['/admin', '/admin/**'],
    /**
     * Les articles de la rubrique Conseils ne sont pas des routes déclarées :
     * sans cette source, un article publié n'entrerait au sitemap qu'une fois
     * découvert par un lien. Cf. `server/api/__sitemap__/urls.get.ts`.
     */
    sources: ['/api/__sitemap__/urls'],
  },
})
