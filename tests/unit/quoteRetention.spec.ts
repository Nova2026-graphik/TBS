import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import { describe, expect, it } from 'vitest'
import * as schema from '../../server/database/schema'
import {
  ANONYMISED_MARKER,
  buildAnonymiseQuery,
  retentionCutoff,
} from '../../server/utils/quoteRetention'

/**
 * La purge des demandes expirées est ce qui rend vraie une phrase de la
 * politique de confidentialité : « cette anonymisation est automatique ».
 * Elle tourne la nuit, sans témoin, et la tâche **avale ses erreurs** pour ne
 * pas faire tomber le serveur. Une panne y est donc silencieuse par
 * construction : le site conserverait des noms et des numéros pendant que la
 * page promet le contraire.
 *
 * D'où ces tests, et surtout le dernier.
 */

/**
 * Client jamais connecté : `postgres-js` n'ouvre la socket qu'à la première
 * requête, et on ne fait que relire le SQL produit.
 */
const db = drizzle(postgres('postgresql://personne@127.0.0.1:1/vide', { max: 1 }), { schema })

describe('retentionCutoff', () => {
  it('recule du nombre de mois demandé', () => {
    expect(retentionCutoff(24, new Date('2026-10-03T12:00:00Z')).toISOString())
      .toMatch(/^2024-10-03/)
  })

  /**
   * `setMonth` seul déborde : le 31 mars moins un mois donne un 31 février,
   * que JavaScript reporte au 2 ou 3 mars — soit deux jours de conservation
   * en trop, du mauvais côté de la promesse.
   */
  it('ne déborde pas sur un quantième absent du mois visé', () => {
    expect(retentionCutoff(1, new Date('2026-03-31T12:00:00Z')).toISOString())
      .toMatch(/^2026-02-(28|29)/)
  })

  it('traverse l’année sans accroc', () => {
    expect(retentionCutoff(2, new Date('2026-01-15T12:00:00Z')).toISOString())
      .toMatch(/^2025-11-15/)
  })
})

describe('buildAnonymiseQuery', () => {
  const requete = buildAnonymiseQuery(db, new Date('2024-10-03T12:00:00Z')).toSQL()

  it('date du dernier échange, pas de la seule création', () => {
    expect(requete.sql).toContain('coalesce')
    expect(requete.sql).toContain('handled_at')
    expect(requete.sql).toContain('created_at')
  })

  it('écrase tout ce qui désigne une personne', () => {
    for (const colonne of ['name', 'phone', 'email', 'location', 'message', 'internal_note', 'ip_hash', 'user_agent']) {
      expect(requete.sql, colonne).toContain(`"${colonne}"`)
    }
  })

  it('laisse les colonnes statistiques intactes', () => {
    for (const colonne of ['branch', 'request_type', 'guest_count', 'event_date']) {
      expect(requete.sql, colonne).not.toContain(`"${colonne}" =`)
    }
  })

  it('ne repasse pas sur une ligne déjà anonymisée', () => {
    expect(requete.params).toContain(ANONYMISED_MARKER)
    expect(requete.sql).toMatch(/<>|!=/)
  })

  /**
   * **Le test qui aurait évité la panne.** `.toSQL()` rend le même texte que
   * la borne soit une `Date` ou une chaîne : relire le SQL ne dit rien. Ce
   * qui casse, c'est le pilote au moment de lier les paramètres —
   * `postgres-js` ne sait encoder ni une `Date` ni un objet, et rejette la
   * requête entière.
   *
   * Drizzle convertit une `Date` quand il peut rattacher la comparaison à une
   * colonne typée. Ici la gauche est un fragment `coalesce(…)` dont il ignore
   * le type : la conversion n'a pas lieu, et l'objet part tel quel. La borne
   * est donc passée en ISO avec un `::timestamptz` explicite.
   */
  it('ne lie que des valeurs que le pilote sait encoder', () => {
    for (const param of requete.params) {
      expect(param, `paramètre non encodable : ${String(param)}`).toSatisfy(
        v => v === null || ['string', 'number', 'boolean'].includes(typeof v),
      )
    }
  })

  it('passe la borne en ISO, avec son type', () => {
    expect(requete.params).toContain('2024-10-03T12:00:00.000Z')
    expect(requete.sql).toContain('::timestamptz')
  })
})
