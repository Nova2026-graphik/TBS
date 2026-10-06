import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import { describe, expect, it } from 'vitest'
import * as schema from '../../server/database/schema'
import {
  ACK_MAX_PER_ADDRESS,
  ACK_MAX_TOTAL,
  countAcknowledgements,
  findDuplicateQuote,
  shouldAcknowledge,
} from '../../server/utils/quoteGuards'

/**
 * L'accusé de réception part vers une adresse saisie par le visiteur : sans
 * plafond, le formulaire permettrait de faire écrire TBS à n'importe qui.
 */
describe('shouldAcknowledge', () => {
  it('envoie dans le cas courant', () => {
    expect(shouldAcknowledge({ sameAddress: 1, total: 4 })).toBe(true)
  })

  it('envoie jusqu’au plafond par adresse compris', () => {
    expect(shouldAcknowledge({ sameAddress: ACK_MAX_PER_ADDRESS, total: 10 })).toBe(true)
    expect(shouldAcknowledge({ sameAddress: ACK_MAX_PER_ADDRESS + 1, total: 10 })).toBe(false)
  })

  it('envoie jusqu’au plafond global compris', () => {
    expect(shouldAcknowledge({ sameAddress: 1, total: ACK_MAX_TOTAL })).toBe(true)
    expect(shouldAcknowledge({ sameAddress: 1, total: ACK_MAX_TOTAL + 1 })).toBe(false)
  })

  /** Trois accusés par jour suffisent à un client ; une victime n'en reçoit pas plus. */
  it('garde des plafonds raisonnables', () => {
    expect(ACK_MAX_PER_ADDRESS).toBeLessThanOrEqual(5)
    // Trois envois par demande (équipe ×2, accusé) : sous le quota gratuit de 300.
    expect(ACK_MAX_TOTAL * 3).toBeLessThanOrEqual(300)
  })
})

/**
 * Client jamais connecté : `postgres-js` n'ouvre la socket qu'à la première
 * requête. On relit le SQL ; et surtout, on vérifie que les paramètres liés
 * sont encodables — la panne de la purge nocturne venait de là.
 */
const db = drizzle(postgres('postgresql://personne@127.0.0.1:1/vide', { max: 1 }), { schema })

describe('requêtes des garde-fous', () => {
  it('n’attend rien qu’une base sache encoder', async () => {
    // Les deux fonctions construisent leur requête avant de l'exécuter : sans
    // base, elles échouent à la connexion, jamais à l'encodage d'un paramètre.
    const erreurs = await Promise.allSettled([
      findDuplicateQuote(db, { ipHash: 'abc', phone: '+22890000000', message: 'm' }),
      countAcknowledgements(db, 'client@example.tg'),
    ])
    for (const e of erreurs) {
      expect(e.status).toBe('rejected')
      const message = String((e as PromiseRejectedResult).reason?.message ?? '')
      expect(message).not.toMatch(/argument must be of type string|Received an instance of Date/)
    }
  })
})
