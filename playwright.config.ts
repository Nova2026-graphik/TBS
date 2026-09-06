import { defineConfig, devices } from '@playwright/test'

/**
 * Parcours de bout en bout.
 *
 * Les tests visent la **sortie de production** — `npm run build` puis le
 * serveur Nitro — et non le serveur de développement : le pré-rendu,
 * l'hydratation et les en-têtes de sécurité y sont ceux du site livré. C'est
 * précisément là que les régressions se logent.
 *
 * Aucune base n'est requise : sans `DATABASE_URL`, le site sert son contenu
 * statique et le formulaire répond quand même — la dégradation gracieuse fait
 * partie de ce qui est vérifié.
 */
const PORT = Number(process.env.PLAYWRIGHT_PORT ?? 3123)

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: process.env.CI ? [['github'], ['html', { open: 'never' }]] : 'list',

  use: {
    baseURL: `http://127.0.0.1:${PORT}`,
    trace: 'on-first-retry',
    locale: 'fr-FR',
  },

  projects: [
    {
      name: 'bureau',
      use: { ...devices['Desktop Chrome'] },
      testIgnore: /mobile\..*\.spec\.ts/,
    },
    {
      name: 'mobile',
      use: { ...devices['Pixel 7'] },
      // Le tiroir de navigation n'existe qu'en dessous de `lg`.
      testMatch: /mobile\..*\.spec\.ts/,
    },
  ],

  webServer: {
    command: 'npm run build && node .output/server/index.mjs',
    url: `http://127.0.0.1:${PORT}`,
    reuseExistingServer: !process.env.CI,
    timeout: 10 * 60 * 1000,
    env: { PORT: String(PORT), HOST: '127.0.0.1' },
  },
})
