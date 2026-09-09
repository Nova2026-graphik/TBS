import { expect, test } from '@playwright/test'
import { pageInteractive } from './utils'

/**
 * Tiroir de navigation mobile : ouverture, fermeture par Échap et retour du
 * focus sur le bouton — la partie qu'on casse sans s'en apercevoir en
 * retouchant le composant.
 */
test.describe('navigation mobile', () => {
  test('ouvre le tiroir, le ferme par Échap et rend le focus au bouton', async ({ page }) => {
    await page.goto('/')
    await pageInteractive(page)

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
    await pageInteractive(page)

    await page.getByRole('button', { name: 'Ouvrir le menu' }).click()

    // Le tiroir s'ouvre en transition. Cliquer dedans avant qu'il ne soit
    // visible marchait presque toujours — et échouait sous charge, dans la
    // suite complète, jamais en relance isolée. Le test frère attend déjà
    // cette visibilité ; celui-ci ne l'attendait pas.
    const tiroir = page.locator('#mobile-nav')
    await expect(tiroir).toBeVisible()

    await tiroir.getByRole('link', { name: 'Contact', exact: true }).click()

    await expect(page).toHaveURL(/\/contact$/)
    // Le tiroir se referme au changement de route.
    await expect(page.locator('#mobile-nav')).toBeHidden()
  })
})
