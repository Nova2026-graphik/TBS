/**
 * Identité légale de la société, pour les pages `/mentions-legales`,
 * `/conditions-de-location` et `/confidentialite`.
 *
 * `value: null` signale une donnée que **TBS doit encore fournir**. Les pages
 * affichent alors un marqueur « à compléter » visible plutôt qu'un blanc
 * silencieux : une mention incomplète se voit et se corrige, une mention
 * absente ne se découvre qu'au contrôle.
 *
 * Renseigner une valeur ici la propage partout — c'est le seul fichier à
 * modifier une fois les informations obtenues.
 */

export interface LegalField {
  label: string
  /** `null` tant que TBS n'a pas communiqué l'information. */
  value: string | null
  /** Précision affichée à la place de la valeur manquante. */
  hint?: string
}

/** Identification de l'éditeur — obligatoire sur les supports de communication. */
export const LEGAL_IDENTITY: LegalField[] = [
  { label: 'Raison sociale', value: 'TBS Distribution S.A.R.L' },
  {
    label: 'Forme juridique',
    value: 'Société à responsabilité limitée (S.A.R.L) de droit togolais',
  },
  { label: 'Siège social', value: 'Agôè - Démakpoè, Lomé — Togo' },
  {
    label: 'Capital social',
    value: null,
    hint: 'Montant en francs CFA figurant aux statuts',
  },
  {
    label: 'RCCM',
    value: null,
    hint: 'Numéro au registre du commerce et du crédit mobilier',
  },
  {
    label: 'NIF',
    value: null,
    hint: 'Numéro d\'identification fiscale',
  },
  {
    label: 'Gérant',
    value: null,
    hint: 'Nom et prénom du gérant, également directeur de la publication',
  },
]

/** Hébergeur du site — le choix n'est pas encore arrêté (Vercel, Netlify, Node). */
export const LEGAL_HOST: LegalField[] = [
  {
    label: 'Hébergeur',
    value: null,
    hint: 'Raison sociale du prestataire retenu',
  },
  {
    label: 'Adresse',
    value: null,
    hint: 'Siège de l\'hébergeur',
  },
  {
    label: 'Contact',
    value: null,
    hint: 'Téléphone ou adresse de contact technique',
  },
]

/**
 * Sous-traitants qui accèdent aux données du formulaire de devis. La liste se
 * fige à la mise en ligne, quand hébergeur, base et service d'envoi sont
 * choisis — cf. `.env.example`.
 */
export const LEGAL_PROCESSORS: LegalField[] = [
  { label: 'Hébergement du site', value: null, hint: 'Prestataire et pays d\'hébergement' },
  { label: 'Base de données', value: null, hint: 'Prestataire et pays d\'hébergement' },
  { label: 'Envoi des e-mails', value: null, hint: 'Prestataire retenu pour les notifications' },
]

/**
 * Variables commerciales des conditions de location. Ce ne sont pas des
 * données juridiques mais des décisions de gestion : elles appartiennent à
 * TBS, le site ne fait que les publier.
 */
export const RENTAL_TERMS: LegalField[] = [
  { label: 'Acompte à la réservation', value: null, hint: 'Pourcentage du montant du devis' },
  { label: 'Caution', value: null, hint: 'Montant ou pourcentage, et délai de restitution' },
  {
    label: 'Annulation sans frais',
    value: null,
    hint: 'Nombre de jours avant la date de mise à disposition',
  },
  { label: 'Annulation tardive', value: null, hint: 'Part de l\'acompte conservée' },
  {
    label: 'Casse et manquants',
    value: null,
    hint: 'Base de valorisation du matériel non restitué',
  },
  {
    label: 'Zone de livraison incluse',
    value: null,
    hint: 'Périmètre autour de Lomé, et tarif au-delà',
  },
]

/** Conservation des demandes de devis, avant anonymisation. */
export const QUOTE_RETENTION_MONTHS = 24

/**
 * Date de dernière révision des trois pages légales, au format ISO.
 * À remonter à chaque modification de leur contenu.
 */
export const LEGAL_UPDATED_AT = '2026-09-06'

/** « 2026-09-06 » → « 6 septembre 2026 ». */
export function formatLegalDate(iso: string): string {
  return new Intl.DateTimeFormat('fr-FR', {
    dateStyle: 'long',
    timeZone: 'Africa/Lome',
  }).format(new Date(`${iso}T12:00:00Z`))
}

/** Nombre d'informations encore attendues de TBS, tous blocs confondus. */
export function countPendingLegalFields(...groups: LegalField[][]): number {
  return groups.flat().filter(field => field.value === null).length
}
