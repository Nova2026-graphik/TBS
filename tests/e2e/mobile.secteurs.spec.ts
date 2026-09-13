import { expect, test } from '@playwright/test'
import { pageInteractive } from './utils'

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

    /**
     * Le nombre de domaines vient des données : 13, 2, 1 et 1.
     *
     * On compte les tuiles par leur étiquette, et non les `<li>` de la
     * grille : celle-ci en porte une de plus, l'appel à l'action qui occupe
     * les cases restantes de la dernière rangée.
     */
    for (const [i, attendu] of [13, 2, 1, 1].entries()) {
      const tuiles = panneaux.nth(i).locator('a[aria-label*="références"]')
      await expect(tuiles).toHaveCount(attendu)
      await expect(tuiles.first()).toBeVisible()

      // Et l'appel à l'action, qui remplace le trou de fin de rangée.
      await expect(panneaux.nth(i).locator('a[href*="/contact"]')).toHaveCount(1)
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
    await pageInteractive(page)

    // `branche=agro` seul attrape aussi les étiquettes de domaine, qui mènent
    // à la galerie filtrée : c'est la destination qui identifie ce lien.
    const lien = page.locator('a[href*="/services?branche=agro-business"]').first()
    await lien.scrollIntoViewIfNeeded()
    await lien.click()
    await expect(page).toHaveURL(/\/services\?branche=agro-business/)
  })
})
