import { describe, expect, it } from 'vitest'
import { buildMailRequest, parseAddress, parseRecipients, sendEmail } from '../../server/utils/mailer'
import type { MailTransport } from '../../server/utils/mailer'

/**
 * Le transport d'e-mail n'a jamais été vérifié contre les prestataires depuis
 * le dépôt : ces tests relisent la requête produite, ce qui est la seule
 * chose que l'on contrôle de ce côté-ci.
 */
const BREVO: MailTransport = { provider: 'brevo', apiKey: 'xkeysib-test', from: 'TBS Distribution <devis@tbstogo.com>' }
const RESEND: MailTransport = { provider: 'resend', apiKey: 're_test', from: 'TBS Distribution <devis@tbstogo.com>' }

const corps = (init: RequestInit) => JSON.parse(String(init.body)) as Record<string, unknown>

describe('parseRecipients', () => {
  it('lit une adresse seule', () => {
    expect(parseRecipients('tbstogo228@gmail.com')).toEqual(['tbstogo228@gmail.com'])
  })

  it('sépare sur la virgule et le point-virgule, espaces compris', () => {
    expect(parseRecipients(' tbstogo228@gmail.com , contact@tbstogo.com; equipe@tbstogo.com '))
      .toEqual(['tbstogo228@gmail.com', 'contact@tbstogo.com', 'equipe@tbstogo.com'])
  })

  it('ignore les entrées vides', () => {
    expect(parseRecipients('a@x.tg,,  ,b@y.tg,')).toEqual(['a@x.tg', 'b@y.tg'])
    expect(parseRecipients(' , ; ')).toEqual([])
  })

  it('écarte les doublons sans tenir compte de la casse', () => {
    expect(parseRecipients('Contact@TBStogo.com, contact@tbstogo.com')).toEqual(['Contact@TBStogo.com'])
  })
})

describe('buildMailRequest', () => {
  const message = {
    to: 'tbstogo228@gmail.com, contact@tbstogo.com',
    subject: 'Nouvelle demande',
    text: 'texte',
    html: '<p>html</p>',
    replyTo: 'client@example.tg',
  }

  it('Brevo : un objet par destinataire, clé dans `api-key`', () => {
    const requete = buildMailRequest(message, BREVO)
    expect((requete.headers as Record<string, string>)['api-key']).toBe('xkeysib-test')
    expect(corps(requete)).toMatchObject({
      sender: { name: 'TBS Distribution', email: 'devis@tbstogo.com' },
      to: [{ email: 'tbstogo228@gmail.com' }, { email: 'contact@tbstogo.com' }],
      replyTo: { email: 'client@example.tg' },
      htmlContent: '<p>html</p>',
      textContent: 'texte',
    })
  })

  it('Resend : un tableau d’adresses, clé en `Bearer`', () => {
    const requete = buildMailRequest(message, RESEND)
    expect((requete.headers as Record<string, string>).authorization).toBe('Bearer re_test')
    expect(corps(requete)).toMatchObject({
      to: ['tbstogo228@gmail.com', 'contact@tbstogo.com'],
      reply_to: 'client@example.tg',
    })
  })

  it('garde le cas d’un seul destinataire inchangé', () => {
    expect(corps(buildMailRequest({ ...message, to: 'a@x.tg' }, BREVO)).to).toEqual([{ email: 'a@x.tg' }])
  })
})

describe('sendEmail', () => {
  it('refuse une liste vide sans rien envoyer', async () => {
    await expect(sendEmail({ to: ' , ', subject: 's', text: 't', html: 'h' }, BREVO))
      .rejects.toThrow('Aucun destinataire')
  })
})

describe('parseAddress', () => {
  it('sépare le nom et l’adresse', () => {
    expect(parseAddress('TBS Distribution <devis@tbstogo.com>')).toEqual({ name: 'TBS Distribution', email: 'devis@tbstogo.com' })
    expect(parseAddress('devis@tbstogo.com')).toEqual({ name: '', email: 'devis@tbstogo.com' })
  })
})
