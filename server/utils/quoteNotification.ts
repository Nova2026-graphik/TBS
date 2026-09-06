/**
 * Notification d'une demande de devis : alerte à l'équipe, accusé de
 * réception au demandeur.
 *
 * Deux principes tenus par ce module :
 *  - l'envoi ne fait jamais échouer la demande — elle est déjà enregistrée ;
 *  - l'e-mail ne transporte aucune donnée technique interne (`ipHash`,
 *    `userAgent`) : elles servent l'anti-spam, pas le commercial qui rappelle.
 *
 * Aucun import Nitro : les gabarits se rendent hors serveur, ce qui permet de
 * les relire sans rien démarrer.
 */
import type { EmailMessage, MailTransportInput } from './mailer'
import { isMailTransportReady, sendEmail } from './mailer'

/** Ce qui est communiqué — sous-ensemble volontairement réduit de la demande. */
export interface QuoteNotice {
  name: string
  phone: string
  email: string | null
  branch: string
  requestType: string
  eventDate: string | null
  guestCount: number | null
  location: string | null
  message: string
  /** `false` sans base configurée : l'e-mail est alors la seule trace. */
  persisted: boolean
  receivedAt: Date
}

/** Coordonnées reprises de `runtimeConfig.public`, pour l'accusé de réception. */
export interface QuoteContact {
  phonePrimary: string
  phoneSecondary: string
  whatsapp: string
  siteUrl: string
}

const BRAND = '#3E3524'
const TIME_ZONE = 'Africa/Lome'

const receivedAtFormat = new Intl.DateTimeFormat('fr-FR', {
  dateStyle: 'full',
  timeStyle: 'short',
  timeZone: TIME_ZONE,
})

const eventDateFormat = new Intl.DateTimeFormat('fr-FR', {
  dateStyle: 'long',
  timeZone: TIME_ZONE,
})

/** Les valeurs viennent d'un formulaire public : rien n'entre brut dans le HTML. */
function escapeHtml(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;')
}

/** « TBS Events — location de matériel » → « TBS Events », pour l'objet. */
function shortBranch(branch: string): string {
  return (branch.split('—')[0] ?? branch).trim()
}

function formatEventDate(value: string | null): string | null {
  if (!value) return null
  // Midi UTC : le Togo est à UTC+0, aucun risque de basculer d'un jour.
  const date = new Date(`${value}T12:00:00Z`)
  return Number.isNaN(date.getTime()) ? value : eventDateFormat.format(date)
}

type Row = [label: string, value: string]

/** Les champs facultatifs vides ne sont pas affichés : l'e-mail reste lisible. */
function noticeRows(notice: QuoteNotice): Row[] {
  const rows: Row[] = [
    ['Nom', notice.name],
    ['Téléphone', notice.phone],
  ]

  if (notice.email) rows.push(['E-mail', notice.email])
  rows.push(['Branche', notice.branch], ['Type de demande', notice.requestType])

  const eventDate = formatEventDate(notice.eventDate)
  if (eventDate) rows.push(["Date de l'événement", eventDate])
  if (notice.guestCount !== null) rows.push(['Invités', String(notice.guestCount)])
  if (notice.location) rows.push(['Lieu', notice.location])

  rows.push(['Reçue le', receivedAtFormat.format(notice.receivedAt)])
  return rows
}

function textBlock(rows: Row[]): string {
  return rows.map(([label, value]) => `${label} : ${value}`).join('\n')
}

function htmlRows(rows: Row[]): string {
  return rows
    .map(
      ([label, value]) => `<tr>
      <th align="left" style="padding:6px 16px 6px 0;font-weight:400;color:#6B6353;white-space:nowrap;vertical-align:top">${escapeHtml(label)}</th>
      <td style="padding:6px 0;color:#26221A">${escapeHtml(value)}</td>
    </tr>`,
    )
    .join('\n')
}

function htmlDocument(title: string, body: string): string {
  return `<!doctype html>
<html lang="fr">
<body style="margin:0;padding:24px;background:#F5F2EC;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;font-size:15px;line-height:1.6;color:#26221A">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:640px;margin:0 auto;background:#FFFFFF">
    <tr>
      <td style="background:${BRAND};padding:20px 28px;color:#FFFFFF;font-size:13px;letter-spacing:0.18em;text-transform:uppercase">
        ${escapeHtml(title)}
      </td>
    </tr>
    <tr><td style="padding:28px">${body}</td></tr>
  </table>
</body>
</html>`
}

/** Alerte interne : tout ce qu'il faut pour rappeler, rien de plus. */
export function buildTeamEmail(notice: QuoteNotice, to: string): EmailMessage {
  const rows = noticeRows(notice)
  const warning = notice.persisted
    ? null
    : "Aucune base de données n'est configurée : cet e-mail est la seule trace de la demande."

  const text = [
    `Nouvelle demande de devis — ${shortBranch(notice.branch)}`,
    '',
    textBlock(rows),
    '',
    'Besoin exprimé :',
    notice.message,
    '',
    `Rappeler : ${notice.phone}`,
    warning ? `\n⚠ ${warning}` : '',
  ]
    .join('\n')
    .trim()

  const html = htmlDocument(
    'Nouvelle demande de devis',
    `${warning ? `<p style="margin:0 0 20px;padding:12px 16px;background:#FBEAE5;color:#8A2B12">${escapeHtml(warning)}</p>` : ''}
     <table role="presentation" cellpadding="0" cellspacing="0" style="width:100%;font-size:15px">${htmlRows(rows)}</table>
     <p style="margin:24px 0 6px;color:#6B6353;font-size:13px;letter-spacing:0.12em;text-transform:uppercase">Besoin exprimé</p>
     <p style="margin:0;white-space:pre-wrap">${escapeHtml(notice.message)}</p>
     <p style="margin:28px 0 0">
       <a href="tel:${escapeHtml(notice.phone.replace(/[^\d+]/g, ''))}" style="display:inline-block;padding:12px 22px;background:${BRAND};color:#FFFFFF;text-decoration:none">Appeler ${escapeHtml(notice.name)}</a>
     </p>`,
  )

  return {
    to,
    subject: `Devis — ${shortBranch(notice.branch)} · ${notice.name}`,
    text,
    html,
    // « Répondre » écrit au demandeur, pas à la boîte d'envoi.
    ...(notice.email ? { replyTo: notice.email } : {}),
  }
}

