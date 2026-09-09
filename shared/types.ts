/**
 * Types partagés entre le client (app/) et le serveur (server/).
 * Nuxt 4 auto-importe tout ce qui vit dans shared/ des deux côtés.
 */

/** Les quatre branches de TBS Distribution S.A.R.L. */
export type BranchSlug = 'equipements' | 'events' | 'etudes' | 'agro'

/** Catégories de filtrage de la galerie. */
export type GalleryCategory
  = | 'mariage'
    | 'ceremonie'
    | 'corporate'
    | 'decor'
    | 'fourniture'

export interface Branch {
  slug: BranchSlug
  /** Numéro d'ordre affiché ("Branche 01"). */
  index: number
  name: string
  tagline: string
  description: string
  /** Couleur d'accent CSS de la branche. */
  color: string
  image: string
  imageAlt: string
  tags: string[]
}

export interface RentalCategory {
  slug: string
  name: string
  /** Nombre de références en stock, affiché tel quel ("210 réf."). */
  refCount: number
  image: string
  imageAlt: string
}

/** Un bloc « prestation » alterné image / texte sur la page Services. */
export interface ServiceBlock {
  branch: BranchSlug
  eyebrow: string
  title: string
  description: string
  tags: string[]
  image: string
  imageAlt: string
}

export interface ProcessStep {
  step: string
  title: string
  description: string
}

export interface Offer {
  label: string
  title: string
  description: string
  note: string
  featured: boolean
}

export interface Inspiration {
  title: string
  description: string
  image: string
  imageAlt: string
}

export interface GalleryItem {
  id: string
  title: string
  location: string | null
  category: GalleryCategory
  branch: BranchSlug
  /**
   * Domaine précis, quand la réalisation en relève d'un seul.
   *
   * `null` est un état légitime, pas un oubli : une vue d'ensemble de salle
   * relève de TBS Events sans appartenir à « Organisation & coordination »
   * plutôt qu'à « Location de matériel ». Forcer un domaine sur chaque photo
   * produirait des rattachements arbitraires, et un filtre qui ment coûte
   * plus cher qu'un filtre absent.
   */
  domain: DomainSlug | null
  image: string
  imageAlt: string
}

export interface Testimonial {
  quote: string
  author: string
  context: string
}

export interface FaqItem {
  id: string
  group: string
  question: string
  answer: string
}

/**
 * Identifiant stable d'un domaine.
 *
 * Il ne bouge ni d'une langue à l'autre, ni quand l'intitulé est reformulé :
 * c'est lui qui porte `?domaine=` dans l'URL de la galerie et qui relie une
 * réalisation à son domaine. L'intitulé, lui, se traduit.
 */
export type DomainSlug
  // TBS Équipements — treize domaines, du mobilier au photovoltaïque.
  = | 'mobilier-bureau'
    | 'informatique'
    | 'sante-laboratoire'
    | 'roulant'
    | 'outillage'
    | 'controle-acces'
    | 'chimie-reactifs'
    | 'photovoltaique'
    | 'generateurs'
    | 'didactiques'
    | 'branchement'
    | 'electriques'
    | 'manutention'
    // TBS Events
    | 'location-reception'
    | 'organisation'
    // TBS Études & Conseils
    | 'etudes-prestations'
    // TBS Agro
    | 'agro-industrie'

export interface Domain {
  slug: DomainSlug
  branch: BranchSlug
  title: string
  description: string
}

/**
 * Une référence du catalogue, rattachée à un domaine.
 *
 * Le site annonçait ses domaines sans jamais dire ce qu'ils recouvrent :
 * « Matériel roulant » ne nommait aucun véhicule, « Outillage » aucun outil.
 * Un visiteur qui cherche un groupe électrogène ne pouvait pas savoir que TBS
 * en fournit.
 *
 * Ces entrées ne sont **pas** un catalogue marchand : ni prix, ni stock, ni
 * panier. Elles disent ce que TBS fournit, et renvoient au devis — c'est le
 * parcours que tout le site sert déjà.
 */
export interface Equipment {
  /** Rattachement au domaine, qui porte `?domaine=` dans l'URL. */
  domain: DomainSlug
  name: string
  /** Une phrase : ce que c'est, et pour qui. */
  description: string
  /**
   * Caractéristiques telles qu'elles servent à décider — puissance, capacité,
   * dimensions. Vide quand la référence n'en porte pas d'utile : une
   * caractéristique inventée vaut moins que pas de caractéristique.
   */
  specs: string[]
}

export interface StatItem {
  value: string
  /** Suffixe coloré ("+", "h") détaché de la valeur. */
  suffix?: string
  label: string
  hint?: string
}

/** Charge utile d'une demande de devis (validée par Zod côté serveur). */
export interface QuoteRequestPayload {
  name: string
  phone: string
  email?: string
  branch: string
  requestType: string
  eventDate?: string
  guestCount?: number
  location?: string
  message: string
  /** Champ piège anti-robot : doit rester vide. */
  company?: string
}

export interface ApiOk<T> {
  data: T
  /** 'database' quand la donnée vient de Postgres, 'static' en repli. */
  source: 'database' | 'static'
}
