import type { Page } from '@playwright/test'
import { expect, test } from '@playwright/test'

/**
 * Planche-contact des en-têtes de page (`UiPageHero`).
 *
 * Deux régressions sont visées, et aucune des deux ne se voit dans une revue
 * de code :
 *
 *  - **le `srcset` dégénéré.** `app/utils/imageSizes.ts` documente le piège :
 *    un jeton `sizes` sans préfixe d'écran fait produire à @nuxt/image un
 *    `srcset` de deux entrées, `1w` et `2w` — une image de un à deux pixels
 *    servie à la place de la photo. La page se charge, rien n'échoue, et la
 *    vignette est simplement invisible. On mesure donc la largeur réellement
 *    décodée, la seule valeur qui trahisse le défaut ;
 *  - **la bande qui rentrerait dans l'arbre d'accessibilité.** Les vignettes
 *    sont décoratives et reprennent des photos présentes plus bas dans la
 *    page : un lecteur d'écran ne doit pas les rencontrer deux fois.
 *
 * L'en-tête se repère par son fil d'Ariane, seul repère stable de la page —
 * le dépôt n'utilise pas d'attribut de test.
 */

const PAGES = [
  { path: '/galerie', frames: 4 },
  { path: '/services', frames: 4 },
  { path: '/conseils', frames: 3 },
  { path: '/contact', frames: 3 },
  { path: '/faq', frames: 3 },
  { path: '/mentions-legales', frames: 3 },
  { path: '/conditions-de-location', frames: 3 },
  { path: '/confidentialite', frames: 3 },
] as const

function heroOf(page: Page) {
  return page.locator('section').filter({
    has: page.getByRole('navigation', { name: 'Fil d\'Ariane' }),
  })
}

for (const { path, frames } of PAGES) {
  test.describe(`en-tête de ${path}`, () => {
    test('affiche une planche-contact réellement chargée', async ({ page }) => {
      await page.goto(path)
      await page.waitForLoadState('networkidle')

      const vignettes = heroOf(page).locator('img')
      await expect(vignettes).toHaveCount(frames)

      for (let i = 0; i < frames; i++) {
        const vignette = vignettes.nth(i)
        await expect(vignette).toBeVisible()

        // `naturalWidth` est la largeur du fichier décodé, pas celle du cadre.
        const natural = await vignette.evaluate(el => (el as HTMLImageElement).naturalWidth)
        expect(natural, `vignette ${i + 1} de ${path}`).toBeGreaterThan(100)
      }
    })

    test('garde la planche hors de l’arbre d’accessibilité', async ({ page }) => {
      await page.goto(path)
      await page.waitForLoadState('networkidle')

      const hero = heroOf(page)

      // Toutes les vignettes sont sous un conteneur masqué…
      await expect(hero.locator('[aria-hidden="true"] img')).toHaveCount(frames)
      // …et aucune n'expose de rôle `img`, que seul un `alt` non vide donne.
      await expect(hero.getByRole('img')).toHaveCount(0)
    })
  })
}
