import type { Page } from '@playwright/test'
import { expect, test } from '@playwright/test'

/**
 * La branche active vit dans l'URL : un lien vers `?branche=agro` doit ouvrir
 * la bonne branche, et un clic doit rendre l'adresse partageable.
 */
/**
 * Les deux parcours cliquent dès l'arrivée sur la page. Le balisage venant du
 * pré-rendu, l'élément existe avant que Vue n'ait repris la main : un clic
 * envoyé trop tôt ne déclenche rien. On attend donc que le réseau se taise —
 * fichier de langue compris — avant d'agir.
 */
async function pageInteractive(page: Page) {
  await page.waitForLoadState('networkidle')
}

test.describe('services', () => {
  test('synchronise la branche choisie avec l URL', async ({ page }) => {
    await page.goto('/services')
    await pageInteractive(page)

    await page.getByRole('tab', { name: /Agro/i }).click()

    await expect(page).toHaveURL(/[?&]branche=agro/)
    await expect(page.getByRole('tab', { name: /Agro/i })).toHaveAttribute('aria-selected', 'true')
  })

  test('ouvre directement la branche demandée par l URL', async ({ page }) => {
    await page.goto('/services?branche=events')
    await pageInteractive(page)

    await expect(page.getByRole('tab', { name: /Events/i })).toHaveAttribute('aria-selected', 'true')
  })

  test('ignore une branche inconnue sans casser la page', async ({ page }) => {
    await page.goto('/services?branche=inexistante')
    await pageInteractive(page)

    await expect(page.getByRole('tablist')).toBeVisible()
    await expect(page.getByRole('tab', { selected: true })).toHaveCount(1)
  })
})
