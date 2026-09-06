/**
 * Tâche planifiée — anonymisation des demandes de devis expirées.
 *
 * Programmée à 3 h du matin (heure du serveur) par `nitro.scheduledTasks`.
 * Sans base configurée, elle ne fait rien et le dit : le site tourne sur son
 * contenu statique, il n'y a rien à purger.
 *
 * Sur un hébergement sans planificateur — serverless, edge — la tâche ne part
 * pas toute seule : il faut la déclencher depuis le cron de la plate-forme.
 * Cf. README, section « Conservation des demandes de devis ».
 */
import { QUOTE_RETENTION_MONTHS } from '#shared/utils/legalData'
import { useDb } from '../../database/client'
import { anonymiseExpiredQuotes } from '../../utils/quoteRetention'

interface AnonymiseTaskResult {
  /** Renseigné quand la tâche n'avait rien à faire. */
  skipped?: string
  count?: number
  cutoff?: string
  error?: string
}

export default defineTask({
  meta: {
    name: 'quotes:anonymise',
    description: `Anonymise les demandes de devis de plus de ${QUOTE_RETENTION_MONTHS} mois`,
  },

  async run(): Promise<{ result: AnonymiseTaskResult }> {
    const db = useDb()
    if (!db) {
      return { result: { skipped: 'aucune base de données configurée' } }
    }

    try {
      const { count, cutoff } = await anonymiseExpiredQuotes(db, QUOTE_RETENTION_MONTHS)

      if (count > 0) {
        console.info(
          `[devis] ${count} demande(s) anonymisée(s), antérieures au ${cutoff.toISOString()}`,
        )
      }

      return { result: { count, cutoff: cutoff.toISOString() } }
    }
    catch (error) {
      // Une purge qui échoue ne doit pas faire tomber le serveur : elle
      // repassera au prochain déclenchement.
      console.error('[devis] anonymisation impossible :', error)
      return { result: { error: error instanceof Error ? error.message : String(error) } }
    }
  },
})
