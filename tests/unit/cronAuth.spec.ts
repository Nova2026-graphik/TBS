import { describe, expect, it } from 'vitest'
import { isAuthorizedCron, isCronEnabled } from '../../server/utils/cronAuth'

/**
 * La route d'anonymisation efface des données ; sa seule garde est cet
 * en-tête. Un faux positif ici, et n'importe qui peut déclencher la purge ;
 * un faux négatif, et la purge ne part plus — le site conserve alors
 * indéfiniment ce que la politique de confidentialité promet d'effacer.
 */
const SECRET = 'un-secret-de-cron-suffisamment-long'

describe('isCronEnabled', () => {
  it.each([undefined, ''])('%s : le déclencheur est éteint', (valeur) => {
    expect(isCronEnabled(valeur)).toBe(false)
  })

  it('reconnaît un secret renseigné', () => {
    expect(isCronEnabled(SECRET)).toBe(true)
  })
})

describe('isAuthorizedCron', () => {
  it('accepte le secret attendu', () => {
    expect(isAuthorizedCron(`Bearer ${SECRET}`, SECRET)).toBe(true)
  })

  /** La RFC 7235 veut le schéma insensible à la casse ; les clients varient. */
  it.each(['bearer', 'BEARER', 'BeArEr'])('accepte le schéma écrit « %s »', (schema) => {
    expect(isAuthorizedCron(`${schema} ${SECRET}`, SECRET)).toBe(true)
  })

  it('tolère les espaces autour de l’en-tête et après le schéma', () => {
    expect(isAuthorizedCron(`  Bearer   ${SECRET}  `, SECRET)).toBe(true)
  })

  it.each([
    ['en-tête absent', undefined],
    ['en-tête vide', ''],
    ['schéma seul', 'Bearer'],
    ['schéma sans valeur', 'Bearer '],
    ['autre schéma', `Basic ${SECRET}`],
    ['secret nu, sans schéma', SECRET],
    ['mauvais secret', 'Bearer autre-chose'],
    ['bon préfixe, fin fausse', `Bearer ${SECRET.slice(0, -1)}x`],
    ['secret tronqué', `Bearer ${SECRET.slice(0, -1)}`],
    ['secret rallongé', `Bearer ${SECRET}x`],
  ])('refuse : %s', (_cas, header) => {
    expect(isAuthorizedCron(header, SECRET)).toBe(false)
  })
})
