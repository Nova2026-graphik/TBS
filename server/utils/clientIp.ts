/**
 * Adresse du client — sans croire sur parole ce que le client raconte.
 *
 * `X-Forwarded-For` est un en-tête de requête : n'importe qui peut l'écrire.
 * Derrière un proxy de confiance, celui-ci y ajoute l'adresse qu'il a vue et
 * l'en-tête devient exploitable ; en accès direct, il ne vaut rien — un robot
 * en change à chaque requête et traverse n'importe quelle limitation de débit.
 *
 * Le même piège vaut pour les en-têtes de plate-forme (`cf-connecting-ip`,
 * `x-vercel-forwarded-for`…) : ils ne sont dignes de foi que si la plate-forme
 * correspondante est bien devant nous, puisqu'elle les réécrit. Servi
 * directement en Node, ce sont de simples en-têtes falsifiables.
 *
 * D'où une configuration explicite plutôt qu'une heuristique : `trustedProxy`
 * nomme ce qui se trouve devant l'application. Par défaut — `direct` — rien
 * n'est lu et seule l'adresse de la connexion TCP fait foi. Elle est peut-être
 * celle d'un proxy, mais elle, au moins, n'est pas déclarative.
 */
import type { H3Event } from 'h3'

/** Ce qui se trouve devant l'application, et donc ce qui est digne de foi. */
export type TrustedProxy = 'direct' | 'cloudflare' | 'vercel' | 'netlify' | 'x-forwarded-for'

/**
 * En-tête réécrit par chaque plate-forme. Une valeur envoyée par le client est
 * écrasée avant d'arriver jusqu'ici — à condition, donc, d'être derrière elle.
 */
const PLATFORM_HEADER: Partial<Record<TrustedProxy, string>> = {
  cloudflare: 'cf-connecting-ip',
  vercel: 'x-vercel-forwarded-for',
  netlify: 'x-nf-client-connection-ip',
}

const TRUSTED_PROXIES: readonly TrustedProxy[] = [
  'direct',
  'cloudflare',
  'vercel',
  'netlify',
  'x-forwarded-for',
]

/** Normalise `trustedProxy` ; une valeur inconnue retombe sur le mode prudent. */
export function parseTrustedProxy(value: unknown): TrustedProxy {
  const candidate = String(value ?? '').trim().toLowerCase()
  if (!candidate) return 'direct'
  if ((TRUSTED_PROXIES as readonly string[]).includes(candidate)) return candidate as TrustedProxy
  console.warn(`[ip] trustedProxy inconnu : « ${candidate} ». Repli sur « direct ».`)
  return 'direct'
}

/**
 * Retire le port d'une adresse IPv4 (`1.2.3.4:5678`) et les crochets d'une
 * IPv6 (`[::1]:5678`), pour que deux écritures de la même adresse ne comptent
 * pas pour deux clients distincts.
 */
function normalise(raw: string): string {
  const value = raw.trim()
  if (!value) return ''

  const bracketed = /^\[(.+)\](?::\d+)?$/.exec(value)
  if (bracketed) return bracketed[1]!.toLowerCase()

  // IPv4 avec port : un seul « : » et des chiffres derrière.
  const withPort = /^(\d{1,3}(?:\.\d{1,3}){3}):\d+$/.exec(value)
  if (withPort) return withPort[1]!

  // IPv4 mappée en IPv6 (« ::ffff:1.2.3.4 ») : on garde la forme v4.
  const mapped = /^::ffff:(\d{1,3}(?:\.\d{1,3}){3})$/i.exec(value)
  if (mapped) return mapped[1]!

  return value.toLowerCase()
}

/**
 * Adresse retenue dans `X-Forwarded-For`.
 *
 * La liste se lit de gauche (le client d'origine, tel qu'annoncé) à droite
 * (ajouté par le proxy le plus proche de nous). Seule la fin est vérifiée :
 * chaque proxy de confiance y a inscrit l'adresse qu'il a réellement vue. Avec
 * `hops` proxys devant nous, l'adresse du client est donc la `hops`-ième en
 * partant de la droite. Tout ce qui la précède vient du client et se falsifie.
 */
function fromForwardedFor(header: string, hops: number): string {
  const entries = header.split(',').map(normalise).filter(Boolean)
  if (!entries.length) return ''
  const index = entries.length - Math.max(1, hops)
  return entries[Math.max(0, index)] ?? ''
}

export interface ClientIpOptions {
  /** Ce qui se trouve devant l'application. */
  trustedProxy: TrustedProxy
  /** Nombre de proxys de confiance, pour le seul mode `x-forwarded-for`. */
  hops?: number
}

/**
 * Adresse du client, ou `null` si rien de fiable n'est disponible.
 *
 * `null` est un cas réel — socket sans adresse en environnement sans serveur —
 * et l'appelant doit décider quoi en faire, plutôt que de recevoir un
 * `'unknown'` qui range tous les anonymes dans le même seau de quota.
 */
export function getClientIp(event: H3Event, options: ClientIpOptions): string | null {
  const { trustedProxy, hops = 1 } = options

  if (trustedProxy === 'x-forwarded-for') {
    const header = getRequestHeader(event, 'x-forwarded-for')
    const address = header ? fromForwardedFor(header, hops) : ''
    if (address) return address
  } else {
    const headerName = PLATFORM_HEADER[trustedProxy]
    if (headerName) {
      const header = getRequestHeader(event, headerName)
      // Vercel renvoie une liste, les autres une adresse seule.
      const address = header ? fromForwardedFor(header, 1) : ''
      if (address) return address
    }
  }

  // Adresse de la connexion elle-même : `xForwardedFor` reste explicitement à
  // false, c'est tout le sujet de ce module.
  const socket = getRequestIP(event, { xForwardedFor: false })
  return socket ? normalise(socket) : null
}
