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

  test('le titre et la méta-description de l’accueil', async ({ page }) => {
    await page.goto('/')
    const description = await page.locator('meta[name=description]').getAttribute('content')
    expect(description).toContain('TBS Événementiel')
    expect(description).toContain('TBS Agro Business')
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
   * Le 301 doit être dans la chaîne HTTP. Un simple remplacement d'historique
   * côté client passerait un test qui ne regarde que l'URL finale — et ne
   * dirait rien à un moteur de recherche.
   */
  async function suit(page: import('@playwright/test').Page, depuis: string) {
    const reponse = await page.goto(depuis)
    const chaine = reponse?.request().redirectedFrom()
    expect(chaine, `aucune redirection HTTP pour ${depuis}`).toBeTruthy()
    return page.url()
  }

  test('le paramètre ?branche= sur /services et /galerie', async ({ page }) => {
    expect(await suit(page, '/services?branche=events')).toMatch(/branche=evenementiel$/)
    expect(await suit(page, '/services?branche=agro')).toMatch(/branche=agro-business$/)
  })

  test('le segment de route des pages domaine', async ({ page }) => {
    expect(await suit(page, '/galerie/events/location-reception'))
      .toMatch(/\/galerie\/evenementiel\/location-reception$/)
  })

  /**
   * Le cas composé : l'ancien nom **et** l'ancienne forme d'adresse. Deux
   * sauts successifs — le renommage puis la route domaine — et le visiteur
   * doit arriver au bon endroit sans le savoir.
   */
  test('l’ancienne adresse complète, nom et forme', async ({ page }) => {
    expect(await suit(page, '/galerie?branche=events&domaine=location-reception'))
      .toMatch(/\/galerie\/evenementiel\/location-reception$/)
  })

  test('le formulaire de devis reçoit la bonne branche', async ({ page }) => {
    await suit(page, '/contact?branche=events')
    await pageInteractive(page)
    await expect(page.locator('#field-branch')).toHaveValue(/TBS Événementiel/)
  })
})
