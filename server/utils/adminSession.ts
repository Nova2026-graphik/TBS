/**
 * Session de l'espace de suivi des devis.
 *
 * Un seul secret partagé, pas de comptes : l'écran sert à deux ou trois
 * personnes chez TBS, et gérer des utilisateurs coûterait plus cher que le
 * problème ne vaut. Le mot de passe n'est jamais stocké ni transmis en
 * clair au-delà de l'envoi du formulaire ; le navigateur ne garde qu'un jeton
 * signé, sans droit de le forger.
 *
 * Rien de maison dans la cryptographie : HMAC-SHA256 sur une date
 * d'expiration, comparaison à temps constant. La clé dérive du mot de passe,
 * ce qui évite une seconde variable d'environnement — et fait qu'un
 * changement de mot de passe déconnecte tout le monde, ce qui est le
 * comportement attendu.
 *
 * **Sans `NUXT_ADMIN_PASSWORD`, l'espace n'existe pas** : les routes
 * répondent 404. Un déploiement qui oublie la variable n'ouvre pas un accès
 * libre aux demandes de devis.
 */
import { createHmac, timingSafeEqual } from 'node:crypto'

/** Durée d'une session : une journée de travail. */
export const SESSION_TTL_MS = 8 * 60 * 60 * 1000

/** Nom du cookie de session. */
export const SESSION_COOKIE = 'tbs_admin'

/** Longueur minimale exigée du mot de passe, au démarrage. */
export const MIN_PASSWORD_LENGTH = 12

/** `true` si l'espace de suivi est activé. */
export function isAdminEnabled(password: string | undefined): password is string {
  return typeof password === 'string' && password.length > 0
}

/** Clé de signature dérivée du mot de passe. */
function signingKey(password: string): Buffer {
  return createHmac('sha256', 'tbs-admin-session-v1').update(password).digest()
}

function sign(payload: string, password: string): string {
  return createHmac('sha256', signingKey(password)).update(payload).digest('base64url')
}

/** Comparaison à temps constant — une comparaison naïve fuit le préfixe correct. */
export function safeEqual(a: string, b: string): boolean {
  const bufA = Buffer.from(a)
  const bufB = Buffer.from(b)
  // `timingSafeEqual` exige des longueurs égales ; on compare d'abord une
  // empreinte, de longueur fixe, pour ne pas révéler la longueur attendue.
  const hashA = createHmac('sha256', 'compare').update(bufA).digest()
  const hashB = createHmac('sha256', 'compare').update(bufB).digest()
  return timingSafeEqual(hashA, hashB)
}

/** Vérifie le mot de passe saisi. */
export function isPasswordValid(candidate: string, password: string): boolean {
  return safeEqual(candidate, password)
}

/** Fabrique un jeton valable jusqu'à `expiresAt`. */
export function createSessionToken(password: string, expiresAt: number): string {
  const payload = String(expiresAt)
  return `${payload}.${sign(payload, password)}`
}

/** `true` si le jeton est authentique et non expiré. */
export function verifySessionToken(
  token: string | undefined,
  password: string,
  now = Date.now(),
): boolean {
  if (!token) return false

  const separator = token.lastIndexOf('.')
  if (separator <= 0) return false

  const payload = token.slice(0, separator)
  const signature = token.slice(separator + 1)

  if (!safeEqual(signature, sign(payload, password))) return false

  const expiresAt = Number(payload)
  return Number.isFinite(expiresAt) && expiresAt > now
}

/**
 * Défauts refusés au démarrage. Un mot de passe court ou évident sur une
 * page publique n'est pas une protection, c'est une formalité.
 */
export function passwordWeakness(password: string): string | null {
  if (password.length < MIN_PASSWORD_LENGTH) {
    return `moins de ${MIN_PASSWORD_LENGTH} caractères`
  }
  if (/^(admin|password|motdepasse|tbs)/i.test(password)) {
    return 'commence par un mot évident'
  }
  return null
}
