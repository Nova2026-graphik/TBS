import type { BranchSlug } from '../types'

/**
 * Correspondance entre l'identifiant interne d'une branche et le segment
 * d'URL qui la nomme publiquement.
 *
 * Deux vocabulaires, et c'est délibéré. « TBS Events » est devenue « TBS
 * Événementiel » et « TBS Agro » « TBS Agro Business » ; les adresses suivent
 * — `?branche=evenementiel`, `/galerie/agro-business/…`. Mais l'identifiant
 * interne, lui, ne bouge pas.
 *
 * Pourquoi ne pas renommer aussi l'identifiant, ce qui supprimerait cette
 * table : `BranchSlug` n'est pas qu'un type TypeScript. C'est aussi un
 * **type énuméré PostgreSQL** (`branch_slug`), porté par quatre colonnes dont
 * `quote_requests.branch_slug` — les demandes de devis déjà reçues. Le
 * renommer demande une migration d'énumération, que `drizzle-kit` produit
 * volontiers en supprimant puis recréant le type, c'est-à-dire en perdant les
 * lignes. Changer un libellé ne vaut pas ce risque-là.
 *
 * La table est donc l'unique endroit où les deux vocabulaires se rencontrent.
 * Tout ce qui écrit une URL passe par `versUrl`, tout ce qui en lit une passe
 * par `depuisUrl` — et les anciennes adresses sont redirigées en 301 par
 * `server/plugins/branches-renommees.ts`.
 */
export const BRANCH_URL_SLUGS = {
  equipements: 'equipements',
  events: 'evenementiel',
  etudes: 'etudes',
  agro: 'agro-business',
} as const satisfies Record<BranchSlug, string>

export type BranchUrlSlug = (typeof BRANCH_URL_SLUGS)[BranchSlug]

/**
 * Anciens segments, gardés pour les rediriger.
 *
 * Ils ne sont **pas** acceptés par les pages : les faire fonctionner des deux
 * côtés donnerait deux adresses pour le même contenu, qui se disputeraient
 * l'index. Seule la redirection les connaît.
 */
export const ANCIENS_SLUGS: Record<string, BranchUrlSlug> = {
  events: 'evenementiel',
  agro: 'agro-business',
}

const DEPUIS_URL = Object.fromEntries(
  Object.entries(BRANCH_URL_SLUGS).map(([interne, url]) => [url, interne]),
) as Record<string, BranchSlug>

/** Identifiant interne → segment d'URL. */
export function versUrl(slug: BranchSlug): string {
  return BRANCH_URL_SLUGS[slug]
}

/**
 * Segment d'URL → identifiant interne, ou `null` si le segment ne nomme
 * aucune branche. Le `null` compte : une valeur inconnue doit ramener au
 * catalogue complet, jamais vider la page.
 */
export function depuisUrl(valeur: unknown): BranchSlug | null {
  const brut = Array.isArray(valeur) ? valeur[0] : valeur
  return typeof brut === 'string' ? (DEPUIS_URL[brut] ?? null) : null
}
