import { describe, expect, it } from 'vitest'
import { branches as branchesEn } from '../../server/data/content.en'
import { branches as branchesFr } from '../../server/data/content'
import en from '../../i18n/locales/en.json'
import fr from '../../i18n/locales/fr.json'

/**
 * Le hero titre chaque branche. Une clé manquante ne casse rien — le
 * composant retombe sur la formule générale — mais le titre redevient
 * silencieusement générique, ce qui ne se voit qu'à l'œil, quinze secondes
 * toutes les minutes. D'où ces vérifications.
 */
const LOCALES = { fr, en } as const

describe('titres de branche du hero', () => {
  for (const [code, messages] of Object.entries(LOCALES)) {
    const branches = code === 'fr' ? branchesFr : branchesEn
    const titres = (messages as typeof fr).hero.branchTitles as Record<
      string,
      { line1: string, line2: string }
    >

    it(`couvre les quatre branches en ${code}`, () => {
      for (const branche of branches) {
        const titre = titres[branche.slug]
        expect(titre, `branche « ${branche.slug} » sans titre`).toBeDefined()
        expect(titre!.line1.length, `${branche.slug}.line1 vide`).toBeGreaterThan(0)
        expect(titre!.line2.length, `${branche.slug}.line2 vide`).toBeGreaterThan(0)
      }
    })

    it(`n'a pas de titre orphelin en ${code}`, () => {
      const slugs = branches.map(b => b.slug)
      for (const cle of Object.keys(titres)) {
        expect(slugs, `« ${cle} » ne correspond à aucune branche`).toContain(cle)
      }
    })
  }

  it('propose les mêmes branches dans les deux langues', () => {
    expect(Object.keys(en.hero.branchTitles)).toEqual(Object.keys(fr.hero.branchTitles))
  })

  it('garde la formule générale en repli', () => {
    for (const messages of Object.values(LOCALES)) {
      expect(messages.hero.titleLine1.length).toBeGreaterThan(0)
      expect(messages.hero.titleLine2.length).toBeGreaterThan(0)
    }
  })
})
