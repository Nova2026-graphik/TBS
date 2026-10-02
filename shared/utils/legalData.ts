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
 *
 * **Ce qui est une clé et ce qui est une valeur.** Les pages existent en
 * français et en anglais : tout ce qui est du texte — intitulés, précisions,
 * valeurs rédigées — est une clé de traduction (`legal.fields.*`). Ce qui est
 * une donnée — une raison sociale, un nom d'hébergeur, un montant, un numéro
 * de registre — s'écrit tel quel : « Vercel Inc. » ne se traduit pas.
 */

export interface LegalField {
  /** Clé i18n de l'intitulé. */
  label: string
  /**
   * Donnée brute, identique dans les deux langues : raison sociale, nom
   * d'hébergeur, montant, numéro. `null` tant que TBS ne l'a pas communiquée.
   */
  value: string | null
  /**
   * Clé i18n, quand la « valeur » est en réalité une phrase — « Société à
   * responsabilité limitée de droit togolais » se traduit, pas « Vercel Inc. ».
   * Prioritaire sur `value`.
   */
  valueKey?: string
  /** Clé i18n de la précision affichée à la place de la valeur manquante. */
  hint?: string
}

/** Identification de l'éditeur — obligatoire sur les supports de communication. */
export const LEGAL_IDENTITY: LegalField[] = [
  { label: 'legal.fields.companyName', value: 'TBS Distribution S.A.R.L' },
  {
    label: 'legal.fields.legalForm',
    value: null,
    valueKey: 'legal.fields.legalFormValue',
  },
  { label: 'legal.fields.headOffice', value: 'Agôè - Démakpoè, Lomé — Togo' },
  {
    label: 'legal.fields.capital',
    value: null,
    hint: 'legal.fields.capitalHint',
  },
  {
    label: 'legal.fields.rccm',
    value: null,
    hint: 'legal.fields.rccmHint',
  },
  {
    label: 'legal.fields.nif',
    value: null,
    hint: 'legal.fields.nifHint',
  },
  {
    label: 'legal.fields.manager',
    value: null,
    hint: 'legal.fields.managerHint',
  },
]

/** Hébergeur du site. */
export const LEGAL_HOST: LegalField[] = [
  {
    /**
     * Établi, pas supposé : `www.tbstogo.com` est servi par le projet Vercel
     * `tbs-distribution`, qui porte le domaine et d'où part chaque
     * déploiement de `main`.
     */
    label: 'legal.fields.host',
    value: 'Vercel Inc.',
  },
  {
    /**
     * Non renseignée faute d'avoir pu la vérifier : l'adresse d'un hébergeur
     * est une mention légale, et la recopier de mémoire serait exactement le
     * genre d'erreur que cette page a pour objet d'éviter. À relever sur les
     * mentions légales de Vercel.
     */
    label: 'legal.fields.hostAddress',
    value: null,
    hint: 'legal.fields.hostAddressHint',
  },
  {
    label: 'legal.fields.hostContact',
    value: null,
    hint: 'legal.fields.hostContactHint',
  },
]

/**
 * Sous-traitants qui accèdent aux données du formulaire de devis. La liste se
 * fige à la mise en ligne, quand hébergeur, base et service d'envoi sont
 * choisis — cf. `.env.example`.
 */
export const LEGAL_PROCESSORS: LegalField[] = [
  { label: 'legal.fields.hosting', value: 'Vercel Inc.' },
  /**
   * Relevé le 2 octobre 2026 : le projet Vercel qui sert `www.tbstogo.com` ne
   * porte **aucune variable d'environnement**. Ni `DATABASE_URL`, ni clé
   * d'envoi : aucune base ne reçoit les demandes, aucun prestataire de
   * messagerie n'en est destinataire. Annoncer un sous-traitant qui n'existe
   * pas serait aussi faux que d'en taire un.
   *
   * **À reprendre le jour où l'un ou l'autre est mis en service** — c'est à ce
   * moment-là que ces deux lignes deviennent fausses.
   */
  { label: 'legal.fields.database', value: null, valueKey: 'legal.fields.databaseValue' },
  { label: 'legal.fields.mailing', value: null, valueKey: 'legal.fields.mailingValue' },
]

/**
 * Variables commerciales des conditions de location. Ce ne sont pas des
 * données juridiques mais des décisions de gestion : elles appartiennent à
 * TBS, le site ne fait que les publier.
 */
export const RENTAL_TERMS: LegalField[] = [
  { label: 'legal.fields.deposit', value: null, hint: 'legal.fields.depositHint' },
  { label: 'legal.fields.security', value: null, hint: 'legal.fields.securityHint' },
  {
    label: 'legal.fields.freeCancellation',
    value: null,
    hint: 'legal.fields.freeCancellationHint',
  },
  { label: 'legal.fields.lateCancellation', value: null, hint: 'legal.fields.lateCancellationHint' },
  {
    label: 'legal.fields.breakage',
    value: null,
    hint: 'legal.fields.breakageHint',
  },
  {
    label: 'legal.fields.deliveryZone',
    value: null,
    hint: 'legal.fields.deliveryZoneHint',
  },
]

/** Conservation des demandes de devis, avant anonymisation. */
export const QUOTE_RETENTION_MONTHS = 24

/**
 * Date de dernière révision des trois pages légales, au format ISO.
 * À remonter à chaque modification de leur contenu.
 */
export const LEGAL_UPDATED_AT = '2026-09-06'

/**
 * « 2026-09-06 » → « 6 septembre 2026 », ou « 6 September 2026 » selon la
 * langue affichée. Une date écrite en toutes lettres dans une langue au
 * milieu d'une page rédigée dans l'autre se remarque immédiatement.
 */
export function formatLegalDate(iso: string, locale = 'fr-FR'): string {
  return new Intl.DateTimeFormat(locale, {
    dateStyle: 'long',
    timeZone: 'Africa/Lome',
  }).format(new Date(`${iso}T12:00:00Z`))
}

/**
 * Nombre d'informations encore attendues de TBS, tous blocs confondus.
 *
 * Une valeur rédigée (`valueKey`) compte comme renseignée : elle est bien
 * présente sur la page, elle est seulement traduite plutôt qu'écrite en dur.
 */
export function countPendingLegalFields(...groups: LegalField[][]): number {
  return groups.flat().filter(field => field.value === null && field.valueKey === undefined).length
}
