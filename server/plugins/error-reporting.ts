/**
 * Plugin Nitro — les erreurs serveur cessent d'être silencieuses.
 *
 * Le hook `error` de Nitro reçoit toutes les erreurs non rattrapées, quelle
 * que soit la route. On en tire une ligne de journal structurée, toujours, et
 * une alerte par e-mail quand un prestataire d'envoi est configuré — celui qui
 * sert déjà les notifications de devis, aucun compte supplémentaire.
 *
 * L'envoi ne peut pas propager d'erreur : signaler une panne ne doit pas en
 * provoquer une seconde.
 */
import { isMailTransportReady, sendEmail } from '../utils/mailer'
import {
  buildErrorReport,
  formatAlertBody,
  formatLogLine,
  isReportable,
  shouldAlert,
} from '../utils/errorReporter'

export default defineNitroPlugin((nitroApp) => {
  const config = useRuntimeConfig()

  nitroApp.hooks.hook('error', (error, { event }) => {
    const statusCode = (error as { statusCode?: number })?.statusCode
    if (!isReportable(statusCode)) return

    const report = buildErrorReport(error, {
      method: event?.method,
      path: event?.path,
      statusCode,
    })

    console.error(formatLogLine(report), report.stack ?? '')

    if (!shouldAlert(report.signature)) return
    if (!config.notifyEmail || !isMailTransportReady(config.mail)) return

    // Volontairement non attendu : la réponse d'erreur part immédiatement,
    // l'alerte suit. Toute défaillance d'envoi est avalée ici même.
    void sendEmail(
      {
        to: config.notifyEmail,
        subject: `Erreur ${report.statusCode} — ${report.path}`,
        text: formatAlertBody(report, config.public.siteUrl),
        html: `<pre style="font:13px/1.6 ui-monospace,monospace;white-space:pre-wrap">${formatAlertBody(
          report,
          config.public.siteUrl,
        ).replace(/[<>&]/g, (c) => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;' })[c] ?? c)}</pre>`,
      },
      config.mail,
    ).catch((sendError) => {
      console.error("[erreur] alerte non envoyée :", sendError)
    })
  })
})
