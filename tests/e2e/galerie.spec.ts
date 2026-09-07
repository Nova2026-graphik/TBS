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
})
