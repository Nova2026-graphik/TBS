/** GET /api/admin/quotes/:id — détail d'une demande. */
import { eq } from 'drizzle-orm'
import { z } from 'zod'
import { useDb } from '../../../database/client'
import * as schema from '../../../database/schema'
import { requireAdmin } from '../../../utils/requireAdmin'

export default defineEventHandler(async (event) => {
  requireAdmin(event)

  const id = z.string().uuid().safeParse(getRouterParam(event, 'id'))
  if (!id.success) throw createError({ statusCode: 404, statusMessage: 'Demande introuvable' })

  const db = useDb()
  if (!db) {
    throw createError({ statusCode: 503, statusMessage: 'Aucune base de données configurée.' })
  }

  const q = schema.quoteRequests
  const [row] = await db
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
      message: q.message,
      status: q.status,
      internalNote: q.internalNote,
      // Utile pour juger un envoi automatisé ; `ip_hash` reste hors de portée.
      userAgent: q.userAgent,
      createdAt: q.createdAt,
      handledAt: q.handledAt,
    })
    .from(q)
    .where(eq(q.id, id.data))
    .limit(1)

  if (!row) throw createError({ statusCode: 404, statusMessage: 'Demande introuvable' })
  return row
})
