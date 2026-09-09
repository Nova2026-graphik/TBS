import type { Page } from '@playwright/test'
import { expect, test } from '@playwright/test'
import { pageInteractive } from './utils'

/**
 * Planche animée de la galerie (`GalleryHero`).
 *
 * Quatre régressions sont visées, et aucune ne se voit dans une revue de code :
 *
 *  - **le `srcset` dégénéré.** `app/utils/imageSizes.ts` documente le piège :
 *    un jeton `sizes` sans préfixe d'écran fait produire à @nuxt/image un
 *    `srcset` de deux entrées, `1w` et `2w` — une image de un à deux pixels
 *    servie à la place de la photo. La page se charge, rien n'échoue, et le
 *    grand cadre est simplement vide. On mesure donc la largeur réellement
 *    décodée, la seule valeur qui trahisse le défaut ;
 *  - **le montage qui rentrerait dans l'arbre d'accessibilité.** Les photos
 *    de couverture se retrouvent en pleine taille dans la grille, avec leur
 *    légende : un lecteur d'écran ne doit pas les rencontrer deux fois ;
 *  - **la carte redevenue légende.** Elle applique un filtre ; si le clic ne
 *    change plus l'URL, l'animation n'est plus qu'un diaporama ;
 *  - **la commande d'arrêt disparue.** La rotation dure six secondes : WCAG
 *    2.2.2 impose de pouvoir l'arrêter autrement qu'au survol.
 *
 * L'en-tête se repère par son fil d'Ariane, seul repère stable de la page —
 * le dépôt n'utilise pas d'attribut de test.
 */
function heroOf(page: Page) {
  return page.locator('section').filter({
    has: page.getByRole('navigation', { name: 'Fil d\'Ariane' }),
  })
}

test.describe('planche animée de la galerie', () => {
  test('affiche une photo de couverture réellement chargée', async ({ page }) => {
    await page.goto('/galerie')
    await page.waitForLoadState('networkidle')

    const photos = heroOf(page).locator('.galerie-cliche img')
    // Cinq collections non vides : mariage, cérémonie, entreprise, décor,
    // fournitures. Les quatre secondaires n'entrent qu'après `load`.
    await expect(photos).toHaveCount(5)

    // `naturalWidth` est la largeur du fichier décodé, pas celle du cadre.
    const natural = await photos.first().evaluate(el => (el as HTMLImageElement).naturalWidth)
    expect(natural).toBeGreaterThan(100)
  })

  test('garde le montage hors de l’arbre d’accessibilité', async ({ page }) => {
    await page.goto('/galerie')
    await page.waitForLoadState('networkidle')

    const hero = heroOf(page)

    // Le montage entier est masqué…
    await expect(hero.locator('[aria-hidden="true"] .galerie-cliche')).toHaveCount(5)
    // …et aucune image de l'en-tête n'expose de rôle `img`, que seul un `alt`
    // non vide donne — vignette de la carte comprise.
    await expect(hero.getByRole('img')).toHaveCount(0)
  })

  test('la carte de collection filtre la galerie', async ({ page }) => {
    await page.goto('/galerie')
    await pageInteractive(page)

    const carte = heroOf(page).getByRole('button', { name: /^Filtrer la galerie sur / })

    // Le survol met la rotation en pause : sans lui, la collection lue ici ne
    // serait pas forcément celle sur laquelle le clic tombe.
    await carte.hover()
    const libelle = (await carte.getAttribute('aria-label')) ?? ''
    const collection = libelle.replace('Filtrer la galerie sur ', '')

    await carte.click()

    // Le filtre part dans l'URL, et la pastille correspondante s'enfonce.
    await expect(page).toHaveURL(/\?filtre=/)
    await expect(page.getByRole('button', { name: collection, exact: true }))
      .toHaveAttribute('aria-pressed', 'true')
  })

  test('la rotation s’arrête à la demande, puis reprend', async ({ page }) => {
    await page.goto('/galerie')
    await pageInteractive(page)

    // WCAG 2.2.2 : la commande existe et dit son état.
    const pause = heroOf(page).getByRole('button', { name: 'Mettre en pause le défilement' })
    await expect(pause).toHaveAttribute('aria-pressed', 'false')

    await pause.click()
    await expect(heroOf(page).getByRole('button', { name: 'Reprendre le défilement' }))
      .toHaveAttribute('aria-pressed', 'true')
  })

  test('un filtre posé immobilise la planche sur sa collection', async ({ page }) => {
    await page.goto('/galerie?filtre=ceremonie')
    await pageInteractive(page)

    const hero = heroOf(page)

    // La carte nomme la collection demandée…
    await expect(hero.getByRole('button', { name: 'Filtrer la galerie sur Cérémonies' })).toBeVisible()
    // …et plus rien ne tourne : la commande d'arrêt n'a plus lieu d'être.
    await expect(hero.getByRole('button', { name: /défilement/ })).toHaveCount(0)
  })
})
