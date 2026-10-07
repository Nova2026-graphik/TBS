import { expect, test } from '@playwright/test'
import { pageInteractive } from './utils'

/**
 * Pages produits des domaines, et redirection des anciennes adresses.
 *
 * Ce que ces tests gardent, c'est ce qui s'est cassé en chemin : la page
 * enfant qui ne s'affichait pas parce que `galerie.vue` et `galerie/` formaient
 * une route imbriquée, et la redirection qui ne partait jamais parce qu'un
 * middleware Vue ne s'exécute pas devant un fichier pré-rendu. Deux pannes
 * silencieuses — la page répondait 200 dans les deux cas.
 */
test.describe('page domaine', () => {
  test('affiche les références du domaine, paginées', async ({ page }) => {
    await page.goto('/galerie/equipements/mobilier-bureau')
    await pageInteractive(page)

    // C'est bien la page domaine, et non la galerie servie à sa place.
    await expect(page.getByRole('heading', { level: 1 })).toContainText('Mobilier')
    await expect(page).toHaveTitle(/Mobilier.*TBS Équipements/)

    // Dix-neuf références, douze à la première page puis sept.
    await expect(page.locator('main')).toContainText('19 références')
    const cartes = page.locator('ul li button:has-text("Aperçu")')
    await expect(cartes).toHaveCount(12)

    await page.getByRole('navigation', { name: /Pages de références/i })
      .getByRole('button', { name: '2', exact: true }).click()
    await expect(cartes).toHaveCount(7)
  })

  test('filtre par famille sans quitter la page', async ({ page }) => {
    await page.goto('/galerie/equipements/mobilier-bureau')
    await pageInteractive(page)

    await page.getByRole('button', { name: 'Sièges', exact: true }).click()
    await expect(page).toHaveURL(/famille=Si%C3%A8ges|famille=Sièges/)

    // Le filtre restreint réellement : moins que les douze de la page pleine.
    const cartes = page.locator('ul li button:has-text("Aperçu")')
    expect(await cartes.count()).toBeLessThan(12)
    // Le DOM porte « Sièges » : les capitales viennent de la feuille de style.
    await expect(page.locator('[data-refs], ul').filter({ hasText: 'Sièges' }).first()).toBeVisible()
  })

  test('la fiche rapide s’ouvre, se parcourt et se ferme', async ({ page }) => {
    await page.goto('/galerie/equipements/mobilier-bureau')
    await pageInteractive(page)

    await page.locator('ul li button:has-text("Aperçu")').first().click()
    const fiche = page.getByRole('dialog')
    await expect(fiche).toBeVisible()
    await expect(fiche).toContainText('Référence 1 / 19')
    await expect(fiche).toContainText('sur devis')

    await page.keyboard.press('ArrowRight')
    await expect(fiche).toContainText('Référence 2 / 19')

    await page.keyboard.press('Escape')
    await expect(fiche).toBeHidden()
  })

  test('les quatre branches ont chacune une page qui répond', async ({ page }) => {
    for (const [url, attendu] of [
      ['/galerie/equipements/generateurs', 'Groupes électrogènes'],
      ['/galerie/events/location-reception', 'Location'],
      ['/galerie/etudes/etudes-prestations', 'Études'],
      ['/galerie/agro/agro-industrie', 'Agriculture'],
    ] as const) {
      const reponse = await page.goto(url)
      expect(reponse?.status(), url).toBe(200)
      await expect(page.getByRole('heading', { level: 1 })).toContainText(attendu)
    }
  })

  /**
   * Le bouton de devis passait l'identifiant interne (`events`, `agro`) : la
   * page de contact le comprenait, mais seulement au bout d'une redirection
   * 301 — un aller-retour réseau de plus à chaque clic, sur mobile au Togo.
   */
  test('le bouton de devis nomme la branche par son adresse publique', async ({ page }) => {
    for (const [url, attendu] of [
      ['/galerie/evenementiel/organisation', 'evenementiel'],
      ['/galerie/agro-business/agro-industrie', 'agro-business'],
    ] as const) {
      await page.goto(url)
      const href = await page.locator('main a[href^="/contact"]').last().getAttribute('href')
      expect(new URL(href!, 'http://x').searchParams.get('branche'), url).toBe(attendu)
    }
  })

  test('les références d’exemple sont signalées', async ({ page }) => {
    await page.goto('/galerie/agro/agro-industrie')
    await pageInteractive(page)
    await expect(page.locator('main')).toContainText(/exemple/i)
  })

  /**
   * Un couple qui nomme deux choses réelles sans nommer un domaine réel :
   * `informatique` existe, `events` existe, mais pas ensemble. Sans ce
   * contrôle, deux adresses rendraient la même page.
   */
  test('une adresse qui ne désigne rien répond 404', async ({ page }) => {
    for (const url of ['/galerie/events/informatique', '/galerie/inconnue/inconnu']) {
      const reponse = await page.goto(url)
      expect(reponse?.status(), url).toBe(404)
    }
  })
})

