import type { Page } from '@playwright/test'
import { expect, test } from '@playwright/test'

/**
 * Le hero est piloté par un minuteur côté client : le balisage vient du
 * pré-rendu, mais rien ne tourne avant que Vue n'ait repris la main. On
 * attend donc que le réseau se taise — fichier de langue compris.
 */
async function pageInteractive(page: Page) {
  await page.waitForLoadState('networkidle')
}

/**
 * Libellé de la puce en cours : la seule marque fiable de la diapositive
 * affichée. Le texte, lui, traverse une transition et serait lu en plein
 * fondu une fois sur deux.
 */
function diapoAffichee(page: Page) {
  return page
    .locator('button[aria-current="true"][aria-label^="Afficher "]')
    .getAttribute('aria-label')
}

test.describe('hero d\'accueil', () => {
  test('ouvre sur TBS Distribution, avant les quatre branches', async ({ page }) => {
    await page.goto('/')
    await pageInteractive(page)

    const puces = page.getByRole('button', { name: /^Afficher / })
    await expect(puces).toHaveCount(5)
    await expect(puces.first()).toHaveAccessibleName('Afficher TBS Distribution')

    // Le survol suffit à mettre la rotation en pause : à partir d'ici, la
    // diapositive ne bouge plus toute seule.
    await puces.first().click()
    await expect(page.getByText('TBS Distribution — Quatre branches, un seul interlocuteur')).toBeVisible()

    // Le premier appel à l'action suit la diapositive : la maison mène au
    // catalogue entier, une branche à sa propre page.
    const cta = page.getByRole('link', { name: 'Découvrir nos services' })
    await expect(cta).toHaveAttribute('href', '/services')

    await puces.nth(2).click()
    await expect(cta).toHaveAttribute('href', '/services?branche=events')
  })

  test('change de diapositive au bout de cinq secondes', async ({ page }) => {
    await page.goto('/')
    await pageInteractive(page)

    // Aucun mouvement de souris ici : le hero se met en pause au survol, et
    // la rotation ne serait plus vérifiable.
    const avant = await diapoAffichee(page)
    expect(avant).toBeTruthy()

    await expect.poll(() => diapoAffichee(page), { timeout: 9_000 }).not.toBe(avant)
  })

  test('la rotation peut être arrêtée (WCAG 2.2.2)', async ({ page }) => {
    await page.goto('/')
    await pageInteractive(page)

    const pause = page.getByRole('button', { name: 'Mettre en pause le défilement' })
    await expect(pause).toHaveAttribute('aria-pressed', 'false')
    await pause.click()

    await expect(page.getByRole('button', { name: 'Reprendre le défilement' }))
      .toHaveAttribute('aria-pressed', 'true')

    const fige = await diapoAffichee(page)
    await page.waitForTimeout(6_000)
    expect(await diapoAffichee(page)).toBe(fige)
  })
})
