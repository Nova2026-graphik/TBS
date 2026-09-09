import { describe, expect, it } from 'vitest'
import {
  formatViolation,
  parseCspReport,
  trimUrl,
  violationSignature,
} from '../../server/utils/cspReport'

/**
 * Collecte des violations CSP.
 *
 * L'adresse est publique et n'importe qui peut y poster n'importe quoi : ce
 * module doit trier sans jamais lever. Et il ne doit rien laisser passer de ce
 * qu'un visiteur a saisi — une chaîne de requête peut porter un filtre, un
 * terme de recherche, un identifiant.
 */
describe('trimUrl', () => {
  it('retire la chaîne de requête d’une URL', () => {
    expect(trimUrl('https://tbs.tg/galerie?branche=events&domaine=roulant'))
      .toBe('https://tbs.tg/galerie')
  })

  it('garde les mots-clés, qui ne sont pas des URL', () => {
    expect(trimUrl('inline')).toBe('inline')
    expect(trimUrl('eval')).toBe('eval')
  })

  it('ne casse pas sur une valeur absente ou aberrante', () => {
    expect(trimUrl(undefined)).toBe('inconnu')
    expect(trimUrl('')).toBe('inconnu')
    expect(trimUrl(42)).toBe('inconnu')
    expect(trimUrl('://n’importe quoi')).toBe('://n’importe quoi')
  })
})

describe('parseCspReport', () => {
  it('lit le format report-uri', () => {
    const violations = parseCspReport({
      'csp-report': {
        'document-uri': 'https://tbs.tg/contact?nom=Akouvi',
        'effective-directive': 'script-src',
        'blocked-uri': 'inline',
      },
    })

    expect(violations).toEqual([{
      directive: 'script-src',
      blocked: 'inline',
      document: 'https://tbs.tg/contact',
    }])
  })

  it('retombe sur violated-directive quand l’autre manque', () => {
    const [violation] = parseCspReport({
      'csp-report': { 'violated-directive': 'style-src', 'blocked-uri': 'inline' },
    })

    expect(violation?.directive).toBe('style-src')
  })

  it('lit un lot de la Reporting API', () => {
    const violations = parseCspReport([
      {
        type: 'csp-violation',
        body: {
          documentURL: 'https://tbs.tg/',
          effectiveDirective: 'img-src',
          blockedURL: 'https://ailleurs.example/pixel.gif?u=1',
        },
      },
      { type: 'deprecation', body: {} },
    ])

    expect(violations).toHaveLength(1)
    expect(violations[0]?.blocked).toBe('https://ailleurs.example/pixel.gif')
  })

  it('ignore tout ce qui n’est pas un rapport', () => {
    for (const charge of [null, undefined, 'texte', 42, {}, [], [{ type: 'autre' }], { 'csp-report': 'non' }]) {
      expect(parseCspReport(charge)).toEqual([])
    }
  })
})

describe('regroupement', () => {
  it('donne la même signature à deux occurrences d’une même violation', () => {
    const a = { directive: 'script-src', blocked: 'inline', document: 'https://tbs.tg/' }
    const b = { directive: 'script-src', blocked: 'inline', document: 'https://tbs.tg/contact' }

    // La page diffère, la cause est la même : une seule alerte par fenêtre.
    expect(violationSignature(a)).toBe(violationSignature(b))
  })

  it('formate une ligne lisible', () => {
    expect(formatViolation({ directive: 'script-src', blocked: 'inline', document: 'https://tbs.tg/' }))
      .toBe('[csp] script-src a refusé inline sur https://tbs.tg/')
  })
})
