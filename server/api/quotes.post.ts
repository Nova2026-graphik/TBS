/**
 * POST /api/quotes — enregistrement d'une demande de devis.
 *
 * Défenses en place :
 *  - validation stricte (Zod) et normalisation avant écriture ;
 *  - champ piège `company` : rempli = robot, on renvoie 200 sans écrire ;
 *  - délai minimum de remplissage (`elapsedMs`) ;
 *  - limitation de débit par IP hachée, comptée en base sur une fenêtre
 *    glissante d'une heure — cf. `utils/rateLimit.ts` — et sur une IP qui
 *    n'est lue dans un en-tête que derrière un proxy déclaré de confiance,
 *    cf. `utils/clientIp.ts`.
 *
 * Sans base de données, la demande est journalisée côté serveur et la
 * réponse reste un succès : le formulaire ne casse jamais en production.
 *
 * Une fois la demande acquise, l'équipe est alertée par e-mail et le
 * demandeur reçoit un accusé de réception. L'envoi est borné dans le temps et
 * ne peut jamais faire échouer la requête — cf. `utils/quoteNotification.ts`.
 */
import { createHash } from 'node:crypto'
import { useDb } from '../database/client'
import * as schema from '../database/schema'
import { getClientIp, parseTrustedProxy } from '../utils/clientIp'
import { notifyQuote } from '../utils/quoteNotification'
import { isQuoteRateLimited } from '../utils/rateLimit'
import { formatIssues, looksAutomated, quoteSchema } from '../utils/quoteValidation'

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const body = await readBody(event)
  const parsed = quoteSchema.safeParse(body)

  if (!parsed.success) {
    throw createError({
      statusCode: 422,
      statusMessage: 'Formulaire invalide',
      // Format compact { champ: message } directement exploitable par le front.
      data: { errors: formatIssues(parsed.error) },
    })
  }

  const payload = parsed.data

  // Robot : champ piège rempli, ou formulaire envoyé trop vite. On renvoie un
  // succès silencieux pour ne pas renseigner l'attaquant.
  if (looksAutomated(payload)) {
    return { ok: true, id: null }
  }

  const db = useDb()

  /**
   * Sans adresse fiable, la demande passe sans être comptée : ranger tous les
   * anonymes sous une même clé reviendrait à les faire se limiter les uns les
   * autres, et un seul robot suffirait à fermer le formulaire à tout le monde.
   * Le piège et le délai minimum restent en place pour ce cas.
   */
  const ip = getClientIp(event, {
    trustedProxy: parseTrustedProxy(config.security.trustedProxy),
    hops: Number(config.security.trustedProxyHops || 1),
  })
  const ipHash = ip ? createHash('sha256').update(ip).digest('hex').slice(0, 64) : null
  const limit = Number(config.quoteRateLimitPerHour || 10)

  if (ipHash) {
    const rate = await isQuoteRateLimited(db, ipHash, limit)
    if (rate.limited) {
      throw createError({
        statusCode: 429,
        statusMessage: 'Trop de demandes. Réessayez dans une heure ou appelez-nous.',
      })
    }
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

  let id: string | null = null
  let persisted = false

  if (db) {
    try {
      const [row] = await db
        .insert(schema.quoteRequests)
        .values(record)
        .returning({ id: schema.quoteRequests.id })

      id = row?.id ?? null
      persisted = true
    }
    catch (error) {
      console.error('[devis] écriture impossible :', error)
      throw createError({
        statusCode: 500,
        statusMessage: 'Envoi impossible pour l\'instant. Appelez-nous au (+228) 90 10 85 10.',
      })
    }
  }
  else {
    // Pas de base configurée : on trace pour que la demande ne soit pas perdue,
    // même si l'e-mail ne part pas non plus.
    console.info('[devis] nouvelle demande (hors base) :', {
      ...record,
      ipHash: undefined,
    })
  }

  // L'envoi est attendu — chaque message est plafonné à 8 s — pour que la
  // réponse dise la vérité sur la notification. Il ne lève jamais : la demande
  // est acquise, elle ne doit pas être perdue pour un prestataire mal luné.
  const notification = await notifyQuote({
    notice: {
      name: record.name,
      phone: record.phone,
      email: record.email,
      branch: record.branch,
      requestType: record.requestType,
      eventDate: record.eventDate,
      guestCount: record.guestCount,
      location: record.location,
      message: record.message,
      persisted,
      receivedAt: new Date(),
    },
    notifyEmail: config.notifyEmail,
    transport: config.mail,
    contact: {
      phonePrimary: config.public.phonePrimary,
      phoneSecondary: config.public.phoneSecondary,
      whatsapp: config.public.whatsapp,
      siteUrl: config.public.siteUrl,
    },
  })

  if (notification.sent.length) {
    console.info('[devis] notification envoyée :', notification.sent.join(', '))
  }
  if (notification.failed.configuration) {
    console.warn('[devis] notification non configurée :', notification.failed.configuration)
  }
  else if (Object.keys(notification.failed).length) {
    console.error('[devis] notification en échec :', notification.failed)
  }

  return { ok: true, id, persisted, notified: notification.sent.length > 0 }
})
