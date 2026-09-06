import { describe, expect, it } from 'vitest'
import {
  SIZES_FULL,
  SIZES_HALF_LG,
  SIZES_HALF_MD,
  SIZES_LIGHTBOX,
  SIZES_THIRD,
  SIZES_THIRD_MD,
} from '../../app/utils/imageSizes'

const SCREENS = ['xs', 'sm', 'md', 'lg', 'xl', 'xxl', '2xl']

const ALL = {
  SIZES_FULL,
  SIZES_HALF_MD,
  SIZES_HALF_LG,
  SIZES_THIRD,
  SIZES_THIRD_MD,
  SIZES_LIGHTBOX,
}

/**
 * Ces tests gardent un bug qui a déjà coûté cher : un jeton `sizes` sans
 * préfixe d'écran — `sizes="100vw"` — n'est pas compris par @nuxt/image, qui
 * produit alors un `srcset` de deux entrées, `1w` et `2w`. La page se charge,
 * l'image fait un ou deux pixels, et rien ne signale l'erreur.
 */
describe('chaînes sizes', () => {
  it.each(Object.entries(ALL))('%s qualifie les sept points de rupture', (_name, value) => {
    const tokens = value.split(' ')
    expect(tokens).toHaveLength(SCREENS.length)
    expect(tokens.map(t => t.split(':')[0])).toEqual(SCREENS)
  })

  it.each(Object.entries(ALL))('%s ne contient aucun jeton nu', (_name, value) => {
    for (const token of value.split(' ')) {
      expect(token).toMatch(/^[a-z0-9]+:\d+(vw|px)$/)
    }
  })

  it('reporte la largeur de base jusqu’au premier remplacement', () => {
    expect(SIZES_HALF_MD).toBe('xs:100vw sm:100vw md:50vw lg:50vw xl:50vw xxl:50vw 2xl:50vw')
  })

  it('enchaîne deux remplacements dans l’ordre des écrans', () => {
    expect(SIZES_THIRD).toBe('xs:100vw sm:50vw md:50vw lg:33vw xl:33vw xxl:33vw 2xl:33vw')
  })

  it('laisse la pleine largeur sans remplacement', () => {
    expect(SIZES_FULL).toBe('xs:100vw sm:100vw md:100vw lg:100vw xl:100vw xxl:100vw 2xl:100vw')
  })
})
