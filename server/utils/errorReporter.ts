/**
 * Signalement des erreurs serveur.
 *
 * `console.error` était le seul dispositif, et personne ne lit les journaux
 * d'un hébergement mutualisé. Une panne de `/api/quotes` se traduit par des
 * devis perdus, en silence — exactement ce qu'il faut éviter.
 *
 * Deux règles tiennent ce module :
 *
 *  - **rien de personnel ne sort.** Le corps de la requête n'est jamais lu, la
 *    chaîne de requête est retirée du chemin, et les en-têtes ne sont pas
 *    joints. Une alerte sur une demande de devis ne doit pas republier la
 *    demande ;
 *  - **on n'inonde pas.** Une même panne se répète des centaines de fois par
 *    minute ; une signature d'erreur ne déclenche qu'une alerte par fenêtre.
 */

/** Délai minimal entre deux alertes portant la même signature. */
export const ALERT_WINDOW_MS = 15 * 60 * 1000

/** Au-delà, ce n'est plus une erreur serveur mais une requête mal formée. */
const SERVER_ERROR_THRESHOLD = 500

export interface ErrorContext {
  method?: string
  path?: string
  statusCode?: number
}

export interface ErrorReport {
  /** Regroupe les occurrences d'une même panne. */
  signature: string
  statusCode: number
  method: string
  /** Chemin sans chaîne de requête : elle peut porter des données saisies. */
  path: string
  message: string
  /** Pile tronquée — de quoi situer, pas de quoi tout relire. */
  stack?: string
  at: string
}

/**
 * `true` si l'erreur mérite une alerte. Les 4xx sont le fait du client — une
 * validation refusée, une page absente — et n'apprennent rien sur la santé du
 * service.
 */
export function isReportable(statusCode: number | undefined): boolean {
  return (statusCode ?? SERVER_ERROR_THRESHOLD) >= SERVER_ERROR_THRESHOLD
}

/** Construit un rapport sans donnée personnelle. */
export function buildErrorReport(
  error: unknown,
  context: ErrorContext = {},
  now = new Date(),
): ErrorReport {
  const err = error as { statusCode?: number, message?: string, stack?: string }
  const statusCode = context.statusCode ?? err?.statusCode ?? SERVER_ERROR_THRESHOLD
  const message = err?.message ?? String(error)
  const path = (context.path ?? '').split('?')[0] ?? ''
  const method = context.method ?? 'GET'

  return {
    signature: `${statusCode} ${method} ${path} ${message}`.slice(0, 200),
    statusCode,
    method,
    path,
    message: message.slice(0, 500),
    stack: err?.stack?.split('\n').slice(0, 8).join('\n'),
    at: now.toISOString(),
  }
}

const lastAlertBySignature = new Map<string, number>()

/**
 * `true` si cette signature n'a pas déjà déclenché une alerte récemment.
 * Purge opportuniste : la carte ne grandit pas indéfiniment.
 */
export function shouldAlert(signature: string, now = Date.now()): boolean {
  const previous = lastAlertBySignature.get(signature)
  if (previous !== undefined && now - previous < ALERT_WINDOW_MS) return false

  lastAlertBySignature.set(signature, now)

  if (lastAlertBySignature.size > 500) {
    for (const [key, at] of lastAlertBySignature) {
      if (now - at >= ALERT_WINDOW_MS) lastAlertBySignature.delete(key)
    }
  }

  return true
}

/** Remet le compteur d'alertes à zéro — utile aux tests. */
export function resetAlertWindow(): void {
  lastAlertBySignature.clear()
}

/** Ligne unique, greppable, écrite même sans prestataire d'envoi configuré. */
export function formatLogLine(report: ErrorReport): string {
  return `[erreur] ${report.statusCode} ${report.method} ${report.path} — ${report.message}`
}

/** Corps de l'alerte envoyée à l'équipe technique. */
export function formatAlertBody(report: ErrorReport, siteUrl: string): string {
  return [
    `${report.statusCode} sur ${report.method} ${report.path}`,
    '',
    report.message,
    '',
    report.stack ?? '(pas de pile)',
    '',
    `Site : ${siteUrl}`,
    `Survenue le ${report.at}`,
    '',
    `Alerte unique par tranche de ${ALERT_WINDOW_MS / 60000} minutes pour une même erreur.`,
  ].join('\n')
}
