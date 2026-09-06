/**
 * Transport e-mail — Resend ou Brevo, par API HTTP.
 *
 * Ni dépendance npm ni port SMTP : un `fetch` suffit, et le même code tourne
 * derrière un serveur Node, Vercel ou Cloudflare. Le prestataire se choisit
 * par configuration (`NUXT_MAIL_PROVIDER`), sans toucher au code — l'issue
 * laissait l'arbitrage ouvert entre Resend et Brevo.
 *
 * Les fonctions sont pures et sans import Nitro : elles s'exécutent aussi
 * hors serveur, ce qui permet de relire un rendu d'e-mail sans rien démarrer.
 */

export type MailProvider = 'resend' | 'brevo'

export interface MailTransport {
  provider: MailProvider
  apiKey: string
  /** Expéditeur « Nom <adresse> ». Le domaine doit être vérifié chez le prestataire. */
  from: string
}

export interface EmailMessage {
  to: string
  subject: string
  text: string
  html: string
  /** Adresse de réponse — le demandeur, pour qu'un « Répondre » tombe juste. */
  replyTo?: string
}

/** Le formulaire n'attend pas indéfiniment un prestataire injoignable. */
const SEND_TIMEOUT_MS = 8_000

const ENDPOINTS: Record<MailProvider, string> = {
  resend: 'https://api.resend.com/emails',
  brevo: 'https://api.brevo.com/v3/smtp/email',
}

/** « TBS Distribution <devis@…> » → `{ name, email }`. */
export function parseAddress(address: string): { name: string, email: string } {
  const match = address.match(/^\s*(.*?)\s*<([^>]+)>\s*$/)
  if (!match) return { name: '', email: address.trim() }
  return { name: (match[1] ?? '').replace(/^"|"$/g, ''), email: (match[2] ?? '').trim() }
}

/** Le transport tel qu'il sort de `runtimeConfig` : chaînes libres, non validées. */
export interface MailTransportInput {
  provider?: string
  apiKey?: string
  from?: string
}

const PROVIDERS = new Set<string>(['resend', 'brevo'] satisfies MailProvider[])

/** `true` si le transport est complètement renseigné et le prestataire connu. */
export function isMailTransportReady(
  transport: MailTransportInput,
): transport is MailTransport {
  return Boolean(
    transport.apiKey && transport.from && transport.provider && PROVIDERS.has(transport.provider),
  )
}

function requestFor(message: EmailMessage, transport: MailTransport): RequestInit {
  if (transport.provider === 'brevo') {
    const sender = parseAddress(transport.from)
    return {
      method: 'POST',
      headers: { 'api-key': transport.apiKey, 'content-type': 'application/json' },
      body: JSON.stringify({
        sender: sender.name ? sender : { email: sender.email },
        to: [{ email: message.to }],
        subject: message.subject,
        htmlContent: message.html,
        textContent: message.text,
        ...(message.replyTo ? { replyTo: { email: message.replyTo } } : {}),
      }),
    }
  }

  return {
    method: 'POST',
    headers: { 'authorization': `Bearer ${transport.apiKey}`, 'content-type': 'application/json' },
    body: JSON.stringify({
      from: transport.from,
      to: [message.to],
      subject: message.subject,
      html: message.html,
      text: message.text,
      ...(message.replyTo ? { reply_to: message.replyTo } : {}),
    }),
  }
}

/**
 * Envoie un message. Lève en cas d'échec — l'appelant décide quoi en faire ;
 * ici, une demande de devis n'est jamais perdue pour un e-mail manqué.
 */
export async function sendEmail(message: EmailMessage, transport: MailTransport): Promise<void> {
  const response = await fetch(ENDPOINTS[transport.provider], {
    ...requestFor(message, transport),
    signal: AbortSignal.timeout(SEND_TIMEOUT_MS),
  })

  if (!response.ok) {
    // Le corps porte le motif exact (domaine non vérifié, clé révoquée…) :
    // sans lui, le diagnostic en production est impossible.
    const detail = await response.text().catch(() => '')
    throw new Error(
      `${transport.provider} a refusé l'envoi (HTTP ${response.status}) ${detail}`.trim(),
    )
  }
}
