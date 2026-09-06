/**
 * POST /api/quotes — enregistrement d'une demande de devis.
 *
 * Défenses en place :
 *  - validation stricte (Zod) et normalisation avant écriture ;
 *  - champ piège `company` : rempli = robot, on renvoie 200 sans écrire ;
 *  - délai minimum de remplissage (`elapsedMs`) ;
 *  - limitation de débit par IP hachée (mémoire Nitro, fenêtre glissante).
 *
 * Sans base de données, la demande est journalisée côté serveur et la
 * réponse reste un succès : le formulaire ne casse jamais en production.
 */
import { createHash } from 'node:crypto'
import { z } from 'zod'
import { useDb } from '../database/client'
import * as schema from '../database/schema'

const quoteSchema = z.object({
  name: z.string().trim().min(2, 'Nom trop court').max(160),
  phone: z
    .string()
    .trim()
    .min(6, 'Numéro invalide')
    .max(40)
    .regex(/^[\d\s+().-]+$/, 'Numéro invalide'),
  email: z.string().trim().email('E-mail invalide').max(200).optional().or(z.literal('')),
  branch: z.string().trim().min(1).max(120),
  requestType: z.string().trim().min(1).max(120),
  eventDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Date invalide')
    .optional()
    .or(z.literal('')),
  guestCount: z.coerce.number().int().min(0).max(100_000).optional(),
  location: z.string().trim().max(200).optional().or(z.literal('')),
  message: z.string().trim().min(5, 'Précisez votre besoin').max(4000),
  /**
   * Champ piège : invisible pour l'utilisateur, attirant pour les robots.
   * Accepté tel quel — c'est le gestionnaire, plus bas, qui rejette en silence.
   * Une contrainte de schéma (`max(0)`) renverrait une 422 nommant `company`
   * dans le corps de la réponse, ce qui désignerait le piège à l'attaquant.
   * Le plafond reste large mais fini : le champ ne sert pas de soute.
   */
  company: z.string().max(200).optional(),
  /** Millisecondes écoulées entre l'affichage et l'envoi du formulaire. */
  elapsedMs: z.coerce.number().min(0).optional(),
})

/** Fenêtre glissante en mémoire — suffisant pour un site vitrine mono-instance. */
const rateBuckets = new Map<string, number[]>()
const WINDOW_MS = 60 * 60 * 1000

function isRateLimited(key: string, limit: number): boolean {
  const now = Date.now()
  const hits = (rateBuckets.get(key) ?? []).filter((t) => now - t < WINDOW_MS)
  hits.push(now)
  rateBuckets.set(key, hits)

  // Purge opportuniste pour éviter une croissance non bornée de la Map.
  if (rateBuckets.size > 5000) {
    for (const [k, v] of rateBuckets) {
      if (!v.some((t) => now - t < WINDOW_MS)) rateBuckets.delete(k)
    }
  }

  return hits.length > limit
}

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const body = await readBody(event)
  const parsed = quoteSchema.safeParse(body)

  if (!parsed.success) {
    throw createError({
      statusCode: 422,
      statusMessage: 'Formulaire invalide',
      data: {
        // Format compact { champ: message } directement exploitable par le front.
        errors: Object.fromEntries(
          parsed.error.issues.map((i) => [i.path.join('.'), i.message]),
        ),
      },
    })
  }

  const payload = parsed.data

  // Robot : champ piège rempli, ou formulaire envoyé en moins de 2 secondes.
  // On renvoie un succès silencieux pour ne pas renseigner l'attaquant.
  if (payload.company || (payload.elapsedMs !== undefined && payload.elapsedMs < 2000)) {
    return { ok: true, id: null }
  }

  const ip = getRequestIP(event, { xForwardedFor: true }) ?? 'unknown'
  const ipHash = createHash('sha256').update(ip).digest('hex').slice(0, 64)
  const limit = Number(config.quoteRateLimitPerHour || 10)

  if (isRateLimited(ipHash, limit)) {
    throw createError({
      statusCode: 429,
      statusMessage: 'Trop de demandes. Réessayez dans une heure ou appelez-nous.',
    })
  }

  const record = {
    name: payload.name,
    phone: payload.phone,
    email: payload.email || null,
    branch: payload.branch,
    requestType: payload.requestType,
    eventDate: payload.eventDate || null,
    guestCount: payload.guestCount ?? null,
    location: payload.location || null,
    message: payload.message,
    ipHash,
    userAgent: getRequestHeader(event, 'user-agent')?.slice(0, 400) ?? null,
  }

  const db = useDb()
  if (!db) {
    // Pas de base configurée : on trace pour que la demande ne soit pas perdue.
    console.info('[devis] nouvelle demande (hors base) :', {
      ...record,
      ipHash: undefined,
    })
    return { ok: true, id: null, persisted: false }
  }

  try {
    const [row] = await db
      .insert(schema.quoteRequests)
      .values(record)
      .returning({ id: schema.quoteRequests.id })

    return { ok: true, id: row?.id ?? null, persisted: true }
  } catch (error) {
    console.error('[devis] écriture impossible :', error)
    throw createError({
      statusCode: 500,
      statusMessage: "Envoi impossible pour l'instant. Appelez-nous au (+228) 90 10 85 10.",
    })
  }
})
