/**
 * Vocabulaire de l'espace de suivi.
 *
 * Les valeurs reprennent l'énumération `quote_status` de la base — elles sont
 * dupliquées ici parce que `shared/` ne peut pas importer le schéma serveur,
 * et le test `adminQuotes.spec.ts` verrouille leur correspondance.
 */
export const QUOTE_STATUSES = [
  'nouveau',
  'en_cours',
  'devis_envoye',
  'gagne',
  'perdu',
  'spam',
] as const

export type QuoteStatus = (typeof QUOTE_STATUSES)[number]

/** Intitulés affichés, et couleur d'accent de la pastille. */
export const QUOTE_STATUS_LABELS: { value: QuoteStatus, label: string, tone: string }[] = [
  { value: 'nouveau', label: 'Nouveau', tone: '#827148' },
  { value: 'en_cours', label: 'En cours', tone: '#A85C33' },
  { value: 'devis_envoye', label: 'Devis envoyé', tone: '#5F6A3A' },
  { value: 'gagne', label: 'Gagné', tone: '#1F7A3D' },
  { value: 'perdu', label: 'Perdu', tone: '#8B8069' },
  { value: 'spam', label: 'Spam', tone: '#8A2B12' },
]

export function quoteStatusLabel(status: QuoteStatus): string {
  return QUOTE_STATUS_LABELS.find(s => s.value === status)?.label ?? status
}

export function quoteStatusTone(status: QuoteStatus): string {
  return QUOTE_STATUS_LABELS.find(s => s.value === status)?.tone ?? '#8B8069'
}

/** « TBS Events — location de matériel » → « TBS Events ». */
export function shortBranchLabel(branch: string): string {
  return (branch.split('—')[0] ?? branch).trim()
}

const adminDateFormat = new Intl.DateTimeFormat('fr-FR', {
  dateStyle: 'short',
  timeStyle: 'short',
  timeZone: 'Africa/Lome',
})

/** Date courte, heure du Togo — c'est là que travaille l'équipe. */
export function formatAdminDate(value: string | Date | null): string {
  if (!value) return '—'
  const date = value instanceof Date ? value : new Date(value)
  return Number.isNaN(date.getTime()) ? '—' : adminDateFormat.format(date)
}

/** Lien WhatsApp pré-rempli, pour rappeler sans retaper le contexte. */
export function whatsappReplyLink(phone: string, name: string, branch: string): string {
  const number = phone.replace(/[^\d]/g, '')
  const text = `Bonjour ${name}, TBS Distribution à propos de votre demande ${shortBranchLabel(branch)}.`
  return `https://wa.me/${number}?text=${encodeURIComponent(text)}`
}
