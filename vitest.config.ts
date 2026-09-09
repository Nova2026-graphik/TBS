import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vitest/config'

/**
 * Tests unitaires.
 *
 * Environnement Node et rien de plus : les trois suites portent sur des
 * modules purs — validation, repli statique, calcul de `sizes`. Monter un
 * environnement Nuxt complet pour cela coûterait une minute par exécution
 * sans rien apprendre de neuf ; les parcours qui ont besoin d'un vrai
 * navigateur sont couverts par Playwright.
 */
export default defineConfig({
  test: {
    environment: 'node',
    /**
     * Vitest 5 sait garder ses transformations d'un passage à l'autre. Elles
     * pesaient 42 % du temps d'exécution, refaites à chaque fois pour un
     * dossier de tests qui ne change pas entre deux relances.
     */
    fsModuleCache: true,
    include: ['tests/unit/**/*.spec.ts'],
    reporters: ['default'],
  },
  resolve: {
    alias: {
      '#shared': fileURLToPath(new URL('./shared', import.meta.url)),
      '~': fileURLToPath(new URL('./app', import.meta.url)),
    },
  },
})
