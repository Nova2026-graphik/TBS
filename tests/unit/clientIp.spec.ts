import type { H3Event } from 'h3'
import { describe, expect, it } from 'vitest'
import { getClientIp, parseTrustedProxy } from '../../server/utils/clientIp'

/**
 * `getClientIp` lit ses en-têtes par `getRequestHeader` et l'adresse de la
 * connexion par `getRequestIP`, deux auto-imports de Nitro. Un faux événement
 * suffit à les fournir : ce sont les seules dépendances de la fonction.
 */
function evenement(headers: Record<string, string>, socket = '203.0.113.10'): H3Event {
  const globals = globalThis as Record<string, unknown>
  globals.getRequestHeader = (_event: unknown, name: string) => headers[name.toLowerCase()]
  globals.getRequestIP = () => socket
  return {} as H3Event
}

describe('proxy déclaré', () => {
  it('retombe sur le mode prudent quand rien n’est déclaré', () => {
    expect(parseTrustedProxy(undefined)).toBe('direct')
    expect(parseTrustedProxy('')).toBe('direct')
  })

  it('accepte les plates-formes connues, quelle que soit la casse', () => {
    expect(parseTrustedProxy('cloudflare')).toBe('cloudflare')
    expect(parseTrustedProxy('  Vercel  ')).toBe('vercel')
    expect(parseTrustedProxy('X-Forwarded-For')).toBe('x-forwarded-for')
  })

  it('refuse une valeur inconnue plutôt que de la croire', () => {
    expect(parseTrustedProxy('mon-proxy-maison')).toBe('direct')
  })
})

describe('adresse du client', () => {
  it('ignore X-Forwarded-For en accès direct', () => {
    // Le cœur du correctif : sans proxy déclaré, l'en-tête ne vaut rien.
    const event = evenement({ 'x-forwarded-for': '9.9.9.9' }, '203.0.113.10')
    expect(getClientIp(event, { trustedProxy: 'direct' })).toBe('203.0.113.10')
  })

  it('ignore aussi un en-tête de plate-forme non déclarée', () => {
    const event = evenement({ 'cf-connecting-ip': '9.9.9.9' }, '203.0.113.10')
    expect(getClientIp(event, { trustedProxy: 'direct' })).toBe('203.0.113.10')
  })

  it('lit l’en-tête de la plate-forme déclarée', () => {
    const event = evenement({ 'cf-connecting-ip': '198.51.100.7' })
    expect(getClientIp(event, { trustedProxy: 'cloudflare' })).toBe('198.51.100.7')
  })

  it('retient la dernière entrée de X-Forwarded-For derrière un proxy', () => {
    // « client annoncé, adresse vue par notre proxy » : seule la seconde a été
    // écrite par quelqu'un de confiance.
    const event = evenement({ 'x-forwarded-for': '9.9.9.9, 198.51.100.7' })
    expect(getClientIp(event, { trustedProxy: 'x-forwarded-for' })).toBe('198.51.100.7')
  })

  it('remonte d’autant d’entrées qu’il y a de proxys de confiance', () => {
    const event = evenement({ 'x-forwarded-for': '9.9.9.9, 198.51.100.7, 10.0.0.1' })
    expect(getClientIp(event, { trustedProxy: 'x-forwarded-for', hops: 2 })).toBe('198.51.100.7')
  })

  it('ne sort jamais de la liste, même si les sauts sont surestimés', () => {
    const event = evenement({ 'x-forwarded-for': '198.51.100.7' })
    expect(getClientIp(event, { trustedProxy: 'x-forwarded-for', hops: 9 })).toBe('198.51.100.7')
  })

  it('retombe sur la connexion quand l’en-tête déclaré est absent', () => {
    const event = evenement({}, '203.0.113.10')
    expect(getClientIp(event, { trustedProxy: 'cloudflare' })).toBe('203.0.113.10')
  })

  it('normalise le port et les formes IPv6 d’une même adresse', () => {
    expect(getClientIp(evenement({}, '203.0.113.10:54321'), { trustedProxy: 'direct' }))
      .toBe('203.0.113.10')
    expect(getClientIp(evenement({}, '::ffff:203.0.113.10'), { trustedProxy: 'direct' }))
      .toBe('203.0.113.10')
    expect(getClientIp(evenement({}, '[2001:db8::1]:443'), { trustedProxy: 'direct' }))
      .toBe('2001:db8::1')
  })

  it('renvoie null plutôt qu’une clé fourre-tout quand rien n’est connu', () => {
    // Un `'unknown'` rangerait tous les anonymes dans le même seau de quota.
    const globals = globalThis as Record<string, unknown>
    globals.getRequestHeader = () => undefined
    globals.getRequestIP = () => undefined
    expect(getClientIp({} as H3Event, { trustedProxy: 'direct' })).toBeNull()
  })
})
