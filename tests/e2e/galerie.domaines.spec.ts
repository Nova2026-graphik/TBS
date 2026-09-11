import { expect, test } from '@playwright/test'
import { pageInteractive } from './utils'

/**
 * Filtrage de la galerie par branche, et sort réservé aux anciens liens.
 *
 * Ce fichier couvrait aussi le filtrage par domaine et la liste de références
 * injectée sous les photographies. Les deux ont disparu : un domaine a
 * maintenant sa page, et `?branche=…&domaine=…` y redirige. Ce qui les
 * concernait vit désormais dans `galerie.pages-domaine.spec.ts` — le garder
 * ici aurait laissé des tests qui décrivent une page morte.
 *
 * Reste ce que la galerie fait encore, et qui vaut d'être tenu : le filtre par
 * branche seule, et surtout le sort des adresses bancales — car une adresse
 * bancale ne doit pas devenir une erreur.
 */

/**
 * Une vignette est un element de liste qu'on peut ouvrir : c'est le bouton qui
 * declenche la visionneuse. Ce selecteur a casse deux fois pour avoir vise plus
 * large — d'abord `> li`, qui attrapait les liens de branche du pied de page,
 * puis `li:has(img)`, qui a cesse de discriminer le jour ou les references du
 * catalogue ont recu leur propre image. Le bouton, lui, n'appartient qu'aux
 * vignettes.
 */
const grille = 'section ul[class*=grid] > li:has(button)'

test.describe('galerie filtrée par métier', () => {
  test('une branche seule regroupe tous ses domaines', async ({ page }) => {
    await page.goto('/galerie?branche=equipements')

    // Quatre réalisations Équipements : informatique, bureau, laboratoire, roulant.
    await expect(page.locator(grille)).toHaveCount(4)
  })

  /**
   * Le cas qui a fait revoir la redirection.
   *
   * Un premier jet redirigeait dès que les deux paramètres ressemblaient à des
   * slugs, sans les confronter aux données : cette adresse partait donc vers un
   * 404. Elle rendait pourtant la galerie complète depuis toujours. Faire d'une
   * page qui marche une erreur, pour un lien mal recopié, est une régression.
   */
  test('une valeur inconnue ramène au catalogue complet', async ({ page }) => {
    await page.goto('/galerie?branche=nimportequoi&domaine=nimportequoi')

    await expect(page).toHaveURL(/\/galerie\?/)
    await expect(page.locator(grille)).toHaveCount(9)
    await expect(page.getByRole('button', { name: /Voir toute la galerie/ })).toHaveCount(0)
  })

  test('un domaine hors de sa branche ne redirige pas et reste ignoré', async ({ page }) => {
    // `roulant` appartient à Équipements : le préciser sur Events ne décrit
    // rien. Le couple n'existant pas, la galerie garde la main.
    await page.goto('/galerie?branche=events&domaine=roulant')

    await expect(page).toHaveURL(/branche=events/)
    await expect(page.locator(grille)).toHaveCount(9)
    await expect(page.getByText(/Réalisations de TBS Events$/)).toBeVisible()
  })

  test('les deux familles de filtre s’excluent', async ({ page }) => {
    await page.goto('/galerie?branche=equipements')
    await pageInteractive(page)
    await page.getByRole('button', { name: 'Mariages', exact: true }).click()

    await expect(page).toHaveURL(/filtre=mariage/)
    await expect(page).not.toHaveURL(/branche=/)
  })

  test('le filtre se retire et rend le catalogue', async ({ page }) => {
    await page.goto('/galerie?branche=equipements')
    await pageInteractive(page)
    await page.getByRole('button', { name: /Voir toute la galerie/ }).click()

    await expect(page).toHaveURL(/\/galerie$/)
    await expect(page.locator(grille)).toHaveCount(9)
  })

  test('une branche sans réalisation explique au lieu d’afficher le vide', async ({ page }) => {
    // La branche Études n'a aucune réalisation publiée — c'est le cas réel, pas
    // une hypothèse : l'écran vide doit donc être soigné.
    await page.goto('/galerie?branche=etudes')

    await expect(page.locator(grille)).toHaveCount(0)
    await expect(page.getByRole('heading', { name: /Aucune réalisation publiée/ })).toBeVisible()
    await expect(page.getByRole('link', { name: /Décrire mon projet/ })).toBeVisible()
  })
})
