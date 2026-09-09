import { expect, test } from '@playwright/test'

/**
 * Version anglaise : les textes qui n'y passaient pas.
 *
 * Six chaînes visibles étaient écrites en dur dans les gabarits et
 * s'affichaient en français sur le site anglais — dont le pied de page, donc
 * sur toutes les pages. Les clés de traduction étaient pourtant à parité
 * parfaite : le défaut ne se voyait ni dans les fichiers de langue, ni au
 * contrôle de types, ni au lint.
 *
 * Ce parcours le rendrait visible. Il vérifie les deux sens — l'anglais servi
 * en anglais, le français resté français — parce qu'une clé mal branchée peut
 * casser l'une ou l'autre langue.
 */
test.describe('version anglaise', () => {
  test('le pied de page est traduit, sur toutes les pages', async ({ page }) => {
    for (const chemin of ['/en/', '/en/galerie', '/en/contact']) {
      await page.goto(chemin)
      await expect(page.getByText(/All rights reserved/)).toBeVisible()
      await expect(page.getByText(/Tous droits réservés/)).toHaveCount(0)
    }
  })

  test('l’accueil anglais ne garde aucun des textes en dur', async ({ page }) => {
    await page.goto('/en/')

    await expect(page.getByText(/is organised into four complementary divisions/)).toBeVisible()
    await expect(page.getByText(/They trusted us with their date/)).toBeVisible()
    // Le compteur de références : « 210 items », plus « 210 réf. ».
    await expect(page.getByText(/\d+ items/).first()).toBeVisible()

    await expect(page.getByText(/structure son activité/)).toHaveCount(0)
    await expect(page.getByText(/confié leur date/)).toHaveCount(0)
    await expect(page.getByText(/réf\./)).toHaveCount(0)
  })

  test('les valeurs et l’avertissement de la carte sont traduits', async ({ page }) => {
    await page.goto('/en/a-propos')
    await expect(page.getByRole('heading', { name: /Three commitments/ })).toBeVisible()
    await expect(page.getByText(/non négociables/)).toHaveCount(0)

    await page.goto('/en/contact')
    await expect(page.getByText(/sends a request to OpenStreetMap/)).toBeVisible()
    await expect(page.getByText(/reçoit alors votre adresse IP/)).toHaveCount(0)
  })

  test('le site français reste en français', async ({ page }) => {
    await page.goto('/')

    await expect(page.getByText(/Tous droits réservés/)).toBeVisible()
    await expect(page.getByText(/structure son activité en quatre branches/)).toBeVisible()
    await expect(page.getByText(/Ils nous ont confié leur date/)).toBeVisible()
    await expect(page.getByText(/\d+ réf\./).first()).toBeVisible()
  })
})
