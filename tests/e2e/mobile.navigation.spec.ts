import { expect, test } from '@playwright/test'

/**
 * Tiroir de navigation mobile : ouverture, fermeture par Échap et retour du
 * focus sur le bouton — la partie qu'on casse sans s'en apercevoir en
 * retouchant le composant.
 */
test.describe('navigation mobile', () => {
  test('ouvre le tiroir, le ferme par Échap et rend le focus au bouton', async ({ page }) => {
    await page.goto('/')

    const bouton = page.getByRole('button', { name: 'Ouvrir le menu' })
    await bouton.click()

    const tiroir = page.locator('#mobile-nav')
    await expect(tiroir).toBeVisible()
    await expect(page.getByRole('button', { name: 'Fermer le menu' })).toHaveAttribute('aria-expanded', 'true')

    await page.keyboard.press('Escape')
    await expect(tiroir).toBeHidden()
    await expect(bouton).toBeFocused()
  })

  test('navigue vers une page depuis le tiroir', async ({ page }) => {
    await page.goto('/')

    await page.getByRole('button', { name: 'Ouvrir le menu' }).click()
    await page.locator('#mobile-nav').getByRole('link', { name: 'Contact' }).click()

    await expect(page).toHaveURL(/\/contact$/)
    // Le tiroir se referme au changement de route.
    await expect(page.locator('#mobile-nav')).toBeHidden()
  })
})
