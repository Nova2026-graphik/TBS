import { expect, test } from '@playwright/test'

/**
 * Le parcours qui rapporte : une demande de devis envoyée de bout en bout.
 *
 * Le délai minimum de deux secondes est une vraie contrainte du serveur — le
 * test attend donc réellement, comme un visiteur.
 */
test.describe('demande de devis', () => {
  test('envoie une demande complète et affiche la confirmation', async ({ page }) => {
    await page.goto('/contact')

    await page.getByLabel('Nom complet').fill('Akouvi Adjovi')
    await page.getByLabel('Téléphone').fill('+228 90 10 85 10')
    await page.getByLabel('E-mail').fill('akouvi@example.tg')
    await page.getByLabel('Votre besoin').fill('Dressage de 200 couverts, nappage et sonorisation.')

    // Le serveur rejette en silence tout envoi de moins de deux secondes.
    await page.waitForTimeout(2500)
    await page.getByRole('button', { name: 'Envoyer ma demande' }).click()

    await expect(page.getByRole('heading', { name: 'Demande envoyée' })).toBeVisible()
  })

  test('signale les champs manquants sans quitter la page', async ({ page }) => {
    await page.goto('/contact')

    await page.waitForTimeout(2500)
    await page.getByRole('button', { name: 'Envoyer ma demande' }).click()

    await expect(page.getByText('Indiquez votre nom.')).toBeVisible()
    await expect(page.getByRole('heading', { name: 'Demande envoyée' })).toBeHidden()
  })

  test('accepte sans broncher un envoi qui remplit le champ piège', async ({ page }) => {
    await page.goto('/contact')

    await page.getByLabel('Nom complet').fill('Robot Test')
    await page.getByLabel('Téléphone').fill('+228 90 10 85 10')
    await page.getByLabel('Votre besoin').fill('Message automatisé de test.')
    await page.locator('input[tabindex="-1"]').first().fill('ACME Corp')

    await page.waitForTimeout(2500)
    await page.getByRole('button', { name: 'Envoyer ma demande' }).click()

    // Succès silencieux côté visiteur : rien ne doit renseigner l'attaquant.
    await expect(page.getByRole('heading', { name: 'Demande envoyée' })).toBeVisible()
  })
})
