import { describe, expect, it } from 'vitest'
import {
  AJUSTEMENTS_VIDES,
  aDesAjustements,
  appliquerAjustements,
  calculerMateriel,
  messageDevis,
  normaliserQuantite,
  QUANTITE_MAX,
} from '../../app/utils/materielReception'

const OPTIONS = { invites: 200, format: 'assis' as const, soiree: true }

describe('barème de départ', () => {
  it('rend une liste non vide pour une réception plausible', () => {
    const lignes = calculerMateriel(OPTIONS)
    expect(lignes.length).toBeGreaterThan(5)
    expect(lignes.every(l => l.quantite > 0)).toBe(true)
  })

  it('ne rend rien sans invités', () => {
    expect(calculerMateriel({ ...OPTIONS, invites: 0 })).toEqual([])
  })
})

describe('normalisation d’une saisie', () => {
  it('ramène le vide, le texte et le négatif à zéro', () => {
    for (const valeur of ['', 'douze', null, undefined, -5, Number.NaN]) {
      expect(normaliserQuantite(valeur)).toBe(0)
    }
  })

  it('tronque les décimales plutôt que d’arrondir au supérieur', () => {
    expect(normaliserQuantite('12.9')).toBe(12)
  })

  it('plafonne au lieu de refuser', () => {
    expect(normaliserQuantite(10 ** 9)).toBe(QUANTITE_MAX)
  })
})

describe('ajustements du visiteur', () => {
  const base = calculerMateriel(OPTIONS)

  it('sans rien changer, rend le barème tel quel', () => {
    const lignes = appliquerAjustements(base, AJUSTEMENTS_VIDES, [])
    expect(lignes.map(l => l.quantite)).toEqual(base.map(l => l.quantite))
    expect(lignes.every(l => !l.ajustee && !l.libre)).toBe(true)
  })

  it('remplace une quantité, et garde celle du calcul pour pouvoir y revenir', () => {
    const calculee = base.find(l => l.cle === 'chaises')!.quantite
    const [chaises] = appliquerAjustements(base, { quantites: { chaises: 250 }, retirees: [] }, [])

    expect(chaises!.quantite).toBe(250)
    expect(chaises!.ajustee).toBe(true)
    expect(chaises!.quantiteCalculee).toBe(calculee)
    expect(chaises!.quantiteCalculee).not.toBe(250)
  })

  it('retire une ligne sans toucher aux autres', () => {
    const lignes = appliquerAjustements(base, { quantites: {}, retirees: ['verres'] }, [])
    expect(lignes.find(l => l.cle === 'verres')).toBeUndefined()
    expect(lignes).toHaveLength(base.length - 1)
  })

  it('ajoute un article absent du barème, signalé comme tel', () => {
    const libre = { cle: 'libre-1', libelle: 'Groupe électrogène', quantite: 2, unite: 'ensemble(s)' }
    const lignes = appliquerAjustements(base, AJUSTEMENTS_VIDES, [libre])
    const ajoute = lignes.at(-1)!

    expect(ajoute.libelle).toBe('Groupe électrogène')
    expect(ajoute.quantite).toBe(2)
    expect(ajoute.libre).toBe(true)
  })

  it('borne aussi les quantités qui viennent des ajustements', () => {
    const lignes = appliquerAjustements(base, { quantites: { chaises: -3 }, retirees: [] }, [])
    expect(lignes.find(l => l.cle === 'chaises')!.quantite).toBe(0)
  })

  it('reconnaît un inventaire intact d’un inventaire retouché', () => {
    expect(aDesAjustements(AJUSTEMENTS_VIDES, [])).toBe(false)
    expect(aDesAjustements({ quantites: { chaises: 1 }, retirees: [] }, [])).toBe(true)
    expect(aDesAjustements({ quantites: {}, retirees: ['verres'] }, [])).toBe(true)
    expect(aDesAjustements(AJUSTEMENTS_VIDES, [
      { cle: 'libre-1', libelle: 'X', quantite: 1, unite: 'pièces' },
    ])).toBe(true)
  })
})

describe('message de devis', () => {
  const base = calculerMateriel(OPTIONS)

  it('ne signale rien quand rien n’a été touché', () => {
    const texte = messageDevis(OPTIONS, appliquerAjustements(base, AJUSTEMENTS_VIDES, []))
    expect(texte).not.toContain('ajusté par le client')
    expect(texte).not.toContain('ajouté par le client')
    expect(texte).toContain('200 invités, dîner assis, avec soirée')
  })

  /**
   * Le conseiller doit distinguer un nombre choisi d'un nombre calculé :
   * sinon il corrige une décision, ou rate une contrainte.
   */
  it('signale une quantité ajustée, et rappelle celle du calcul', () => {
    const lignes = appliquerAjustements(base, { quantites: { chaises: 250 }, retirees: [] }, [])
    const texte = messageDevis(OPTIONS, lignes)
    const calculee = base.find(l => l.cle === 'chaises')!.quantite

    expect(texte).toContain(`Chaises : 250 pièces (ajusté par le client ; calcul : ${calculee})`)
    expect(texte).toContain('J\'ai ajusté certaines quantités')
  })

  it('signale un article ajouté', () => {
    const lignes = appliquerAjustements(base, AJUSTEMENTS_VIDES, [
      { cle: 'libre-1', libelle: 'Praticables', quantite: 6, unite: 'lots' },
    ])
    expect(messageDevis(OPTIONS, lignes)).toContain('Praticables : 6 lots (ajouté par le client)')
  })

  it('n’énumère pas une ligne retirée', () => {
    const lignes = appliquerAjustements(base, { quantites: {}, retirees: ['verres'] }, [])
    expect(messageDevis(OPTIONS, lignes)).not.toContain('Verres :')
  })
})
