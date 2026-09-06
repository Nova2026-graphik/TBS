import { describe, expect, it } from 'vitest'
import { quoteStatusEnum } from '../../server/database/schema'
import {
  formatAdminDate,
  QUOTE_STATUS_LABELS,
  QUOTE_STATUSES,
  quoteStatusLabel,
  shortBranchLabel,
  whatsappReplyLink,
} from '../../shared/utils/adminQuotes'

describe('statuts', () => {
  it('correspondent exactement à l’énumération de la base', () => {
    expect([...QUOTE_STATUSES]).toEqual([...quoteStatusEnum.enumValues])
  })

  it('ont tous un intitulé et une couleur', () => {
    expect(QUOTE_STATUS_LABELS.map(s => s.value)).toEqual([...QUOTE_STATUSES])
    for (const s of QUOTE_STATUS_LABELS) {
      expect(s.label.length).toBeGreaterThan(0)
      expect(s.tone).toMatch(/^#[0-9A-Fa-f]{6}$/)
    }
  })

  it('affiche un intitulé lisible', () => {
    expect(quoteStatusLabel('devis_envoye')).toBe('Devis envoyé')
  })
})

describe('libellé de branche', () => {
  it('garde la marque, écarte la description', () => {
    expect(shortBranchLabel('TBS Events — location de matériel de réception')).toBe('TBS Events')
    expect(shortBranchLabel('Plusieurs branches')).toBe('Plusieurs branches')
  })
})

describe('date', () => {
  it('rend une date lisible à l’heure du Togo', () => {
    expect(formatAdminDate('2026-09-06T09:12:00Z')).toContain('06/09/2026')
  })

  it('ne casse pas sur une valeur absente ou invalide', () => {
    expect(formatAdminDate(null)).toBe('—')
    expect(formatAdminDate('pas une date')).toBe('—')
  })
})

describe('lien WhatsApp de rappel', () => {
  it('ne garde que les chiffres du numéro et pré-remplit le message', () => {
    const lien = whatsappReplyLink('+228 90 11 22 33', 'Kodjo', 'TBS Events — location')
    expect(lien.startsWith('https://wa.me/22890112233?text=')).toBe(true)
    expect(decodeURIComponent(lien)).toContain('Bonjour Kodjo')
    expect(decodeURIComponent(lien)).toContain('TBS Events')
  })
})
