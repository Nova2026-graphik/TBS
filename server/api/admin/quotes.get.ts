/**
 * GET /api/admin/quotes — liste des demandes, filtrable.
 *
 * `ip_hash` n'est jamais renvoyé : il sert la limitation de débit, pas le
 * suivi commercial. Le `user_agent` non plus dans la liste ; il n'apparaît
 * qu'au détail, où il aide à juger un envoi automatisé.
 */
import { desc, eq } from 'drizzle-orm'
import { z } from 'zod'
import { useDb } from '../../database/client'
import * as schema from '../../database/schema'
import { requireAdmin } from '../../utils/requireAdmin'

const PAGE_SIZE = 50

const querySchema = z.object({
  statut: z.enum(schema.quoteStatusEnum.enumValues).optional(),
  page: z.coerce.number().int().min(1).max(1000).default(1),
})

export default defineEventHandler(async (event) => {
  requireAdmin(event)

  const db = useDb()
  if (!db) {
    throw createError({
      statusCode: 503,
      statusMessage: 'Aucune base de données configurée : les demandes ne sont pas enregistrées.',
    })
  }

  const parsed = querySchema.safeParse(getQuery(event))
  if (!parsed.success) {
    throw createError({ statusCode: 422, statusMessage: 'Filtre invalide' })
  }

  const { statut, page } = parsed.data
  const q = schema.quoteRequests

  const rows = await db
    .select({
      id: q.id,
      name: q.name,
      phone: q.phone,
      email: q.email,
      branch: q.branch,
      requestType: q.requestType,
      eventDate: q.eventDate,
      guestCount: q.guestCount,
      location: q.location,
      status: q.status,
      createdAt: q.createdAt,
      handledAt: q.handledAt,
    })
    .from(q)
    .where(statut ? eq(q.status, statut) : undefined)
    .orderBy(desc(q.createdAt))
    .limit(PAGE_SIZE + 1)
    .offset((page - 1) * PAGE_SIZE)

  return {
    quotes: rows.slice(0, PAGE_SIZE),
    page,
    hasMore: rows.length > PAGE_SIZE,
  }
})
