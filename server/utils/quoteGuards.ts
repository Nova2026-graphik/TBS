/**
 * Garde-fous du formulaire de devis, au-delà de la limitation de débit.
 *
 * **Envoi en double.** Un visiteur dont la connexion hésite renvoie le
 * formulaire, ou le bouton est cliqué deux fois sur un téléphone lent : deux
 * lignes identiques dans le suivi, deux courriels à l'équipe, deux accusés au
 * client. Une demande déjà reçue — même adresse IP, même téléphone, même
 * message — dans les dix dernières minutes est reconnue et rendue telle
 * quelle, sans seconde écriture ni second envoi.
 *
 * **Accusés de réception plafonnés.** L'accusé part vers l'adresse que le
 * visiteur a saisie. Rien ne prouve qu'elle est la sienne : sans plafond, le
 * formulaire devient un moyen de faire écrire TBS à n'importe qui, depuis son
 * propre domaine. La limitation par IP ne suffit pas — un robot change d'IP —
 * et chaque accusé consomme le quota d'envoi gratuit (300 par jour chez
 * Brevo), qui sert aussi aux notifications de l'équipe. D'où deux plafonds
 * sur 24 heures :
 *
 *  - **par adresse** : trois accusés au plus — un client ne demande pas plus
 *    de trois devis par jour, une victime n'en reçoit pas davantage ;
 *  - **en tout** : cent accusés au plus — très au-dessus du volume réel, très
 *    en dessous du quota.
 *
 * Au-delà, la demande est enregistrée et l'équipe prévenue comme d'habitude ;
 * seul l'accusé saute. La notification de l'équipe, elle, n'est jamais
 * plafonnée : c'est elle qui fait vivre le formulaire, et elle ne part que
 * vers les boîtes de TBS.
 *
 * Les comptes portent sur `quote_requests`, la seule table que le formulaire
 * écrit : aucun compteur supplémentaire, aucune migration.
 */
import { and, desc, eq, gt, isNotNull, sql } from 'drizzle-orm'
import type { useDb } from '../database/client'
import * as schema from '../database/schema'

type Database = NonNullable<ReturnType<typeof useDb>>

/** Fenêtre de reconnaissance d'un envoi répété. */
export const DUPLICATE_WINDOW_MS = 10 * 60 * 1000

/** Fenêtre des plafonds d'accusés de réception. */
export const ACK_WINDOW_MS = 24 * 60 * 60 * 1000

/** Accusés au plus par adresse et par 24 heures. */
export const ACK_MAX_PER_ADDRESS = 3

/** Accusés au plus, toutes adresses confondues, par 24 heures. */
export const ACK_MAX_TOTAL = 100

export interface AckCounts {
  /** Demandes portant cette adresse dans la fenêtre, la courante comprise. */
  sameAddress: number
  /** Demandes portant une adresse, toutes adresses confondues, la courante comprise. */
  total: number
}

/** L'accusé part-il ? Décision pure, à partir des comptes. */
export function shouldAcknowledge(counts: AckCounts): boolean {
  return counts.sameAddress <= ACK_MAX_PER_ADDRESS && counts.total <= ACK_MAX_TOTAL
}

/**
 * Demande identique reçue de la même adresse IP dans les dix dernières
 * minutes, ou `null`. Passe par l'index `(ip_hash, created_at)`.
 */
export async function findDuplicateQuote(
  db: Database,
  candidate: { ipHash: string, phone: string, message: string },
  now: Date = new Date(),
): Promise<string | null> {
  const q = schema.quoteRequests
  const [row] = await db
    .select({ id: q.id })
    .from(q)
    .where(and(
      eq(q.ipHash, candidate.ipHash),
      gt(q.createdAt, new Date(now.getTime() - DUPLICATE_WINDOW_MS)),
      eq(q.phone, candidate.phone),
      eq(q.message, candidate.message),
    ))
    .orderBy(desc(q.createdAt))
    .limit(1)

  return row?.id ?? null
}

/** Comptes nécessaires à `shouldAcknowledge`, sur les 24 dernières heures. */
export async function countAcknowledgements(
  db: Database,
  email: string,
  now: Date = new Date(),
): Promise<AckCounts> {
  const q = schema.quoteRequests
  const since = new Date(now.getTime() - ACK_WINDOW_MS)

  const [row] = await db
    .select({
      sameAddress: sql<number>`count(*) filter (where lower(${q.email}) = lower(${email}))::int`,
      total: sql<number>`count(*)::int`,
    })
    .from(q)
    .where(and(isNotNull(q.email), gt(q.createdAt, since)))

  return { sameAddress: row?.sameAddress ?? 0, total: row?.total ?? 0 }
}
