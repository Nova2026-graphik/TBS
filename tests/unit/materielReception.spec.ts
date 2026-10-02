import { describe, expect, it } from 'vitest'
import {
  AJUSTEMENTS_VIDES,
  aDesAjustements,
  appliquerAjustements,
  calculerMateriel,
  messageDevis,
  normaliserQuantite,
  QUANTITE_MAX,
  resoudreLignes,
} from '../../app/utils/materielReception'

const OPTIONS = { invites: 200, format: 'assis' as const, soiree: true }

/**
 * Traducteur de test : rend la clé, suffixée de ses paramètres.
 *
 * Les assertions portent ainsi sur la **structure** — quelle clé, quels
 * paramètres — et non sur une prose française qui changerait à la première
 * relecture éditoriale. C'est aussi ce qui permet d'éprouver le barème sans
 * monter l'environnement i18n.
 */
const t = (cle: string, params?: Record<string, unknown>) =>
  params ? `${cle}(${Object.entries(params).map(([k, v]) => `${k}=${v}`).join(',')})` : cle

/** Le barème, résolu avec le traducteur de test. */
const resolu = (options = OPTIONS) => resoudreLignes(calculerMateriel(options), t)

describe('barème de départ', () => {
  it('rend une liste non vide pour une réception plausible', () => {
    const lignes = calculerMateriel(OPTIONS)
    expect(lignes.length).toBeGreaterThan(5)
    expect(lignes.every(l => l.quantite > 0)).toBe(true)
  })

  it('ne rend rien sans invités', () => {
    expect(calculerMateriel({ ...OPTIONS, invites: 0 })).toEqual([])
  })

  /** Un libellé écrit en dur serait resté français dans l'article anglais. */
  it('ne porte aucun texte, seulement des clés de traduction', () => {
    for (const ligne of calculerMateriel(OPTIONS)) {
      expect(ligne.libelleCle).toMatch(/^calculator\.items\./)
      expect(ligne.regleCle).toMatch(/^calculator\.rules\./)
      expect(ligne.uniteCle).toMatch(/^calculator\.units\./)
    }
  })

  it('choisit la règle des sièges selon le format', () => {
    const regle = (format: 'assis' | 'mixte' | 'cocktail') =>
      calculerMateriel({ ...OPTIONS, format }).find(l => l.cle === 'chaises')!.regleCle

    expect(regle('assis')).toBe('calculator.rules.chaises-assis')
    expect(regle('mixte')).toBe('calculator.rules.chaises-mixte')
    expect(regle('cocktail')).toBe('calculator.rules.chaises-cocktail')
  })

  it('change la règle des verres quand la soirée se prolonge', () => {
    const regle = (soiree: boolean) =>
      calculerMateriel({ ...OPTIONS, soiree }).find(l => l.cle === 'verres')!.regleCle

    expect(regle(true)).toBe('calculator.rules.verres-soiree')
    expect(regle(false)).toBe('calculator.rules.verres')
  })

  it('résout les clés et leurs paramètres', () => {
    const tables = resolu().find(l => l.cle === 'tables-rondes')!
    expect(tables.libelle).toBe('calculator.items.tables-rondes(n=10)')
    expect(tables.regle).toBe('calculator.rules.tables-rondes(n=10)')
    expect(tables.unite).toBe('calculator.units.tables')
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
  it('sans rien changer, rend le barème tel quel', () => {
    const base = resolu()
    const lignes = appliquerAjustements(base, AJUSTEMENTS_VIDES, [])
    expect(lignes.map(l => l.quantite)).toEqual(base.map(l => l.quantite))
    expect(lignes.every(l => !l.ajustee && !l.libre)).toBe(true)
  })

  it('remplace une quantité, et garde celle du calcul pour pouvoir y revenir', () => {
    const base = resolu()
    const calculee = base.find(l => l.cle === 'chaises')!.quantite
    const [chaises] = appliquerAjustements(base, { quantites: { chaises: 250 }, retirees: [] }, [])

    expect(chaises!.quantite).toBe(250)
    expect(chaises!.ajustee).toBe(true)
    expect(chaises!.quantiteCalculee).toBe(calculee)
    expect(chaises!.quantiteCalculee).not.toBe(250)
  })

  it('retire une ligne sans toucher aux autres', () => {
    const base = resolu()
    const lignes = appliquerAjustements(base, { quantites: {}, retirees: ['verres'] }, [])
    expect(lignes.find(l => l.cle === 'verres')).toBeUndefined()
    expect(lignes).toHaveLength(base.length - 1)
  })

  it('ajoute un article absent du barème, signalé comme tel', () => {
    const libre = { cle: 'libre-1', libelle: 'Groupe électrogène', quantite: 2, unite: 'ensemble(s)' }
    const ajoute = appliquerAjustements(resolu(), AJUSTEMENTS_VIDES, [libre]).at(-1)!

    expect(ajoute.libelle).toBe('Groupe électrogène')
    expect(ajoute.quantite).toBe(2)
    expect(ajoute.libre).toBe(true)
  })

  it('traduit la mention portée par un article ajouté', () => {
    const libre = { cle: 'libre-1', libelle: 'X', quantite: 1, unite: 'lots' }
    const ajoute = appliquerAjustements(resolu(), AJUSTEMENTS_VIDES, [libre], 'Added by you').at(-1)!
    expect(ajoute.regle).toBe('Added by you')
  })

  it('borne aussi les quantités qui viennent des ajustements', () => {
    const lignes = appliquerAjustements(resolu(), { quantites: { chaises: -3 }, retirees: [] }, [])
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
  it('ne signale rien quand rien n’a été touché', () => {
    const texte = messageDevis(OPTIONS, appliquerAjustements(resolu(), AJUSTEMENTS_VIDES, []), t)
    expect(texte).not.toContain('calculator.quote.adjusted')
    expect(texte).not.toContain('calculator.quote.addedByClient')
    expect(texte).toContain('calculator.quote.summary(')
  })

  /**
   * Le conseiller doit distinguer un nombre choisi d'un nombre calculé :
   * sinon il corrige une décision, ou rate une contrainte.
   */
  it('signale une quantité ajustée, et rappelle celle du calcul', () => {
    const base = resolu()
    const calculee = base.find(l => l.cle === 'chaises')!.quantite
    const lignes = appliquerAjustements(base, { quantites: { chaises: 250 }, retirees: [] }, [])
    const texte = messageDevis(OPTIONS, lignes, t)

    expect(texte).toContain(`: 250 calculator.units.pieces (calculator.quote.adjusted(n=${calculee}))`)
    expect(texte).toContain('calculator.quote.note')
  })

  it('signale un article ajouté', () => {
    const lignes = appliquerAjustements(resolu(), AJUSTEMENTS_VIDES, [
      { cle: 'libre-1', libelle: 'Praticables', quantite: 6, unite: 'lots' },
    ])
    expect(messageDevis(OPTIONS, lignes, t))
      .toContain('- Praticables : 6 lots (calculator.quote.addedByClient)')
  })

  it('n’énumère pas une ligne retirée', () => {
    const lignes = appliquerAjustements(resolu(), { quantites: {}, retirees: ['verres'] }, [])
    expect(messageDevis(OPTIONS, lignes, t)).not.toContain('calculator.items.verres')
  })

  it('porte la mention de soirée seulement quand elle a lieu', () => {
    const avec = messageDevis(OPTIONS, resolu(), t)
    const sans = messageDevis({ ...OPTIONS, soiree: false }, resolu({ ...OPTIONS, soiree: false }), t)

    expect(avec).toContain('evening=calculator.quote.evening')
    expect(sans).toContain('evening=')
    expect(sans).not.toContain('evening=calculator.quote.evening')
  })
})
