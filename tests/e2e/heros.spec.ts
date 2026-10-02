import type { Page } from '@playwright/test'
import { expect, test } from '@playwright/test'

/**
 * Bandeau des pages intérieures (`UiPageHero`).
 *
 * Il portait une planche-contact de trois ou quatre vignettes ; la maquette
 * la remplace par une photographie de fond sous voile, et met à droite ce qui
 * sert la page. Ce que ces tests tiennent :
 *
 *  - **la photographie est réellement décodée.** `app/utils/imageSizes.ts`
 *    documente le piège : un `sizes` mal formé fait produire à @nuxt/image un
 *    `srcset` de un à deux pixels, et la page se charge sans que rien n'échoue
 *    — le bandeau est simplement sombre. On mesure donc la largeur décodée ;
 *  - **la photographie reste hors de l'arbre d'accessibilité.** Elle est
 *    décorative, sous voile, et le titre dit déjà de quoi la page parle ;
 *  - **un seul `h1` par page**, porté par le bandeau.
 *
 * L'en-tête se repère par son fil d'Ariane, seul repère stable de la page —
 * le dépôt n'utilise pas d'attribut de test.
 */
const PAGES = ['/services', '/conseils', '/contact', '/faq'] as const

function heroOf(page: Page) {
  return page.locator('section').filter({
    has: page.getByRole('navigation', { name: 'Fil d\'Ariane' }),
  })
}

for (const path of PAGES) {
  test.describe(`en-tête de ${path}`, () => {
    test('affiche une photographie réellement chargée', async ({ page }) => {
      await page.goto(path)
      await page.waitForLoadState('networkidle')

      const photo = heroOf(page).locator('img').first()
      await expect(photo).toBeVisible()

      // `naturalWidth` est la largeur du fichier décodé, pas celle du cadre.
      const natural = await photo.evaluate(el => (el as HTMLImageElement).naturalWidth)
      expect(natural, `photographie de ${path}`).toBeGreaterThan(100)
    })

    test('garde la photographie hors de l’arbre d’accessibilité, et un seul h1', async ({ page }) => {
      await page.goto(path)
      await page.waitForLoadState('networkidle')

      const hero = heroOf(page)
      await expect(hero.locator('[aria-hidden="true"] img, img[aria-hidden="true"]')).toHaveCount(1)
      await expect(hero.getByRole('img')).toHaveCount(0)

      await expect(page.locator('h1')).toHaveCount(1)
      await expect(hero.locator('h1')).toHaveCount(1)
    })
  })
}
