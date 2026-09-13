import { expect, test } from '@playwright/test'
import { pageInteractive } from './utils'

/**
 * Panneau des domaines de `/galerie` : grille de tuiles identiques.
 *
 * Les domaines étaient des puces en `flex-wrap` dont la largeur suivait la
 * longueur du texte, dans un contenu en `absolute inset-0` que le panneau
 * découpait. La première puce passait sous le bord supérieur : à moitié
 * visible, plus cliquable en entier. Ces tests tiennent les trois choses que
 * cela avait cassées — le compte, la coupe, et le fait qu'on puisse cliquer.
 */

/** Le panneau ouvert est le premier de l'accordéon ; l'animation dure 900 ms. */
async function panneauOuvert(page: import('@playwright/test').Page) {
  await page.goto('/galerie')
  await pageInteractive(page)
  const panneau = page.locator('section > ul > li').first()
  await panneau.scrollIntoViewIfNeeded()
  await panneau.hover()
  await page.waitForTimeout(1200)
  return panneau
}

test.describe('panneau des domaines', () => {
  test('affiche une tuile par domaine, comptée dans les données', async ({ page }) => {
    const panneau = await panneauOuvert(page)

    // Treize domaines pour Équipements, et autant de tuiles.
    const tuiles = panneau.locator('a[aria-label*="références"]')
    await expect(tuiles).toHaveCount(13)

    // Le compteur vient des données : la première référence en porte dix-neuf.
    await expect(tuiles.first()).toHaveAttribute(
      'aria-label',
      'Mobilier & matériel de bureau — 19 références',
    )
  })

  /**
   * Les deux nombres de la ligne de section sont calculés. Les écrire aurait
   * fait mentir la page au premier domaine ajouté — et 113 est précisément la
   * somme des treize compteurs.
   */
  test('la ligne de section chiffre la branche', async ({ page }) => {
    const panneau = await panneauOuvert(page)
    await expect(panneau).toContainText('13 domaines')
    await expect(panneau).toContainText('113 références')
  })

  test('une tuile mène à la page de son domaine, au clic comme au clavier', async ({ page }) => {
    const panneau = await panneauOuvert(page)

    await panneau.locator('a[aria-label^="Mobilier"]').first().click()
    await expect(page).toHaveURL(/\/galerie\/equipements\/mobilier-bureau$/)

    // La dernière tuile de la grille était celle que le débordement coupait.
    const retour = await panneauOuvert(page)
    const derniere = retour.locator('a[aria-label*="manutention"]').first()
    await derniere.focus()
    await page.keyboard.press('Enter')
    await expect(page).toHaveURL(/\/galerie\/equipements\/manutention$/)
  })

  test('les cases restantes portent l’appel à l’action', async ({ page }) => {
    const panneau = await panneauOuvert(page)

    const devis = panneau.locator('a[href*="/contact"]').first()
    await expect(devis).toContainText(/Toute la branche/i)
    await expect(devis).toContainText('113 références')

    await devis.click()
    await expect(page).toHaveURL(/\/contact\?branche=equipements/)
  })

  /**
   * Le débordement était le défaut d'origine : treize puces ne tenaient pas
   * dans la hauteur fixe du panneau. On vérifie qu'aucune tuile ne sort de
   * son panneau, et que la page ne déborde pas latéralement.
   */
  test('aucune tuile ne sort du panneau', async ({ page }) => {
    const panneau = await panneauOuvert(page)
    const cadre = await panneau.boundingBox()
    expect(cadre).not.toBeNull()

    const tuiles = panneau.locator('a[aria-label*="références"]')
    for (let i = 0; i < await tuiles.count(); i += 1) {
      const boite = await tuiles.nth(i).boundingBox()
      expect(boite, `tuile ${i}`).not.toBeNull()
      expect(boite!.y, `tuile ${i} au-dessus du panneau`).toBeGreaterThanOrEqual(cadre!.y - 1)
      expect(
        boite!.y + boite!.height,
        `tuile ${i} sous le panneau`,
      ).toBeLessThanOrEqual(cadre!.y + cadre!.height + 1)
    }

    const debordement = await page.evaluate(() =>
      document.documentElement.scrollWidth - document.documentElement.clientWidth)
    expect(debordement).toBeLessThanOrEqual(1)
  })

  test('les autres branches ouvrent la même grille', async ({ page }) => {
    await page.goto('/galerie')
    await pageInteractive(page)

    // Événementiel : deux domaines, et son propre texte d'appel à l'action.
    const evenementiel = page.locator('section > ul > li').nth(1)
    await evenementiel.scrollIntoViewIfNeeded()
    await evenementiel.hover()
    await page.waitForTimeout(1200)

    await expect(evenementiel.locator('a[aria-label*="références"]')).toHaveCount(2)
    await expect(evenementiel).toContainText('2 domaines')
    await expect(evenementiel.locator('a[href*="/contact"]').first())
      .toContainText(/de 20 à 2 000 invités/)
  })
})
