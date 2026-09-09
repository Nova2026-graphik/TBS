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
import { purgeAdminAttempts } from '../../utils/rateLimit'

interface AnonymiseTaskResult {
  /** Renseigné quand la tâche n'avait rien à faire. */
  skipped?: string
  count?: number
  cutoff?: string
  /** Tentatives de connexion effacées au même passage. */
  tentatives?: number
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

      // Les tentatives de connexion partent au même passage : elles ne
      // servent qu'une fenêtre d'une heure, et ce sont aussi des empreintes
      // d'adresses. Un échec ici ne doit pas priver l'anonymisation de son
      // résultat, d'où le traitement séparé.
      let tentatives: number | undefined
      try {
        tentatives = await purgeAdminAttempts(db)
      }
      catch (error) {
        console.error('[admin] purge des tentatives impossible :', error)
      }

      return { result: { count, cutoff: cutoff.toISOString(), tentatives } }
    }
    catch (error) {
      // Une purge qui échoue ne doit pas faire tomber le serveur : elle
      // repassera au prochain déclenchement.
      console.error('[devis] anonymisation impossible :', error)
      return { result: { error: error instanceof Error ? error.message : String(error) } }
    }
  },
})
