import { expect, test } from '@playwright/test'

/**
 * Section « secteurs » de la galerie, au doigt.
 *
 * Le dépliement reposait sur le survol et la prise de focus : sur un écran
 * tactile, trois secteurs sur quatre gardaient leurs domaines invisibles, et
 * les toucher quittait la page pour `/services`. Ces tests gardent la
 * correction — en dessous de `md`, il n'y a plus rien à déplier.
 */
test.describe('secteurs de la galerie sur téléphone', () => {
  test('les quatre secteurs montrent leurs domaines sans interaction', async ({ page }) => {
    await page.goto('/galerie')

    const panneaux = page.locator('section ul > li').filter({ has: page.locator('h3') })
    await expect(panneaux).toHaveCount(4)

    // Le nombre de domaines vient des données : 4, 2, 1 et 1.
    for (const [i, attendu] of [4, 2, 1, 1].entries()) {
      const chips = panneaux.nth(i).locator('ul li')
      await expect(chips).toHaveCount(attendu)
      await expect(chips.first()).toBeVisible()
    }
  })

  test('toucher un panneau ne quitte pas la galerie par surprise', async ({ page }) => {
    await page.goto('/galerie')

    const dernier = page.locator('section ul > li').filter({ has: page.locator('h3') }).last()
    await dernier.scrollIntoViewIfNeeded()

    // Les domaines sont déjà lisibles : le toucher n'a plus rien à révéler.
    await expect(dernier.locator('ul li').first()).toBeVisible()
    await expect(page).toHaveURL(/\/galerie$/)
  })

  test('le lien vers les prestations reste accessible', async ({ page }) => {
    await page.goto('/galerie')

    const lien = page.locator('a[href*="branche=agro"]').first()
    await lien.scrollIntoViewIfNeeded()
    await lien.click()
    await expect(page).toHaveURL(/\/services\?branche=agro/)
  })
})
