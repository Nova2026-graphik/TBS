import { describe, expect, it } from 'vitest'
import en from '../../i18n/locales/en.json'
import fr from '../../i18n/locales/fr.json'

/**
 * Les deux fichiers de langue doivent se répondre exactement.
 *
 * `vue-i18n` ne dit rien quand une clé manque : il rend la clé elle-même.
 * Sur l'accueil cela se voit tout de suite ; sur une page légale de cinq
 * écrans, un paragraphe affiché comme `legal.privacy.rightsAuthority` peut
 * tenir des mois sans que personne le remarque — ce sont justement les pages
 * qu'on relit le moins.
 *
 * Trois contrôles, du plus évident au plus traître :
 *
 *  1. **les clés** — une traduction oubliée ;
 *  2. **les variables** — `{email}` perdu dans la version anglaise rend une
 *     phrase sans adresse de contact ;
 *  3. **les cibles de liens** — un `[texte](/chemin)` dont le chemin a été
 *     traduit par mégarde mène en 404.
 */
type Noeud = string | string[] | { [k: string]: Noeud }

function aplatir(noeud: Noeud, prefixe = ''): Map<string, string> {
  const plat = new Map<string, string>()

  if (typeof noeud === 'string') {
    plat.set(prefixe, noeud)
  }
  else if (Array.isArray(noeud)) {
    noeud.forEach((entree, i) => {
      for (const [k, v] of aplatir(entree, `${prefixe}[${i}]`)) plat.set(k, v)
    })
  }
  else {
    for (const [cle, valeur] of Object.entries(noeud)) {
      const chemin = prefixe ? `${prefixe}.${cle}` : cle
      for (const [k, v] of aplatir(valeur, chemin)) plat.set(k, v)
    }
  }

  return plat
}

const FR = aplatir(fr as Noeud)
const EN = aplatir(en as Noeud)

/** `{n}`, `{email}`… — ce que le code injecte dans la phrase. */
const variables = (texte: string) => [...texte.matchAll(/\{(\w+)\}/g)].map(m => m[1]!).sort()

/** Cibles de `[libellé](cible)`, hors `mailto:`/`tel:` qui sont interpolés. */
const cibles = (texte: string) =>
  [...texte.matchAll(/\]\((\/[^)\s]*)\)/g)].map(m => m[1]!).sort()

/** Nombre de formes d'une clé plurielle : `singulier | pluriel` en vaut deux. */
const formes = (texte: string) => texte.split(' | ').length

describe('parité des fichiers de langue', () => {
  it('a exactement les mêmes clés de part et d’autre', () => {
    expect([...EN.keys()].sort()).toEqual([...FR.keys()].sort())
  })

  it('n’a aucune chaîne vide', () => {
    for (const [langue, plat] of [['fr', FR], ['en', EN]] as const) {
      const vides = [...plat].filter(([, v]) => v.trim() === '').map(([k]) => k)
      expect(vides, `chaînes vides en ${langue}`).toEqual([])
    }
  })

  it.each([...FR.keys()].sort())('%s : les deux versions attendent les mêmes variables', (cle) => {
    expect(variables(EN.get(cle) ?? '')).toEqual(variables(FR.get(cle)!))
  })

  it.each([...FR.keys()].filter(k => cibles(FR.get(k)!).length > 0).sort())(
    '%s : les liens internes pointent au même endroit',
    (cle) => {
      expect(cibles(EN.get(cle) ?? '')).toEqual(cibles(FR.get(cle)!))
    },
  )

  it.each([...FR.keys()].filter(k => formes(FR.get(k)!) > 1).sort())(
    '%s : la version anglaise a aussi ses formes plurielles',
    (cle) => {
      expect(formes(EN.get(cle) ?? '')).toBe(formes(FR.get(cle)!))
    },
  )
})
