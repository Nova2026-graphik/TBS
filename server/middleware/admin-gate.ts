/**
 * Sans mot de passe configuré, `/admin` n'existe pas — page comprise.
 *
 * La garde des routes `/api/admin/*` suffisait à protéger les données, mais
 * l'écran se serait affiché, vide, en promettant un espace inaccessible. Mieux
 * vaut une page introuvable : rien à deviner, rien à chercher.
 *
 * Ce middleware ne couvre que des routes rendues à la volée — `/admin` est
 * explicitement exclu du pré-rendu.
 */
import { adminPassword } from '../utils/requireAdmin'

export default defineEventHandler((event) => {
  const path = event.path.split('?')[0] ?? ''
  if (path !== '/admin' && !path.startsWith('/admin/')) return
  if (adminPassword()) return

  throw createError({ statusCode: 404, statusMessage: 'Page introuvable' })
})
