/**
 * Garde d'accès de l'espace de suivi.
 *
 * Deux refus, volontairement distincts :
 *
 *  - **404** quand aucun mot de passe n'est configuré. L'espace n'existe pas ;
 *    inutile d'annoncer à un visiteur qu'il existe une porte ailleurs ;
 *  - **401** quand le jeton manque ou ne vaut rien.
 */
import type { H3Event } from 'h3'
import {
  isAdminEnabled,
  passwordWeakness,
  SESSION_COOKIE,
  verifySessionToken,
} from './adminSession'

let warned = false

/** Mot de passe configuré, ou `null` si l'espace est éteint. */
export function adminPassword(): string | null {
  const password = useRuntimeConfig().admin?.password
  return isAdminEnabled(password) ? password : null
}

/** Lève 404 si l'espace est éteint ; renvoie le mot de passe sinon. */
export function requireAdminEnabled(): string {
  const password = adminPassword()
  if (!password) {
    throw createError({ statusCode: 404, statusMessage: 'Page introuvable' })
  }

  // Un mot de passe court sur une page publique n'est pas une protection.
  if (!warned) {
    warned = true
    const weakness = passwordWeakness(password)
    if (weakness) console.warn(`[admin] mot de passe faible : ${weakness}`)
  }

  return password
}

/** Lève 404 ou 401 ; ne renvoie que si la requête est authentifiée. */
export function requireAdmin(event: H3Event): void {
  const password = requireAdminEnabled()

  if (!verifySessionToken(getCookie(event, SESSION_COOKIE), password)) {
    throw createError({ statusCode: 401, statusMessage: 'Session expirée' })
  }
}
