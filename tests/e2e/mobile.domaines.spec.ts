import { expect, test } from '@playwright/test'
import { pageInteractive } from './utils'

/**
 * Page domaine sur téléphone.
 *
 * Trois choses que le grand écran ne vérifie pas : la colonne de domaines
 * devient un bandeau qui défile à l'horizontale — dix-sept lignes empilées
 * auraient repoussé les produits sous deux écrans —, la grille tombe à deux
 * colonnes, et la barre « Aperçu » reste visible en permanence. Cette
 * dernière est la seule qui dise qu'une carte s'ouvre : au doigt, il n'y a
 * pas de survol pour la révéler.
 */
test.describe('page domaine sur téléphone', () => {
  test('le bandeau de domaines défile à l’horizontale', async ({ page }) => {
    await page.goto('/galerie/equipements/mobilier-bureau')
    await pageInteractive(page)

    const bandeau = page.locator('nav ul').first()
    const debordement = await bandeau.evaluate(el => el.scrollWidth - el.clientWidth)
    expect(debordement, 'le bandeau devrait déborder et défiler').toBeGreaterThan(0)
  })

  test('la grille tient sur deux colonnes, sans débordement de page', async ({ page }) => {
    await page.goto('/galerie/equipements/mobilier-bureau')
    await pageInteractive(page)

    const colonnes = await page.locator('ul:has(button:has-text("Aperçu"))').first()
      .evaluate(el => getComputedStyle(el).gridTemplateColumns.split(' ').length)
    expect(colonnes).toBe(2)

    // Rien ne doit pousser la page à défiler latéralement.
    const depassement = await page.evaluate(() =>
      document.documentElement.scrollWidth - document.documentElement.clientWidth,
    )
    expect(depassement).toBeLessThanOrEqual(1)
  })

  test('la barre « Aperçu » est visible sans survol', async ({ page }) => {
    await page.goto('/galerie/equipements/mobilier-bureau')
    await pageInteractive(page)

    const barre = page.locator('button:has-text("Aperçu") span:text-is("Aperçu")').first()
    await barre.scrollIntoViewIfNeeded()
    await expect(barre).toBeInViewport()
  })

  test('toucher une carte ouvre la fiche rapide', async ({ page }) => {
    await page.goto('/galerie/equipements/mobilier-bureau')
    await pageInteractive(page)

    await page.locator('button:has-text("Aperçu")').first().tap()
    await expect(page.getByRole('dialog')).toBeVisible()
  })
})
