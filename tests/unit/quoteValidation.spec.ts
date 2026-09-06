import { describe, expect, it } from 'vitest'
import {
  formatIssues,
  looksAutomated,
  MIN_FILL_MS,
  quoteSchema,
} from '../../server/utils/quoteValidation'

/** Demande minimale valide : les cinq champs que le formulaire impose. */
function demande(overrides: Record<string, unknown> = {}) {
  return {
    name: 'Akouvi Adjovi',
    phone: '+228 90 10 85 10',
    branch: 'TBS Events — location de matériel de réception',
    requestType: 'Mariage',
    message: 'Dressage de 200 couverts, nappage et sonorisation.',
    ...overrides,
  }
}

describe('schéma de la demande de devis', () => {
  it('accepte une demande minimale', () => {
    const parsed = quoteSchema.safeParse(demande())
    expect(parsed.success).toBe(true)
  })

  it('rejette un nom d’une seule lettre', () => {
    const parsed = quoteSchema.safeParse(demande({ name: 'A' }))
    expect(parsed.success).toBe(false)
    if (!parsed.success) expect(formatIssues(parsed.error).name).toBe('Nom trop court')
  })

  it('rejette un numéro contenant des lettres', () => {
    const parsed = quoteSchema.safeParse(demande({ phone: 'appelez-moi' }))
    expect(parsed.success).toBe(false)
    if (!parsed.success) expect(formatIssues(parsed.error).phone).toBe('Numéro invalide')
  })

  it('accepte les formes locales du numéro togolais', () => {
    for (const phone of ['+228 90 10 85 10', '90108510', '(+228) 97-80-08-80', '228 90.10.85.10']) {
      expect(quoteSchema.safeParse(demande({ phone })).success).toBe(true)
    }
  })

  it('accepte une adresse e-mail absente ou vide, refuse une adresse fautive', () => {
    expect(quoteSchema.safeParse(demande()).success).toBe(true)
    expect(quoteSchema.safeParse(demande({ email: '' })).success).toBe(true)
    expect(quoteSchema.safeParse(demande({ email: 'akouvi@' })).success).toBe(false)
  })

  it('exige un besoin décrit, pas un accusé de réception', () => {
    const parsed = quoteSchema.safeParse(demande({ message: 'ok' }))
    expect(parsed.success).toBe(false)
    if (!parsed.success) expect(formatIssues(parsed.error).message).toBe('Précisez votre besoin')
  })

  it('convertit le nombre d’invités envoyé sous forme de chaîne', () => {
    const parsed = quoteSchema.safeParse(demande({ guestCount: '350' }))
    expect(parsed.success).toBe(true)
    if (parsed.success) expect(parsed.data.guestCount).toBe(350)
  })

  it('refuse une date d’événement mal formée', () => {
    expect(quoteSchema.safeParse(demande({ eventDate: '2026-07-04' })).success).toBe(true)
    expect(quoteSchema.safeParse(demande({ eventDate: '04/07/2026' })).success).toBe(false)
  })

  it('coupe les espaces autour des valeurs', () => {
    const parsed = quoteSchema.safeParse(demande({ name: '  Akouvi Adjovi  ' }))
    expect(parsed.success).toBe(true)
    if (parsed.success) expect(parsed.data.name).toBe('Akouvi Adjovi')
  })

  it('borne la taille du message', () => {
    expect(quoteSchema.safeParse(demande({ message: 'a'.repeat(4001) })).success).toBe(false)
  })

  /**
   * Le piège doit passer la validation : c'est `looksAutomated` qui rejette,
   * en silence. Une erreur nommant `company` désignerait le piège au robot.
   */
  it('laisse passer le champ piège au stade du schéma', () => {
    const parsed = quoteSchema.safeParse(demande({ company: 'ACME Corp' }))
    expect(parsed.success).toBe(true)
  })

  it('ne nomme jamais le piège dans les erreurs renvoyées', () => {
    const parsed = quoteSchema.safeParse(demande({ name: 'A', company: 'ACME Corp' }))
    expect(parsed.success).toBe(false)
    if (!parsed.success) expect(Object.keys(formatIssues(parsed.error))).not.toContain('company')
  })
})

describe('détection des envois automatisés', () => {
  it('rejette un envoi qui a rempli le champ piège', () => {
    expect(looksAutomated({ company: 'ACME Corp', elapsedMs: 30_000 })).toBe(true)
  })

  it('rejette un envoi plus rapide que le délai minimum', () => {
    expect(looksAutomated({ company: '', elapsedMs: MIN_FILL_MS - 1 })).toBe(true)
  })

  it('accepte un envoi à la limite exacte du délai', () => {
    expect(looksAutomated({ company: '', elapsedMs: MIN_FILL_MS })).toBe(false)
  })

  it('accepte un envoi sans mesure de durée', () => {
    // Le client peut ne rien envoyer : l'absence de mesure ne condamne pas.
    expect(looksAutomated({ company: undefined, elapsedMs: undefined })).toBe(false)
  })
})
