import { expect, test } from '@playwright/test'

/**
 * Filtrage de la galerie par branche et par domaine.
 *
 * Les vignettes de la grille sont les `<li>` de la liste en grille — la page
 * en contient d'autres (filtres, secteurs), d'où le sélecteur précis.
 */
const grille = 'section ul[class*=grid] > li'

test.describe('galerie filtrée par métier', () => {
  test('un lien de domaine ne montre que ses réalisations', async ({ page }) => {
    await page.goto('/galerie?branche=equipements&domaine=informatique')

    await expect(page.locator(grille)).toHaveCount(1)
    await expect(page.getByText(/Réalisations de TBS Équipements — Matériel informatique/)).toBeVisible()
  })

  test('une branche seule regroupe tous ses domaines', async ({ page }) => {
    await page.goto('/galerie?branche=equipements')

    // Quatre réalisations Équipements : informatique, bureau, laboratoire, roulant.
    await expect(page.locator(grille)).toHaveCount(4)
  })

  test('un domaine sans réalisation explique au lieu d’afficher le vide', async ({ page }) => {
    // La branche Études n'a aucune réalisation publiée — c'est le cas réel, pas
    // une hypothèse : l'écran vide doit donc être soigné.
    await page.goto('/galerie?branche=etudes&domaine=etudes-prestations')

    await expect(page.locator(grille)).toHaveCount(0)
    await expect(page.getByRole('heading', { name: /Aucune réalisation publiée/ })).toBeVisible()
    await expect(page.getByRole('link', { name: /Décrire mon projet/ })).toBeVisible()
  })

  test('une valeur inconnue ramène au catalogue complet', async ({ page }) => {
    await page.goto('/galerie?branche=nimportequoi&domaine=nimportequoi')

    // Premier lot de neuf vignettes, aucun bandeau de filtre.
    await expect(page.locator(grille)).toHaveCount(9)
    await expect(page.getByRole('button', { name: /Voir toute la galerie/ })).toHaveCount(0)
  })

  test('un domaine hors de sa branche est ignoré', async ({ page }) => {
    // `roulant` appartient à Équipements : le préciser sur Events ne décrit
    // rien, et la branche seule doit l'emporter.
    await page.goto('/galerie?branche=events&domaine=roulant')

    await expect(page.locator(grille)).toHaveCount(9)
    await expect(page.getByText(/Réalisations de TBS Events$/)).toBeVisible()
  })

  test('les deux familles de filtre s’excluent', async ({ page }) => {
    await page.goto('/galerie?branche=equipements&domaine=roulant')
    await page.getByRole('button', { name: 'Mariages' }).click()

    await expect(page).toHaveURL(/filtre=mariage/)
    await expect(page).not.toHaveURL(/branche=/)
    await expect(page.getByRole('button', { name: /Voir toute la galerie/ })).toHaveCount(0)
  })

  test('le filtre se retire et rend le catalogue', async ({ page }) => {
    await page.goto('/galerie?branche=equipements&domaine=roulant')
    await page.getByRole('button', { name: /Voir toute la galerie/ }).click()

    await expect(page).toHaveURL(/\/galerie$/)
    await expect(page.locator(grille)).toHaveCount(9)
  })

  test('depuis les secteurs, un clic filtre la galerie', async ({ page }) => {
    await page.goto('/galerie')

    const lien = page.getByRole('link', { name: /Matériel roulant/ }).first()
    await lien.scrollIntoViewIfNeeded()
    await lien.click()

    await expect(page).toHaveURL(/branche=equipements&domaine=roulant/)
    await expect(page.locator(grille)).toHaveCount(1)
  })
})
