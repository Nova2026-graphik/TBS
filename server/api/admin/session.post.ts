/**
 * POST /api/admin/session — ouverture de session.
 *
 * Limité en débit par adresse : sans cela, un mot de passe unique se casse à
 * l'essai. Le refus ne distingue jamais « mot de passe faux » de « aucun mot
 * de passe fourni ».
 *
 * Le compte est tenu en base — partagé par toutes les instances — et ne
 * retient que les **échecs**. En mémoire, il ne valait rien en serverless ; et
 * en comptant aussi les réussites, dix connexions légitimes dans l'heure
 * verrouillaient l'accès à qui s'en sert normalement.
 */
import { createHash } from 'node:crypto'
import { z } from 'zod'
import {
  createSessionToken,
  isPasswordValid,
  SESSION_COOKIE,
  SESSION_TTL_MS,
} from '../../utils/adminSession'
import { useDb } from '../../database/client'
import { getClientIp, parseTrustedProxy } from '../../utils/clientIp'
import { isAdminRateLimited, recordAdminFailure } from '../../utils/rateLimit'
import { requireAdminEnabled } from '../../utils/requireAdmin'

/** Dix essais par heure et par adresse : large pour un humain, court pour un robot. */
const MAX_ATTEMPTS_PER_HOUR = 10

const schema = z.object({ password: z.string().min(1).max(200) })

export default defineEventHandler(async (event) => {
  const password = requireAdminEnabled()
  const config = useRuntimeConfig()

  const ip = getClientIp(event, {
    trustedProxy: parseTrustedProxy(config.security.trustedProxy),
    hops: Number(config.security.trustedProxyHops || 1),
  }) ?? 'inconnue'
  const key = `admin:${createHash('sha256').update(ip).digest('hex').slice(0, 32)}`

  const db = useDb()

  if ((await isAdminRateLimited(db, key, MAX_ATTEMPTS_PER_HOUR)).limited) {
    throw createError({
      statusCode: 429,
      statusMessage: 'Trop de tentatives. Réessayez dans une heure.',
    })
  }

  const parsed = schema.safeParse(await readBody(event))
  if (!parsed.success || !isPasswordValid(parsed.data.password, password)) {
    await recordAdminFailure(db, key)
    throw createError({ statusCode: 401, statusMessage: 'Mot de passe incorrect' })
  }

  const expiresAt = Date.now() + SESSION_TTL_MS
  setCookie(event, SESSION_COOKIE, createSessionToken(password, expiresAt), {
    httpOnly: true,
    sameSite: 'strict',
    secure: !import.meta.dev,
    path: '/',
    maxAge: Math.floor(SESSION_TTL_MS / 1000),
  })

  return { ok: true, expiresAt }
})
