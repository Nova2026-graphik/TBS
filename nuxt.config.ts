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
      card: { modifiers: { format: 'webp', quality: 72 } },
      hero: { modifiers: { format: 'webp', quality: 78 } },
    },
  },

  sitemap: {
    autoLastmod: true,
  },

  nitro: {
    compressPublicAssets: { gzip: true, brotli: true },
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
