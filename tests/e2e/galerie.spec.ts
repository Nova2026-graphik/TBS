import type { Page } from '@playwright/test'
import { expect, test } from '@playwright/test'

/**
 * Les deux parcours cliquent dès l'arrivée sur la page. Le balisage venant du
 * pré-rendu, l'élément existe avant que Vue n'ait repris la main : un clic
 * envoyé trop tôt ne déclenche rien. On attend donc que le réseau se taise —
 * fichier de langue compris — avant d'agir.
 */
async function pageInteractive(page: Page) {
  await page.waitForLoadState('networkidle')
}

test.describe('galerie', () => {
  test('filtre les réalisations et met à jour le compteur', async ({ page }) => {
    await page.goto('/galerie')
    await pageInteractive(page)

    const compteur = page.locator('[aria-live="polite"]').first()
    // `textContent` et non `innerText` : la mise en capitales vient du CSS, la
    // comparaison porterait sinon sur deux graphies du même texte.
    const avant = (await compteur.textContent())?.trim() ?? ''

    await page.getByRole('button', { name: 'Mariages' }).click()
    await expect(page.getByRole('button', { name: 'Mariages' })).toHaveAttribute('aria-pressed', 'true')
    await expect(compteur).not.toHaveText(avant)

    await page.getByRole('button', { name: 'Tout voir' }).click()
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

    // Un lien par secteur, et un seul : le panneau entier est cliquable.
    const secteurs = page.getByRole('link', { name: /voir les prestations$/ })
    await expect(secteurs).toHaveCount(4)

    const agro = secteurs.filter({ hasText: 'TBS Agro' })
    await expect(agro).toHaveAttribute('href', '/services?branche=agro')

    // Le lien couvre le panneau : sa largeur mesure donc le dépliement.
    // Replié, il vaut une part sur sept ; déplié, quatre.
    const replie = (await agro.boundingBox())?.width ?? 0
    expect(replie).toBeGreaterThan(0)

    await agro.hover()
    await expect.poll(async () => (await agro.boundingBox())?.width ?? 0)
      .toBeGreaterThan(replie * 2)

    // Le clavier obtient le même dépliement — c'est là que l'accordéon
    // d'origine, piloté au seul survol, ne répondait pas.
    const equipements = secteurs.filter({ hasText: 'TBS Équipements' })
    await equipements.focus()
    await expect.poll(async () => (await equipements.boundingBox())?.width ?? 0)
      .toBeGreaterThan(replie * 2)

    // Et les domaines du secteur déplié sont bien nommés.
    await expect(page.getByText('Mobilier & matériel de bureau')).toBeVisible()

    await equipements.press('Enter')
    await expect(page).toHaveURL(/\/services\?branche=equipements$/)
  })
})
