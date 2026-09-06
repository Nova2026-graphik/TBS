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
      routes: ['/', '/services', '/galerie', '/a-propos', '/contact', '/faq'],
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
