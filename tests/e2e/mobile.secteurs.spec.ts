import { expect, test } from '@playwright/test'
import { pageInteractive } from './utils'

/**
 * Section « secteurs » de la galerie, au doigt.
 *
 * Sous `md`, chaque panneau est un accordéon : une barre de 64 px avec le
 * nom de la branche et une flèche, qui déplie le contenu en dessous. Un
 * seul panneau est ouvert à la fois. Avant, les quatre étaient dépliés
 * d'emblée — une colonne de plus de trois mille pixels sur un téléphone.
 *
 * Ce que ces tests tiennent : la barre est un vrai bouton (`aria-expanded`),
 * elle déplie sans quitter la page, et le contenu déplié porte bien ses
 * tuiles, son appel à l'action et son lien vers les prestations.
 */
test.describe('secteurs de la galerie sur téléphone', () => {
  const panneaux = (page: import('@playwright/test').Page) =>
    page.locator('section ul > li').filter({ has: page.locator('h3') })

  test('quatre barres, une seule dépliée, avec ses tuiles comptées', async ({ page }) => {
    await page.goto('/galerie')
    await pageInteractive(page)

    const barres = panneaux(page).getByRole('button', { expanded: true })
    await expect(barres).toHaveCount(1)
    await expect(panneaux(page).getByRole('button', { expanded: false })).toHaveCount(3)

    // Le premier panneau, Équipements, porte treize tuiles et l'appel à l'action.
    const premier = panneaux(page).first()
    await expect(premier.locator('a[aria-label*="références"]')).toHaveCount(13)
    await expect(premier.locator('a[href*="/contact"]')).toHaveCount(1)
  })

  test('toucher une barre déplie son panneau sans quitter la galerie', async ({ page }) => {
    await page.goto('/galerie')
    await pageInteractive(page)

    const dernier = panneaux(page).last()
    // La barre est le seul bouton du panneau : les tuiles et l'appel à
    // l'action sont des liens. On la désigne sans son état, qui va changer.
    const barre = dernier.getByRole('button').first()
    await expect(barre).toHaveAttribute('aria-expanded', 'false')
    await barre.scrollIntoViewIfNeeded()
    await barre.click()

    await expect(barre).toHaveAttribute('aria-expanded', 'true')
    await expect(dernier.locator('a[aria-label*="références"]').first()).toBeVisible()
    await expect(page).toHaveURL(/\/galerie$/)

    // Et le premier s'est replié : un seul ouvert à la fois.
    await expect(panneaux(page).first().getByRole('button').first()).toHaveAttribute('aria-expanded', 'false')
  })

  test('le lien vers les prestations reste accessible dans le panneau ouvert', async ({ page }) => {
    await page.goto('/galerie')
    await pageInteractive(page)

    const premier = panneaux(page).first()
    // `branche=equipements` seul attrape aussi les étiquettes de domaine, qui
    // mènent à la galerie : le lien des prestations est celui vers /services.
    const lien = premier.locator('a[href*="/services?branche=equipements"]').first()
    await lien.scrollIntoViewIfNeeded()
    await expect(lien).toBeVisible()
    await lien.click()
    await expect(page).toHaveURL(/\/services\?branche=equipements/)
  })
})
