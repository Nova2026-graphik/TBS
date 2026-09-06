/**
 * PATCH /api/admin/quotes/:id — statut et note interne.
 *
 * `handled_at` se pose tout seul dès qu'une demande quitte « nouveau » : c'est
 * la date qui fait foi pour la conservation, et personne ne pensera à la
 * renseigner à la main.
 */
import { eq } from 'drizzle-orm'
import { z } from 'zod'
import { useDb } from '../../../database/client'
import * as schema from '../../../database/schema'
import { requireAdmin } from '../../../utils/requireAdmin'

const bodySchema = z
  .object({
    status: z.enum(schema.quoteStatusEnum.enumValues).optional(),
    internalNote: z.string().max(4000).nullable().optional(),
  })
  .refine(v => v.status !== undefined || v.internalNote !== undefined, {
    message: 'Rien à modifier',
  })

export default defineEventHandler(async (event) => {
  requireAdmin(event)

  const id = z.string().uuid().safeParse(getRouterParam(event, 'id'))
  if (!id.success) throw createError({ statusCode: 404, statusMessage: 'Demande introuvable' })

  const parsed = bodySchema.safeParse(await readBody(event))
  if (!parsed.success) throw createError({ statusCode: 422, statusMessage: 'Modification invalide' })

  const db = useDb()
  if (!db) {
    throw createError({ statusCode: 503, statusMessage: 'Aucune base de données configurée.' })
  }

  const q = schema.quoteRequests
  const changes: Partial<typeof q.$inferInsert> = {}

  if (parsed.data.status !== undefined) {
    changes.status = parsed.data.status
    changes.handledAt = parsed.data.status === 'nouveau' ? null : new Date()
  }
  if (parsed.data.internalNote !== undefined) {
    changes.internalNote = parsed.data.internalNote || null
  }

  const [row] = await db
    .update(q)
    .set(changes)
    .where(eq(q.id, id.data))
    .returning({ id: q.id, status: q.status, handledAt: q.handledAt, internalNote: q.internalNote })

  if (!row) throw createError({ statusCode: 404, statusMessage: 'Demande introuvable' })
  return row
})
