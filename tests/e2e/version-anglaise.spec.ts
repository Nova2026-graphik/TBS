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

  /**
   * Les trois documents légaux étaient déclarés francophones
   * (`defineI18nRoute({ locales: ['fr'] })`) : en anglais, les entrées du pied
   * de page menaient à des `<a>` sans `href`. Ils sont maintenant traduits, et
   * portent l'avertissement qui dit lequel des deux textes engage la société.
   */
  test('les trois pages légales existent et sont traduites', async ({ page }) => {
    const pages = [
      ['/en/mentions-legales', /Legal notice/, /Mentions légales/],
      ['/en/conditions-de-location', /Rental terms/, /Conditions de location/],
      ['/en/confidentialite', /Privacy policy/, /Politique de confidentialité/],
    ] as const

    for (const [chemin, anglais, francais] of pages) {
      const reponse = await page.goto(chemin)
      expect(reponse?.status(), chemin).toBe(200)
      await expect(page.getByRole('heading', { level: 1 })).toHaveText(anglais)
      await expect(page.getByText(francais)).toHaveCount(0)
      await expect(page.getByText(/the French version prevails/)).toBeVisible()
    }
  })

  test('l’avertissement renvoie au texte français, qui n’en porte pas', async ({ page }) => {
    await page.goto('/en/confidentialite')
    await page.getByRole('link', { name: 'Read the French version' }).click()

    await expect(page).toHaveURL(/\/confidentialite$/)
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(/Politique de confidentialité/)
    await expect(page.getByText(/the French version prevails/)).toHaveCount(0)
  })

  /**
   * Les liens posés au milieu des phrases traduites passent par
   * `decouperTexteEnrichi` : s'il se trompait, ils sortiraient en texte brut
   * — `[privacy policy](/confidentialite)` affiché tel quel — ou sans `href`.
   */
  test('les liens dans le corps des pages légales restent des liens', async ({ page }) => {
    await page.goto('/en/conditions-de-location')

    await expect(page.getByText(/\]\(\//)).toHaveCount(0)
    await expect(page.getByRole('link', { name: 'privacy policy' }))
      .toHaveAttribute('href', '/en/confidentialite')
  })

  test('le site français reste en français', async ({ page }) => {
    await page.goto('/')

    await expect(page.getByText(/Tous droits réservés/)).toBeVisible()
    await expect(page.getByText(/structure son activité en quatre branches/)).toBeVisible()
    await expect(page.getByText(/Ils nous ont confié leur date/)).toBeVisible()
    await expect(page.getByText(/\d+ réf\./).first()).toBeVisible()
  })
})
