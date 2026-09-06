import tailwindcss from '@tailwindcss/vite'

export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  future: { compatibilityVersion: 4 },
  devtools: { enabled: true },

  modules: [
    '@nuxt/image',
    '@nuxt/fonts',
    '@vueuse/nuxt',
    '@nuxtjs/sitemap',
    '@nuxtjs/robots',
  ],

  css: ['~/assets/css/main.css'],

  vite: {
    plugins: [tailwindcss()],
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
       */
      trustedProxy: 'direct',
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
    },
  },

  site: {
    url: 'https://www.tbs-distribution.tg',
    name: 'TBS Distribution S.A.R.L',
  },

  app: {
    head: {
      htmlAttrs: { lang: 'fr' },
      titleTemplate: '%s · TBS Distribution',
      link: [
        { rel: 'icon', type: 'image/png', href: '/images/logo-tbs.png' },
        { rel: 'canonical', href: 'https://www.tbs-distribution.tg' },
      ],
      meta: [
        { name: 'theme-color', content: '#3E3524' },
        { name: 'format-detection', content: 'telephone=no' },
      ],
    },
    pageTransition: { name: 'page', mode: 'out-in' },
  },

  fonts: {
    families: [
      { name: 'Cormorant Garamond', provider: 'google', weights: [300, 400, 500], styles: ['normal', 'italic'] },
      { name: 'Jost', provider: 'google', weights: [300, 400, 500], styles: ['normal'] },
    ],
    defaults: { subsets: ['latin', 'latin-ext'] },
  },

  image: {
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

  sitemap: {
    autoLastmod: true,
  },

  /**
   * Cache des images. Les URL `/_ipx/` portent format, qualité et dimensions
   * dans leur chemin : elles sont adressées par leur contenu, donc immuables
   * par construction — exactement comme les fichiers hachés de `/_nuxt/`.
   * Les originaux de `/images/` gardent un nom fixe : un an serait un piège,
   * trente jours laissent une purge possible.
   */
  routeRules: {
    '/_ipx/**': { headers: { 'cache-control': 'public, max-age=31536000, immutable' } },
    '/images/**': { headers: { 'cache-control': 'public, max-age=2592000' } },
  },

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
      ],
    },
  },

  typescript: {
    strict: true,
    typeCheck: false,
  },

  experimental: {
    payloadExtraction: true,
  },
})
