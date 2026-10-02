import { expect, test } from '@playwright/test'
import { pageInteractive } from './utils'

/**
 * Le parcours qui rapporte : une demande de devis envoyée de bout en bout.
 *
 * Le délai minimum de deux secondes est une vraie contrainte du serveur — le
 * test attend donc réellement, comme un visiteur.
 */
test.describe('demande de devis', () => {
  test('envoie une demande complète et affiche la confirmation', async ({ page }) => {
    await page.goto('/contact')
    await pageInteractive(page)

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
    await pageInteractive(page)

    await page.waitForTimeout(2500)
    await page.getByRole('button', { name: 'Envoyer ma demande' }).click()

    /**
     * Le message apparaît à deux endroits — le résumé en tête de formulaire et
     * sous le champ — d'où deux assertions distinctes plutôt qu'une recherche
     * de texte, qui serait ambiguë. C'est aussi ce qui vérifie que les deux
     * chemins restent en place.
     */
    const resume = page.getByRole('alert')
    await expect(resume).toBeVisible()
    await expect(resume).toContainText('3 champs à corriger')
    await expect(resume.getByRole('link', { name: /Nom complet/ })).toBeVisible()

    await expect(page.locator('#err-name')).toHaveText('Indiquez votre nom.')
    await expect(page.getByRole('heading', { name: 'Demande envoyée' })).toBeHidden()
  })

  test('le résumé d’erreurs reçoit le focus et mène au champ', async ({ page }) => {
    await page.goto('/contact')
    await pageInteractive(page)

    await page.waitForTimeout(2500)
    await page.getByRole('button', { name: 'Envoyer ma demande' }).click()

    // Le focus part sur le résumé, pas sur le premier champ : l'utilisateur
    // entend le bilan avant d'entrer dans le détail.
    await expect(page.getByRole('alert')).toBeFocused()

    await page.getByRole('link', { name: /Téléphone/ }).click()
    await expect(page.locator('#field-phone')).toBeFocused()
  })

  test('accepte sans broncher un envoi qui remplit le champ piège', async ({ page }) => {
    await page.goto('/contact')
    await pageInteractive(page)

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
