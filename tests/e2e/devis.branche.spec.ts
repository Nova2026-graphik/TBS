import { expect, test } from '@playwright/test'

/**
 * Déduction de la branche à partir du type de demande.
 *
 * Les deux listes se recouvraient : « Mariage » implique TBS Events, et le
 * confirmer en dessous était une question pour rien. Ces tests gardent les
 * trois cas qui comptent — la déduction, l'ambiguïté qui ramène le champ, et
 * le lien qui prime sur la déduction.
 */
test.describe('branche déduite du type de demande', () => {
  test('le sélecteur disparaît quand le type désigne la branche', async ({ page }) => {
    await page.goto('/contact')

    await expect(page.locator('#field-requestType')).toHaveValue('Mariage')
    await expect(page.locator('#field-branch')).toHaveCount(0)

    // Huit intitulés visibles au lieu de neuf.
    await expect(page.locator('form label[for^="field-"]')).toHaveCount(8)
  })

  test('il revient sur un type ambigu', async ({ page }) => {
    await page.goto('/contact')

    await page.locator('#field-requestType').selectOption('Fourniture / marché public')
    await expect(page.locator('#field-branch')).toBeVisible()

    await page.locator('#field-requestType').selectOption('Autre')
    await expect(page.locator('#field-branch')).toBeVisible()

    await page.locator('#field-requestType').selectOption('Cérémonie / baptême')
    await expect(page.locator('#field-branch')).toHaveCount(0)
  })

  test('la valeur envoyée reste la chaîne d’origine', async ({ page }) => {
    await page.goto('/contact')

    const envoi = page.waitForRequest(r => r.url().includes('/api/quotes') && r.method() === 'POST')

    await page.getByLabel('Nom complet').fill('Akouvi Adjovi')
    await page.getByLabel('Téléphone').fill('+228 90 10 85 10')
    await page.getByLabel('Votre besoin').fill('Dressage de 200 couverts, nappage et sonorisation.')
    await page.waitForTimeout(2500)
    await page.getByRole('button', { name: 'Envoyer ma demande' }).click()

    const corps = JSON.parse((await envoi).postData() ?? '{}')
    // Les demandes déjà enregistrées doivent rester comparables aux nouvelles.
    expect(corps.branch).toBe('TBS Events — location de matériel de réception')
    expect(corps.requestType).toBe('Mariage')
  })

  test('un lien ?branche= prime et reste visible', async ({ page }) => {
    await page.goto('/contact?branche=agro')

    // Une valeur imposée que le visiteur ne pourrait ni voir ni corriger
    // vaudrait moins que la question elle-même.
    await expect(page.locator('#field-branch')).toBeVisible()
    await expect(page.locator('#field-branch')).toHaveValue(/TBS Agro/)

    await page.locator('#field-requestType').selectOption('Mariage')
    await expect(page.locator('#field-branch')).toHaveValue(/TBS Agro/)
  })
})
