import { expect, test } from '@playwright/test'
import { pageInteractive } from './utils'

test.describe('galerie', () => {
  test('filtre les réalisations et met à jour le compteur', async ({ page }) => {
    await page.goto('/galerie')
    await pageInteractive(page)

    const compteur = page.locator('[aria-live="polite"]').first()
    // `textContent` et non `innerText` : la mise en capitales vient du CSS, la
    // comparaison porterait sinon sur deux graphies du même texte.
    const avant = (await compteur.textContent())?.trim() ?? ''

    await page.getByRole('button', { name: 'Mariages', exact: true }).click()
    await expect(page.getByRole('button', { name: 'Mariages', exact: true })).toHaveAttribute('aria-pressed', 'true')
    await expect(compteur).not.toHaveText(avant)

    await page.getByRole('button', { name: 'Tout voir', exact: true }).click()
    await expect(compteur).toHaveText(avant)
  })

  test('ouvre la visionneuse et la ferme au clavier', async ({ page }) => {
    await page.goto('/galerie')
    await pageInteractive(page)

    await page.locator('section li button').first().click()

    const visionneuse = page.getByRole('dialog')
    await expect(visionneuse).toBeVisible()
    await expect(visionneuse).toHaveAttribute('aria-modal', 'true')

    await page.keyboard.press('Escape')
    await expect(visionneuse).toBeHidden()
  })

  test('déplie un secteur au survol comme au clavier, et mène à ses prestations', async ({ page }) => {
    await page.goto('/galerie')
    await pageInteractive(page)

    // C'est le panneau qui se déplie, et lui seul contient un lien vers les
    // prestations — les étiquettes de domaine, elles, mènent à la galerie.
    // Le lien couvrait autrefois toute la surface et servait de mesure ; il
    // est redevenu un lien parmi d'autres, sa largeur ne dit plus rien.
    // `section` et non la page entière : le pied de page liste les quatre
    // branches avec les mêmes liens, et ses `<li>` doublaient le compte.
    const panneaux = page.locator('section li').filter({ has: page.locator('a[href^="/services?branche="]') })
    await expect(panneaux).toHaveCount(4)

    const agro = panneaux.filter({ hasText: 'TBS Agro' })
    await expect(agro.locator('a[href^="/services?branche="]'))
      .toHaveAttribute('href', '/services?branche=agro')

    // Replié, le panneau vaut une part sur sept ; déplié, quatre.
    const replie = (await agro.boundingBox())?.width ?? 0
    expect(replie).toBeGreaterThan(0)

    await agro.hover()
    await expect.poll(async () => (await agro.boundingBox())?.width ?? 0)
      .toBeGreaterThan(replie * 2)

    // Le clavier obtient le même dépliement — c'est là que l'accordéon
    // d'origine, piloté au seul survol, ne répondait pas. Le focus se pose sur
    // un lien du panneau : `focusin` remonte jusqu'au `<li>`, qui porte l'état.
    const equipements = panneaux.filter({ hasText: 'TBS Équipements' })
    const prestations = equipements.locator('a[href^="/services?branche="]')
    await prestations.focus()
    await expect.poll(async () => (await equipements.boundingBox())?.width ?? 0)
      .toBeGreaterThan(replie * 2)

    // Et les domaines du secteur déplié mènent chacun à leur page produits —
    // ils menaient à la galerie filtrée, qui ajoutait une liste sous les
    // photographies. On vise le lien plutôt que son libellé : celui-ci est
    // porté par deux éléments — un pour les lecteurs d'écran, un pour l'œil —
    // et le chercher par son texte en trouverait deux ou aucun selon la
    // normalisation.
    const domaine = equipements.locator('a[href$="/galerie/equipements/mobilier-bureau"]')
    await expect(domaine).toBeVisible()
    await expect(domaine).toContainText('Mobilier & matériel de bureau')

    await prestations.press('Enter')
    await expect(page).toHaveURL(/\/services\?branche=equipements$/)
  })
})
