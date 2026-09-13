import { expect, test } from '@playwright/test'
import { pageInteractive } from './utils'

/**
 * La branche active vit dans l'URL : un lien vers `?branche=agro-business`
 * doit ouvrir la bonne branche, et un clic doit rendre l'adresse partageable.
 *
 * L'adresse porte le nom public de la branche, jamais son identifiant interne
 * — `agro-business` pour la branche `agro`.
 */
test.describe('services', () => {
  test('synchronise la branche choisie avec l URL', async ({ page }) => {
    await page.goto('/services')
    await pageInteractive(page)

    await page.getByRole('tab', { name: /Agro/i }).click()

    await expect(page).toHaveURL(/[?&]branche=agro-business/)
    await expect(page.getByRole('tab', { name: /Agro/i })).toHaveAttribute('aria-selected', 'true')
  })

  test('ouvre directement la branche demandée par l URL', async ({ page }) => {
    await page.goto('/services?branche=evenementiel')
    await pageInteractive(page)

    await expect(page.getByRole('tab', { name: /Événementiel/i })).toHaveAttribute('aria-selected', 'true')
  })

  test('ignore une branche inconnue sans casser la page', async ({ page }) => {
    await page.goto('/services?branche=inexistante')
    await pageInteractive(page)

    await expect(page.getByRole('tablist')).toBeVisible()
    await expect(page.getByRole('tab', { selected: true })).toHaveCount(1)
  })
})
