/** DELETE /api/admin/session — fermeture de session. */
import { SESSION_COOKIE } from '../../utils/adminSession'
import { requireAdminEnabled } from '../../utils/requireAdmin'

export default defineEventHandler((event) => {
  requireAdminEnabled()
  deleteCookie(event, SESSION_COOKIE, { path: '/' })
  return { ok: true }
})
