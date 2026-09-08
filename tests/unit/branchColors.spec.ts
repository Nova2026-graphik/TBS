import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
import { brandColor, brandTextColor } from '../../shared/utils/branchColors'
import { BRANCH_TABS } from '../../shared/utils/siteData'

/**
 * Les couleurs de branche vivent dans les données en hexadécimal, et sont
 * traduites en jetons de thème au moment du rendu. Deux liens sont donc à
 * tenir, et aucun des deux ne casse bruyamment :
 *
 *  - une couleur ajoutée ou changée dans `siteData.ts` sans être reportée dans
 *    `branchColors.ts` traverserait la traduction inchangée, et cette branche
 *    resterait couleur sable sur un site passé au bleu ;
 *  - un jeton renommé dans `main.css` laisserait un `var()` sans définition,
 *    et la pastille tomberait sur sa valeur de repli, elle aussi sable.
 *
 * Ces trois épreuves échouent là où le rendu, lui, se contenterait d'avoir
 * l'air un peu faux.
 */

const CSS = readFileSync(
  fileURLToPath(new URL('../../app/assets/css/main.css', import.meta.url)),
  'utf8',
)

/** `var(--jeton, repli)` → `['--jeton', 'repli']`. */
function parseVar(value: string): [string, string] {
  const match = /^var\((--[a-z-]+),\s*(#[0-9a-f]{6})\)$/.exec(value)
  expect(match, `« ${value} » n'est pas un var() avec repli`).not.toBeNull()
  return [match![1]!, match![2]!]
}

describe('couleurs de branche', () => {
  it('traduisent chaque couleur de la charte en jeton de thème', () => {
    for (const tab of BRANCH_TABS) {
      expect(brandColor(tab.color), tab.slug).toMatch(/^var\(--color-/)
      expect(brandTextColor(tab.color), tab.slug).toMatch(/^var\(--color-/)
    }
  })

  it('ne renvoient que des jetons définis dans la feuille de style', () => {
    for (const tab of BRANCH_TABS) {
      for (const value of [brandColor(tab.color), brandTextColor(tab.color)]) {
        const [token] = parseVar(value)
        expect(CSS, `${tab.slug} : ${token} absent de main.css`).toContain(`${token}:`)
      }
    }
  })

  it('gardent la couleur d’origine en valeur de repli', () => {
    for (const tab of BRANCH_TABS) {
      const [, fallback] = parseVar(brandColor(tab.color))
      expect(fallback, tab.slug).toBe(tab.color.toLowerCase())
    }
  })

  it('laissent passer une couleur étrangère à la charte', () => {
    // Le vert de WhatsApp : hors charte, il ne doit pas être réécrit.
    expect(brandColor('#25D366')).toBe('#25D366')
    expect(brandTextColor('#25D366')).toBe('#25D366')
  })
})
