import { describe, expect, it } from 'vitest'
import { domains, equipment, faqItems } from '../../server/data/content'
import {
  domainesDeLaBranche,
  effectifsPar,
  referencesDeLaBranche,
  referencesDuDomaine,
} from '../../shared/utils/compteurs'

/**
 * Les compteurs sont vérifiés contre les **données réelles** du site, pas
 * contre des tableaux de test : c'est ce que la page affichera, et un test sur
 * des données inventées ne dirait rien du nombre inscrit à l'écran.
 */
describe('compteurs', () => {
  it('compte les références d’un domaine', () => {
    const n = referencesDuDomaine(equipment, 'mobilier-bureau')
    expect(n).toBe(equipment.filter(e => e.domain === 'mobilier-bureau').length)
    expect(n).toBeGreaterThan(0)
  })

  it('somme les références d’une branche sur ses domaines', () => {
    const parDomaine = domainesDeLaBranche(domains, 'equipements')
      .map(d => referencesDuDomaine(equipment, d.slug))
      .reduce((a, b) => a + b, 0)
    expect(referencesDeLaBranche(equipment, domains, 'equipements')).toBe(parDomaine)
  })

  it('les quatre branches se partagent tout le catalogue', () => {
    const total = (['equipements', 'events', 'etudes', 'agro'] as const)
      .map(b => referencesDeLaBranche(equipment, domains, b))
      .reduce((a, b) => a + b, 0)
    expect(total).toBe(equipment.length)
  })

  it('garde l’ordre du site pour les domaines d’une branche', () => {
    const slugs = domainesDeLaBranche(domains, 'equipements').map(d => d.slug)
    expect(slugs[0]).toBe('mobilier-bureau')
    expect(slugs.at(-1)).toBe('manutention')
    expect(slugs).toHaveLength(13)
  })

  it('compte par clé, et vaut zéro à la lecture d’une clé absente', () => {
    const parBranche = effectifsPar(faqItems, q => q.branch)
    const total = Object.values(parBranche).reduce((a, b) => a + b, 0)
    expect(total).toBe(faqItems.length)
    // Études et Agro n'ont pas encore de question : la lecture doit rendre 0,
    // pas `undefined` — c'est ce que le gabarit affiche comme « — ».
    expect(parBranche.etudes ?? 0).toBe(0)
  })

  it('ignore les éléments sans clé', () => {
    const compte = effectifsPar([{ t: 'a' }, { t: null }, { t: 'a' }], x => x.t)
    expect(compte).toEqual({ a: 2 })
  })
})
