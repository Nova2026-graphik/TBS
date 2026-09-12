import { expect, test } from '@playwright/test'
import { pageInteractive } from './utils'

/**
 * Renommage des branches : « Events » → « Événementiel », « Agro » → « Agro
 * Business ».
 *
 * L'identifiant interne n'a pas bougé — `events` et `agro` restent les clés du
 * code et du type énuméré PostgreSQL. Seuls le nom affiché et le segment
 * d'URL changent. Ces tests tiennent la frontière entre les deux vocabulaires :
 * le public dans l'adresse et à l'écran, l'interne nulle part visible.
 */

/** Ce qu'un visiteur doit voir, et ne plus voir. */
test.describe('les nouveaux noms s’affichent', () => {
  test('sur l’accueil, la barre du haut et le pied de page', async ({ page }) => {
    await page.goto('/')
    await pageInteractive(page)

    await expect(page.locator('body')).toContainText('Événementiel')
    await expect(page.locator('body')).toContainText('Agro Business')

    // L'ancien nom ne subsiste nulle part — « Agro Business » contient
    // « Agro », d'où la limite de mot explicite.
    const texte = await page.locator('body').innerText()
    expect(texte).not.toMatch(/TBS Events/)
    expect(texte).not.toMatch(/TBS Agro(?! Business)/)
  })

  test('sur la galerie et ses panneaux de secteur', async ({ page }) => {
    await page.goto('/galerie')
    await pageInteractive(page)

    const texte = await page.locator('body').innerText()
    expect(texte).toContain('TBS Événementiel')
    expect(texte).toContain('TBS Agro Business')
    expect(texte).not.toMatch(/TBS Events/)
  })

  test('dans les méta-descriptions qui nomment les branches', async ({ page }) => {
    // Toutes ne les nomment pas : celle de l'accueil énumère les métiers sans
    // citer les marques. On vérifie donc les deux qui les citent vraiment.
    await page.goto('/galerie')
    await expect(page.locator('meta[name=description]'))
      .toHaveAttribute('content', /TBS Événementiel/)

    await page.goto('/services')
    await expect(page.locator('meta[name=description]'))
      .toHaveAttribute('content', /TBS Événementiel.*TBS Agro Business/s)

    // Un `<title>` vit dans le `<head>` : il n'a pas de texte rendu, et
    // `toHaveText` y lirait une chaîne vide. `toHaveTitle` lit le document.
    await page.goto('/conditions-de-location')
    await expect(page).toHaveTitle(/TBS Distribution/)
    await expect(page.locator('meta[name=description]'))
      .toHaveAttribute('content', /TBS Événementiel/)
  })
})

test.describe('les nouvelles adresses fonctionnent', () => {
  test('sur /services', async ({ page }) => {
    for (const [url, onglet] of [
      ['/services?branche=evenementiel', /Événementiel/i],
      ['/services?branche=agro-business', /Agro Business/i],
    ] as const) {
      const reponse = await page.goto(url)
      expect(reponse?.status(), url).toBe(200)
      await pageInteractive(page)
      await expect(page.getByRole('tab', { name: onglet })).toHaveAttribute('aria-selected', 'true')
    }
  })

  test('sur les pages domaine', async ({ page }) => {
    for (const [url, titre] of [
      ['/galerie/evenementiel/location-reception', /Location/],
      ['/galerie/agro-business/agro-industrie', /Agriculture/],
    ] as const) {
      const reponse = await page.goto(url)
      expect(reponse?.status(), url).toBe(200)
      await expect(page.getByRole('heading', { level: 1 })).toContainText(titre)
    }
  })
})

test.describe('les anciennes adresses redirigent en 301', () => {
  /**
   * Deux exigences, et chacune a sa raison d'être ici.
   *
   * Le **301 doit être dans la chaîne HTTP** : un remplacement d'historique
   * côté client passerait un test qui ne regarde que l'adresse finale, et ne
   * dirait rien à un moteur de recherche.
   *
   * Et l'adresse se lit avec `toHaveURL`, jamais avec `page.url()` juste après
   * le `goto` : pendant l'hydratation, Nuxt navigue brièvement vers le chemin
   * nu — `/services` sans sa requête — avant de rétablir l'adresse. Lire trop
   * tôt attrape cet état transitoire et fait échouer le test sur un code
   * pourtant correct. `toHaveURL` réessaie jusqu'à l'état stable.
   */
  async function arrive(
    page: import('@playwright/test').Page,
    depuis: string,
    vers: RegExp,
  ) {
    const reponse = await page.goto(depuis)
    const chaine = reponse?.request().redirectedFrom()
    expect(chaine, `aucune redirection HTTP pour ${depuis}`).toBeTruthy()
    expect((await chaine!.response())?.status(), depuis).toBe(301)
    await expect(page).toHaveURL(vers)
  }

  test('le paramètre ?branche= sur /services et /galerie', async ({ page }) => {
    await arrive(page, '/services?branche=events', /branche=evenementiel$/)
    await arrive(page, '/services?branche=agro', /branche=agro-business$/)
  })

  test('le segment de route des pages domaine', async ({ page }) => {
    await arrive(
      page,
      '/galerie/events/location-reception',
      /\/galerie\/evenementiel\/location-reception$/,
    )
  })

  /**
   * Le cas composé : l'ancien nom **et** l'ancienne forme d'adresse. Deux
   * sauts successifs — le renommage puis la route domaine — et le visiteur
   * doit arriver au bon endroit sans le savoir.
   */
  test('l’ancienne adresse complète, nom et forme', async ({ page }) => {
    await arrive(
      page,
      '/galerie?branche=events&domaine=location-reception',
      /\/galerie\/evenementiel\/location-reception$/,
    )
  })

  test('le formulaire de devis reçoit la bonne branche', async ({ page }) => {
    await arrive(page, '/contact?branche=events', /branche=evenementiel$/)
    await pageInteractive(page)
    await expect(page.locator('#field-branch')).toHaveValue(/TBS Événementiel/)
  })
})
