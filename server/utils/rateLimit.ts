/**
 * Limitation de débit des demandes de devis.
 *
 * La `Map` en mémoire qu'utilisait `quotes.post.ts` ne tenait que sur un
 * serveur Node unique et permanent. Sur Vercel, Netlify ou Cloudflare — les
 * cibles que recommande le README — chaque instance a la sienne : la limite
 * devient « 10 par heure et par instance », et un démarrage à froid la remet
 * à zéro. Autant dire pas de limite du tout.
 *
 * Le compteur partagé est donc la base : `quote_requests` porte déjà l'index
 * `(ip_hash, created_at)`, posé pour cette question précise. Compter les
 * lignes d'une fenêtre glissante d'une heure ne coûte qu'un parcours d'index,
 * ne demande aucun service supplémentaire — ni Redis, ni KV — et vaut pour
 * toutes les instances à la fois, y compris celles qui viennent de démarrer.
 *
 * Sans base configurée, on retombe sur la fenêtre en mémoire. Elle ne vaut
 * que pour un processus unique, mais dans cette configuration il n'y a de
 * toute façon rien à écrire : la demande n'est que journalisée.
 */
import { and, eq, gt, sql } from 'drizzle-orm'
import type { useDb } from '../database/client'
import * as schema from '../database/schema'

type Database = NonNullable<ReturnType<typeof useDb>>

/** Fenêtre glissante : une heure, comme l'annonce le message de refus. */
export const WINDOW_MS = 60 * 60 * 1000

/** Où le compte a été tenu — journalisé, et utile aux tests. */
export type RateLimitScope = 'database' | 'memory'

export interface RateLimitResult {
  limited: boolean
  scope: RateLimitScope
  /** Demandes déjà retenues dans la fenêtre, celle-ci non comprise. */
  hits: number
}

const memoryBuckets = new Map<string, number[]>()

/**
 * Fenêtre glissante en mémoire — repli mono-instance.
 *
 * Exportée pour être testable et pour que l'appelant sache ce qu'il utilise.
 * Elle compte l'essai courant, contrairement au chemin base de données où
 * c'est la ligne insérée qui fera le compte au coup suivant.
 */
export function isRateLimitedInMemory(key: string, limit: number, now = Date.now()): RateLimitResult {
  const hits = (memoryBuckets.get(key) ?? []).filter((t) => now - t < WINDOW_MS)
  const previous = hits.length
  hits.push(now)
  memoryBuckets.set(key, hits)

  // Purge opportuniste pour éviter une croissance non bornée de la Map.
  if (memoryBuckets.size > 5000) {
    for (const [k, v] of memoryBuckets) {
      if (!v.some((t) => now - t < WINDOW_MS)) memoryBuckets.delete(k)
    }
  }

  return { limited: previous >= limit, scope: 'memory', hits: previous }
}

/** Remet le compteur en mémoire à zéro (tests). */
export function resetRateLimitMemory(): void {
  memoryBuckets.clear()
}

/**
 * Demandes déjà enregistrées pour cette empreinte d'IP dans la dernière heure.
 *
 * Le compte porte sur les demandes *écrites*, pas sur les tentatives : une
 * requête rejetée plus tôt — schéma invalide, champ piège — n'a jamais atteint
 * la table et ne consomme pas le quota. C'est le comportement voulu, la limite
 * vise l'inondation du carnet de demandes.
 */
async function countRecentRequests(db: Database, ipHash: string, since: Date): Promise<number> {
  const [row] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(schema.quoteRequests)
    .where(and(eq(schema.quoteRequests.ipHash, ipHash), gt(schema.quoteRequests.createdAt, since)))

  return row?.count ?? 0
}

/**
 * Décide si cette empreinte d'IP a dépassé son quota horaire.
 *
 * En cas de base injoignable, on retombe sur la mémoire plutôt que de laisser
 * passer : la requête va de toute façon échouer à l'insertion, mais le quota
 * ne doit pas s'ouvrir en grand parce que la base tousse.
 */
export async function isQuoteRateLimited(
  db: Database | null,
  ipHash: string,
  limit: number,
  now: Date = new Date(),
): Promise<RateLimitResult> {
  if (!db) return isRateLimitedInMemory(ipHash, limit, now.getTime())

  try {
    const hits = await countRecentRequests(db, ipHash, new Date(now.getTime() - WINDOW_MS))
    return { limited: hits >= limit, scope: 'database', hits }
  } catch (error) {
    console.error('[devis] comptage du quota impossible, repli en mémoire :', error)
    return isRateLimitedInMemory(ipHash, limit, now.getTime())
  }
}
