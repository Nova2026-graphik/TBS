import type { BranchSlug, Domain, DomainSlug, Equipment } from '../types'

/**
 * Compteurs affichés sur le site, tous calculés.
 *
 * Le site annonçait « 113 références », « 13 domaines », « Réception 5 » en
 * chiffres écrits dans les gabarits. Chaque ajout au catalogue, chaque
 * article publié, chaque question posée demandait de retrouver et corriger
 * un nombre quelque part — et l'oubli ne se voyait pas, puisque rien ne
 * cassait. Ce module est le seul endroit où l'on compte ; les gabarits
 * affichent ce qu'il rend.
 *
 * Fonctions pures sur des tableaux : elles se testent sans Nuxt, et servent
 * autant au rendu qu'aux tests de bout en bout qui vérifient les nombres
 * affichés contre les données.
 */

/** Nombre de références d'un domaine. */
export function referencesDuDomaine(equipment: readonly Equipment[], domaine: DomainSlug): number {
  return equipment.filter(e => e.domain === domaine).length
}

/** Nombre de références d'une branche, tous domaines confondus. */
export function referencesDeLaBranche(
  equipment: readonly Equipment[],
  domains: readonly Domain[],
  branche: BranchSlug,
): number {
  const slugs = new Set(domains.filter(d => d.branch === branche).map(d => d.slug))
  return equipment.filter(e => slugs.has(e.domain)).length
}

/** Domaines d'une branche, dans l'ordre du site. */
export function domainesDeLaBranche(domains: readonly Domain[], branche: BranchSlug): Domain[] {
  return domains.filter(d => d.branch === branche)
}

/**
 * Effectif par valeur d'une clé — articles par thème, questions par branche.
 *
 * Renvoie un objet et non une `Map` : il est destiné à un gabarit, où
 * `compte[theme] ?? 0` se lit mieux qu'un `get`. Une clé absente vaut zéro à
 * la lecture, ce qui est le compte juste d'une branche sans question.
 */
export function effectifsPar<T, K extends string>(
  items: readonly T[],
  cle: (item: T) => K | null | undefined,
): Record<K, number> {
  const compte = {} as Record<K, number>
  for (const item of items) {
    const k = cle(item)
    if (k == null) continue
    compte[k] = (compte[k] ?? 0) + 1
  }
  return compte
}