/** Accusé de réception — envoyé seulement si le demandeur a laissé un e-mail. */
export function buildAcknowledgementEmail(
  notice: QuoteNotice,
  contact: QuoteContact,
): EmailMessage | null {
  if (!notice.email) return null

  const rows = noticeRows(notice).filter(([label]) => label !== 'Reçue le')
  const phones = `${contact.phonePrimary} · ${contact.phoneSecondary}`

  const text = [
    `Bonjour ${notice.name},`,
    '',
    'Nous avons bien reçu votre demande de devis. Un conseiller TBS vous',
    'rappelle sous 24 h ouvrées avec une proposition chiffrée.',
    '',
    'Récapitulatif :',
    textBlock(rows),
    '',
    'Besoin exprimé :',
    notice.message,
    '',
    `Une précision à apporter ? Répondez à cet e-mail ou appelez-nous : ${phones}`,
    `WhatsApp : https://wa.me/${contact.whatsapp}`,
    '',
    'TBS Distribution S.A.R.L — Agôè-Démakpoè, Lomé, Togo',
    contact.siteUrl,
  ].join('\n')

  const html = htmlDocument(
    'Votre demande de devis',
    `<p style="margin:0 0 16px">Bonjour ${escapeHtml(notice.name)},</p>
     <p style="margin:0 0 24px">Nous avons bien reçu votre demande. Un conseiller TBS vous rappelle
     <strong>sous 24 h ouvrées</strong> avec une proposition chiffrée.</p>
     <p style="margin:0 0 6px;color:#6B6353;font-size:13px;letter-spacing:0.12em;text-transform:uppercase">Récapitulatif</p>
     <table role="presentation" cellpadding="0" cellspacing="0" style="width:100%;font-size:15px">${htmlRows(rows)}</table>
     <p style="margin:24px 0 6px;color:#6B6353;font-size:13px;letter-spacing:0.12em;text-transform:uppercase">Besoin exprimé</p>
     <p style="margin:0;white-space:pre-wrap">${escapeHtml(notice.message)}</p>
     <p style="margin:28px 0 0">Une précision à apporter ? Répondez à cet e-mail, appelez le
     ${escapeHtml(phones)} ou écrivez-nous sur
     <a href="https://wa.me/${escapeHtml(contact.whatsapp)}" style="color:${BRAND}">WhatsApp</a>.</p>
     <p style="margin:24px 0 0;color:#6B6353;font-size:13px">
       TBS Distribution S.A.R.L — Agôè-Démakpoè, Lomé, Togo<br>
       <a href="${escapeHtml(contact.siteUrl)}" style="color:#6B6353">${escapeHtml(contact.siteUrl)}</a>
     </p>`,
  )

  return { to: notice.email, subject: 'Votre demande de devis — TBS Distribution', text, html }
}

export interface NotifyQuoteOptions {
  notice: QuoteNotice
  /** Boîte de l'équipe (`NUXT_NOTIFY_EMAIL`). */
  notifyEmail: string
  transport: MailTransportInput
  contact: QuoteContact
}

export interface NotifyQuoteResult {
  /** Destinataires servis : `equipe`, `demandeur`. */
  sent: string[]
  /** Motif par destinataire en échec, ou raison globale si rien n'est parti. */
  failed: Record<string, string>
}

/**
 * Envoie les deux messages. Ne lève jamais : un devis enregistré ne doit pas
 * être perdu parce qu'un prestataire d'e-mail répond mal.
 */
export async function notifyQuote(options: NotifyQuoteOptions): Promise<NotifyQuoteResult> {
  const { notice, notifyEmail, transport, contact } = options

  if (!isMailTransportReady(transport)) {
    return {
      sent: [],
      failed: {
        configuration:
          'NUXT_MAIL_API_KEY ou NUXT_MAIL_FROM absent, ou NUXT_MAIL_PROVIDER hors resend | brevo',
      },
    }
  }
  if (!notifyEmail) {
    return { sent: [], failed: { configuration: 'NUXT_NOTIFY_EMAIL absent' } }
  }

  const messages: [string, EmailMessage][] = [['equipe', buildTeamEmail(notice, notifyEmail)]]

  const acknowledgement = buildAcknowledgementEmail(notice, contact)
  if (acknowledgement) messages.push(['demandeur', acknowledgement])

  const results = await Promise.allSettled(
    messages.map(([, message]) => sendEmail(message, transport)),
  )

  const sent: string[] = []
  const failed: Record<string, string> = {}

  results.forEach((result, i) => {
    const recipient = messages[i]?.[0] ?? 'inconnu'
    if (result.status === 'fulfilled') sent.push(recipient)
    else failed[recipient] = result.reason instanceof Error ? result.reason.message : String(result.reason)
  })

  return { sent, failed }
}
