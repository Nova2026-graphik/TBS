import { readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

/**
 * La rubrique Conseils existe dans les deux langues, appariée **par nom de
 * fichier** : `content/conseils/x.md` et `content/en/conseils/x.md` sont la
 * même page, et `switchLocalePath` passe de l'une à l'autre sur ce seul
 * accord de noms.
 *
 * Un article ajouté d'un seul côté casse donc le sélecteur de langue sans
 * rien casser d'autre : la page se construit, s'affiche, et le lien vers
 * l'autre langue tombe en 404. C'est exactement le genre de panne qui ne se
 * voit pas à la relecture — d'où ce test.
 */
const FR = join(import.meta.dirname, '../../content/conseils')
const EN = join(import.meta.dirname, '../../content/en/conseils')

const fichiers = (dossier: string) => readdirSync(dossier).filter(f => f.endsWith('.md')).sort()

/** Champs de la frontmatter qui doivent rester identiques d'une langue à l'autre. */
const PARTAGES = ['publishedAt', 'updatedAt', 'category', 'image', 'featured', 'calculator'] as const

function frontmatter(chemin: string): Record<string, string> {
  const texte = readFileSync(chemin, 'utf8')
  const bloc = /^---\n([\s\S]*?)\n---/.exec(texte)
  if (!bloc) return {}

  return Object.fromEntries(
    bloc[1]!.split('\n')
      .map(ligne => /^(\w+):\s*(.*)$/.exec(ligne))
      .filter(m => m !== null)
      .map(m => [m[1]!, m[2]!.trim().replace(/^["']|["']$/g, '')]),
  )
}

describe('rubrique Conseils bilingue', () => {
  it('a autant d’articles dans les deux langues, aux mêmes noms', () => {
    expect(fichiers(EN)).toEqual(fichiers(FR))
  })

  it('n’a pas d’article sans traduction', () => {
    expect(fichiers(FR).length).toBeGreaterThan(0)
  })

  it.each(fichiers(FR))('%s : la version anglaise est bien traduite', (nom) => {
    const fr = frontmatter(join(FR, nom))
    const en = frontmatter(join(EN, nom))

    expect(en.title, 'titre non traduit').not.toBe(fr.title)
    expect(en.description, 'description non traduite').not.toBe(fr.description)
    expect(en.title?.length ?? 0).toBeGreaterThan(10)
    expect(en.description?.length ?? 0).toBeGreaterThan(30)
  })

  /**
   * Date, rubrique et image sont des données, pas du texte : elles pilotent
   * le tri, le filtre et le visuel. Deux versions qui en divergeraient
   * s'afficheraient dans un ordre différent, ou sous un thème différent.
   */
  it.each(fichiers(FR))('%s : les champs de données concordent', (nom) => {
    const fr = frontmatter(join(FR, nom))
    const en = frontmatter(join(EN, nom))

    for (const champ of PARTAGES) {
      expect(en[champ], `${champ} diverge`).toBe(fr[champ])
    }
  })
})
