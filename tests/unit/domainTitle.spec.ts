import { describe, expect, it } from 'vitest'
import { splitDomainTitle } from '../../shared/utils/domainTitle'
import { domains } from '../../server/data/content'

/**
 * Découpage des titres de bannière.
 *
 * La règle est calculée plutôt que saisie dans les données, donc elle doit
 * tenir sur les dix-sept titres réels — c'est l'objet du dernier test, qui
 * échouera le jour où un domaine ajouté produira une ligne vide ou un titre
 * amputé.
 */
describe('splitDomainTitle', () => {
  it('coupe après l’esperluette, qui reste avec la première ligne', () => {
    expect(splitDomainTitle('Mobilier & matériel de bureau'))
      .toEqual(['Mobilier &', 'matériel de bureau'])
    expect(splitDomainTitle('Outillage & équipement d’atelier'))
      .toEqual(['Outillage &', 'équipement d’atelier'])
  })

  it('équilibre les deux lignes quand il n’y a pas d’esperluette', () => {
    expect(splitDomainTitle('Matériel informatique')).toEqual(['Matériel', 'informatique'])
    // La coupe suit le nombre de caractères, pas le nombre de mots.
    expect(splitDomainTitle('Matériels de branchement')).toEqual(['Matériels de', 'branchement'])
  })

  it('ne coupe pas un titre d’un seul mot', () => {
    expect(splitDomainTitle('Photovoltaïque')).toEqual(['Photovoltaïque', ''])
  })

  it('ignore une esperluette en tête ou en queue', () => {
    expect(splitDomainTitle('& alors')).toEqual(['&', 'alors'])
    expect(splitDomainTitle('Tout et &')[1]).not.toBe('')
  })

  it('n’altère jamais le titre : les deux lignes le reconstituent', () => {
    for (const domaine of domains) {
      const [une, deux] = splitDomainTitle(domaine.title)
      expect([une, deux].filter(Boolean).join(' '), domaine.slug).toBe(domaine.title)
      expect(une, domaine.slug).not.toBe('')
    }
  })
})
