/**
 * Violations de la politique de contenu.
 *
 * La CSP est servie en `Report-Only` : le navigateur signale, il ne bloque
 * pas. Encore faut-il que le signalement arrive quelque part — sans point de
 * collecte, les violations partent dans la console du visiteur et personne
 * ne les voit jamais. C'était le cas jusqu'ici, ce qui rendait le mode
 * `report-only` strictement décoratif.
 *
 * Deux formats coexistent, et il faut les accepter tous les deux :
 *
 *  - `report-uri`, ancien mais universellement supporté, qui poste un objet
 *    `{ "csp-report": { … } }` en `application/csp-report` ;
 *  - la *Reporting API* moderne, qui poste un tableau de rapports en
 *    `application/reports+json`.
 *
 * Ce module ne fait que normaliser : il ne lit ni n'écrit rien d'autre, ce qui
 * le rend vérifiable sans démarrer de serveur.
 */

/** Ce qu'on retient d'une violation — le reste du rapport est ignoré. */
export interface CspViolation {
  /** Directive effectivement enfreinte, p. ex. `script-src`. */
  directive: string
  /** Ressource refusée, réduite à son origine ou à son mot-clé. */
  blocked: string
  /** Page concernée, sans chaîne de requête. */
  document: string
}

/**
 * Réduit une URL à ce qui sert au diagnostic.
 *
 * La chaîne de requête peut porter ce qu'un visiteur a saisi — un filtre de
 * galerie, un terme de recherche. Elle n'apprend rien sur la violation et
 * n'a rien à faire dans un journal. Même règle que `errorReporter.ts`.
 */
export function trimUrl(value: unknown): string {
  if (typeof value !== 'string' || !value) return 'inconnu'

  // Les mots-clés (`inline`, `eval`, `data`) ne sont pas des URL.
  if (!value.includes('://')) return value.split('?')[0] ?? value

  try {
    const url = new URL(value)
    return `${url.origin}${url.pathname}`
  }
  catch {
    return value.split('?')[0] ?? value
  }
}

/** Lit un rapport `report-uri`, ou `null` s'il n'en est pas un. */
function fromReportUri(payload: unknown): CspViolation | null {
  if (!payload || typeof payload !== 'object') return null
  const report = (payload as Record<string, unknown>)['csp-report']
  if (!report || typeof report !== 'object') return null

  const champs = report as Record<string, unknown>
  const directive = champs['effective-directive'] ?? champs['violated-directive']

  return {
    directive: typeof directive === 'string' ? directive : 'inconnue',
    blocked: trimUrl(champs['blocked-uri']),
    document: trimUrl(champs['document-uri']),
  }
}

/** Lit un lot de la *Reporting API*. */
function fromReportingApi(payload: unknown): CspViolation[] {
  if (!Array.isArray(payload)) return []

  return payload.flatMap((entree) => {
    if (!entree || typeof entree !== 'object') return []
    const { type, body } = entree as Record<string, unknown>
    if (type !== 'csp-violation' || !body || typeof body !== 'object') return []

    const champs = body as Record<string, unknown>
    return [{
      directive: typeof champs.effectiveDirective === 'string' ? champs.effectiveDirective : 'inconnue',
      blocked: trimUrl(champs.blockedURL),
      document: trimUrl(champs.documentURL),
    }]
  })
}

/**
 * Normalise un corps de requête, quel que soit son format.
 *
 * Renvoie un tableau vide sur tout ce qui n'est pas un rapport : l'adresse est
 * publique, et n'importe qui peut y poster n'importe quoi.
 */
export function parseCspReport(payload: unknown): CspViolation[] {
  const unique = fromReportUri(payload)
  if (unique) return [unique]
  return fromReportingApi(payload)
}

/** Regroupe les occurrences d'une même violation, pour ne pas inonder. */
export function violationSignature({ directive, blocked }: CspViolation): string {
  return `csp:${directive}:${blocked}`
}

/** Ligne de journal — compacte, lisible d'un coup d'œil. */
export function formatViolation({ directive, blocked, document }: CspViolation): string {
  return `[csp] ${directive} a refusé ${blocked} sur ${document}`
}
