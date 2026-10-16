import { existsSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import * as fr from '../../server/data/content'
import * as en from '../../server/data/content.en'

const PUBLIC = join(__dirname, '../../public')

/**
 * Les visuels du catalogue sont des chemins écrits à la main : une image
 * renommée ou supprimée ne casse ni le build ni les types, elle laisse une
 * carte vide en production. Ce test relit chaque chemin contre `public/`.
 */
describe('visuels des références', () => {
  it('chaque visuel de référence existe', () => {
    const absents = fr.equipment
      .flatMap(e => [e.image, e.imageHover])
      .filter((chemin): chemin is string => Boolean(chemin))
      .filter(chemin => !existsSync(join(PUBLIC, chemin)))
    expect(absents).toEqual([])
  })

  it('chaque vignette de domaine existe', () => {
    const absents = fr.domains
      .flatMap(d => [d.image, d.thumbnail, d.thumbnailHover])
      .filter((chemin): chemin is string => Boolean(chemin))
      .filter(chemin => !existsSync(join(PUBLIC, chemin)))
    expect(absents).toEqual([])
  })
})

/**
 * Le contenu anglais se cale sur le français **par position** : une fiche
 * ajoutée d'un côté sans l'autre décale toutes les suivantes, et l'article
 * anglais porte alors le nom et la famille de son voisin. La famille sert de
 * témoin : elle doit être la traduction de la famille française.
 */
describe('fiches anglaises de la location de matériel', () => {
  const FAMILLES: Record<string, string> = {
    'Mobilier': 'Furniture',
    'Art de la table': 'Tableware',
    'Nappage': 'Linen',
    'Décoration': 'Décor',
    'Son & lumière': 'Sound & lighting',
    'Tentes & structures': 'Tents & structures',
  }

  it('restent alignées sur les fiches françaises', () => {
    expect(en.equipment).toHaveLength(fr.equipment.length)
    fr.equipment.forEach((fiche, i) => {
      if (fiche.domain !== 'location-reception') return
      expect(en.equipment[i]!.family, fiche.name).toBe(FAMILLES[fiche.family!])
    })
  })

  it('traduisent le nom des articles photographiés dans le parc', () => {
    fr.equipment.forEach((fiche, i) => {
      if (!fiche.image?.startsWith('/images/references/parc/')) return
      expect(en.equipment[i]!.name, fiche.name).not.toBe(fiche.name)
    })
  })
})
