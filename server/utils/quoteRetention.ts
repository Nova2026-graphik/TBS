/**
 * Purge des demandes de devis.
 *
 * La politique de confidentialité annonce une conservation de
 * `QUOTE_RETENTION_MONTHS` mois « à compter du dernier échange », puis une
 * anonymisation. Ce module est ce qui rend cette phrase vraie : sans lui,
 * c'était une promesse en l'air.
 *
 * L'anonymisation plutôt que la suppression : la branche, le type de demande,
 * le nombre d'invités et les dates restent exploitables en statistique, sans
 * plus rattacher quoi que ce soit à une personne.
 *
 * Aucune migration n'est nécessaire. Les colonnes identifiantes sont écrasées
 * — `name`, `phone` et `message` sont `NOT NULL`, d'où un marqueur plutôt
 * qu'un `NULL` — et ce marqueur sert aussi de garde d'idempotence : une ligne
 * déjà traitée n'est pas reprise au passage suivant.
 */
import { and, lt, ne, sql } from 'drizzle-orm'
import type { useDb } from '../database/client'
import * as schema from '../database/schema'

/** Écrit à la place du nom : reconnaissable, et jamais produit par le formulaire. */
export const ANONYMISED_MARKER = '[anonymisé]'

type Database = NonNullable<ReturnType<typeof useDb>>

export interface AnonymiseResult {
  /** Nombre de demandes anonymisées lors de ce passage. */
  count: number
  /** Date avant laquelle une demande est considérée expirée. */
  cutoff: Date
}

/**
 * Date limite : `months` mois avant `now`.
 *
 * `setMonth` seul déborde — le 31 mars moins un mois donnerait un 31 février,
 * que JavaScript reporte au 2 ou 3 mars. On repasse donc par le 1er du mois,
 * puis on ramène le quantième au dernier jour disponible.
 */
export function retentionCutoff(months: number, now = new Date()): Date {
  const cutoff = new Date(now)
  const dayOfMonth = cutoff.getDate()

  cutoff.setDate(1)
  cutoff.setMonth(cutoff.getMonth() - months)

  const lastDayOfTargetMonth = new Date(cutoff.getFullYear(), cutoff.getMonth() + 1, 0).getDate()
  cutoff.setDate(Math.min(dayOfMonth, lastDayOfTargetMonth))

  return cutoff
}

/**
 * Construit la requête d'anonymisation. Isolée de son exécution pour pouvoir
 * relire le SQL produit sans base de données — `.toSQL()` suffit.
 */
export function buildAnonymiseQuery(db: Database, cutoff: Date) {
  const { quoteRequests: q } = schema

  return db
    .update(q)
    .set({
      name: ANONYMISED_MARKER,
      phone: ANONYMISED_MARKER,
      email: null,
      location: null,
      message: ANONYMISED_MARKER,
      // La note du commercial peut nommer des personnes : elle part avec le reste.
      internalNote: null,
      ipHash: null,
      userAgent: null,
    })
    .where(
      and(
        // Le dernier échange, pas la seule date de création.
        lt(sql`coalesce(${q.handledAt}, ${q.createdAt})`, cutoff),
        // Idempotence : on ne repasse pas sur ce qui est déjà anonymisé.
        ne(q.name, ANONYMISED_MARKER),
      ),
    )
    .returning({ id: q.id })
}

/**
 * Anonymise les demandes dont le dernier échange remonte à plus de `months`
 * mois. `handledAt` fait foi quand il existe — c'est le dernier échange —
 * sinon `createdAt`.
 */
export async function anonymiseExpiredQuotes(
  db: Database,
  months: number,
  now = new Date(),
): Promise<AnonymiseResult> {
  const cutoff = retentionCutoff(months, now)
  const rows = await buildAnonymiseQuery(db, cutoff)

  return { count: rows.length, cutoff }
}