test.describe('anciennes adresses de domaine', () => {
  test('redirigent en 301 vers la page du domaine', async ({ page }) => {
    const reponse = await page.goto('/galerie?branche=equipements&domaine=sante-laboratoire')
    await expect(page).toHaveURL(/\/galerie\/equipements\/sante-laboratoire$/)

    // La chaîne de redirection doit contenir un vrai 301, et non un simple
    // remplacement d'historique côté client.
    const requete = reponse?.request()
    const chaine = requete?.redirectedFrom()
    expect(chaine, 'aucune redirection HTTP').toBeTruthy()
    expect((await chaine!.response())?.status()).toBe(301)
  })

  /**
   * La redirection partait d'un hook qui ne pouvait pas arrêter la suite :
   * les en-têtes de sécurité, posés après, tombaient sur une réponse déjà
   * envoyée — 301 sans HSTS, et deux erreurs 500 au journal à chaque visite.
   */
  test('portent les en-têtes de sécurité, comme toute réponse', async ({ request }) => {
    for (const url of [
      '/galerie?branche=equipements&domaine=mobilier-bureau',
      '/galerie/events/location-reception',
      '/services?branche=agro',
    ]) {
      const reponse = await request.get(url, { maxRedirects: 0 })
      expect(reponse.status(), url).toBe(301)
      expect(reponse.headers()['x-content-type-options'], url).toBe('nosniff')
      expect(reponse.headers()['x-frame-options'], url).toBe('DENY')
    }
  })

  test('gardent les autres paramètres', async ({ page }) => {
    await page.goto('/galerie?branche=equipements&domaine=mobilier-bureau&famille=Si%C3%A8ges')
    await expect(page).toHaveURL(/\/galerie\/equipements\/mobilier-bureau\?famille=/)
  })

  test('laissent les filtres de la galerie tranquilles', async ({ page }) => {
    for (const url of ['/galerie?filtre=decor', '/galerie?branche=equipements']) {
      await page.goto(url)
      await expect(page, url).toHaveURL(new RegExp(`${url.split('?')[1]!.replace(/=/g, '=')}$`))
    }
  })
})

test.describe('depuis la galerie', () => {
  test('cliquer un domaine mène à sa page', async ({ page }) => {
    await page.goto('/galerie')
    await pageInteractive(page)

    const lien = page.locator('a[href$="/galerie/equipements/informatique"]').first()
    await lien.scrollIntoViewIfNeeded()
    await lien.click()

    await expect(page).toHaveURL(/\/galerie\/equipements\/informatique$/)
    await expect(page.getByRole('heading', { level: 1 })).toContainText('informatique')
  })

  test('la galerie n’injecte plus la liste sous les photos', async ({ page }) => {
    await page.goto('/galerie')
    await pageInteractive(page)
    await expect(page.locator('main')).not.toContainText('Ce que ce domaine couvre')
  })
})
