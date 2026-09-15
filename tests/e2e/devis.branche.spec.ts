import { expect, test } from '@playwright/test'
import { pageInteractive } from './utils'

/**
 * Le formulaire de devis s'adapte à la branche.
 *
 * Quatre tuiles en tête — un groupe de boutons radio — choisissent la
 * branche, et c'est elle qui commande les champs : type, date, invités et
 * lieu pour Événementiel ; domaine, quantités et lieu de livraison pour
 * Équipements ; objet et échéance pour Études ; culture, surface et saison
 * pour Agro. Avant, le formulaire ne parlait qu'événement, même pour un lot
 * de fournitures.
 *
 * La valeur envoyée reste le libellé complet de la branche, inchangé : les
 * demandes déjà enregistrées restent comparables aux nouvelles.
 */
const tuile = (page: import('@playwright/test').Page, nom: RegExp) =>
  page.getByRole('radio', { name: nom })

/**
 * L'`input` est masqué sous son étiquette (`sr-only`) : c'est l'étiquette
 * qu'un visiteur touche, et c'est elle qu'on clique ici.
 */
const choisir = (page: import('@playwright/test').Page, nom: RegExp) =>
  page.locator('label', { has: tuile(page, nom) }).click()

test.describe('formulaire adapté à la branche', () => {
  test('Événementiel par défaut, avec ses champs', async ({ page }) => {
    await page.goto('/contact')
    await pageInteractive(page)

    await expect(tuile(page, /Événementiel/)).toBeChecked()
    await expect(page.locator('#field-requestType')).toHaveValue('Mariage')
    await expect(page.locator('#field-eventDate')).toBeVisible()
    await expect(page.locator('#field-guestCount')).toBeVisible()
    await expect(page.locator('#field-domaine')).toHaveCount(0)
  })

  test('les champs suivent la tuile choisie', async ({ page }) => {
    await page.goto('/contact')
    await pageInteractive(page)

    await choisir(page, /Équipements/)
    await expect(page.locator('#field-domaine')).toBeVisible()
    await expect(page.locator('#field-quantites')).toBeVisible()
    await expect(page.locator('#field-eventDate')).toHaveCount(0)
    // Treize domaines dans le sélecteur, plus l'invite.
    await expect(page.locator('#field-domaine option')).toHaveCount(14)

    await choisir(page, /Études/)
    await expect(page.locator('#field-objet')).toBeVisible()
    await expect(page.locator('#field-echeance')).toBeVisible()

    await choisir(page, /Agro/)
    await expect(page.locator('#field-culture')).toBeVisible()
    await expect(page.locator('#field-surface')).toBeVisible()
    await expect(page.locator('#field-saison')).toBeVisible()
  })

  /**
   * Les quatre branches, et le libellé envoyé pour chacune. Le corps est
   * intercepté avant le serveur : c'est la donnée que l'équipe recevra.
   */
  for (const [slug, nom, libelle, type] of [
    ['evenementiel', /Événementiel/, 'TBS Événementiel — location de matériel de réception', 'Mariage'],
    ['equipements', /Équipements/, 'TBS Équipements — fourniture de matériels & équipements', 'Fourniture / marché public'],
    ['etudes', /Études/, 'TBS Études & Conseils — études & prestations intellectuelles', 'Autre'],
    ['agro-business', /Agro/, 'TBS Agro Business — agriculture & agro-industrie', 'Autre'],
  ] as const) {
    test(`?branche=${slug} préremplit la tuile et envoie la bonne branche`, async ({ page }) => {
      await page.goto(`/contact?branche=${slug}`)
      await pageInteractive(page)

      await expect(tuile(page, nom)).toBeChecked()

      const envoi = page.waitForRequest(r => r.url().includes('/api/quotes') && r.method() === 'POST')
      await page.getByLabel('Nom complet').fill('Akouvi Adjovi')
      await page.getByLabel('Téléphone').fill('+228 90 10 85 10')
      await page.getByLabel('Votre besoin').fill('Un besoin précis, décrit en une phrase.')
      await page.waitForTimeout(2500)
      await page.getByRole('button', { name: 'Envoyer ma demande' }).click()

      const corps = JSON.parse((await envoi).postData() ?? '{}')
      expect(corps.branch).toBe(libelle)
      expect(corps.requestType).toBe(type)
    })
  }

  test('les champs propres à la branche partent dans les détails', async ({ page }) => {
    await page.goto('/contact?branche=equipements')
    await pageInteractive(page)

    await page.locator('#field-domaine').selectOption({ index: 1 })
    await page.locator('#field-quantites').fill('40 postes, livraison en mars')

    const envoi = page.waitForRequest(r => r.url().includes('/api/quotes') && r.method() === 'POST')
    await page.getByLabel('Nom complet').fill('Akouvi Adjovi')
    await page.getByLabel('Téléphone').fill('+228 90 10 85 10')
    await page.getByLabel('Votre besoin').fill('Équiper un plateau de quarante postes.')
    await page.waitForTimeout(2500)
    await page.getByRole('button', { name: 'Envoyer ma demande' }).click()

    const corps = JSON.parse((await envoi).postData() ?? '{}')
    expect(corps.details).toMatchObject({ 'Quantités / échéance souhaitée': '40 postes, livraison en mars' })
    expect(Object.keys(corps.details)).toContain('Domaine')
  })
})
