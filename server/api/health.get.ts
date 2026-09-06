/**
 * GET /api/health — point de contrôle pour la surveillance externe.
 *
 * Surveiller `/` dit seulement que le serveur répond ; il peut très bien
 * servir la page d'accueil pré-rendue alors que la base est tombée et que
 * toute demande de devis se perd. Ce point vérifie la dépendance qui compte.
 *
 * Il renvoie **503** quand une base est configurée mais injoignable : c'est ce
 * code que les services de surveillance interprètent comme une panne.
 *
 * Aucun détail interne n'est publié — ni version, ni chemin, ni message
 * d'erreur : l'adresse est publique par nécessité.
 */
import { sql } from 'drizzle-orm'
import { useDb } from '../database/client'

type DatabaseState = 'ok' | 'absente' | 'injoignable'

export default defineEventHandler(async (event) => {
  const db = useDb()
  let database: DatabaseState = 'absente'

  if (db) {
    try {
      await db.execute(sql`select 1`)
      database = 'ok'
    } catch (error) {
      database = 'injoignable'
      console.error('[sante] base injoignable :', error)
    }
  }

  const healthy = database !== 'injoignable'
  setResponseStatus(event, healthy ? 200 : 503)

  // Un contrôle de santé mis en cache ne contrôle plus rien.
  setResponseHeader(event, 'cache-control', 'no-store')

  return {
    ok: healthy,
    database,
    uptime: Math.round(process.uptime()),
  }
})
