import { describe, expect, it } from 'vitest'
import { preparerUrlConnexion } from '../../server/database/connectionString'

/**
 * La chaîne que Neon propose par défaut porte `channel_binding=require`.
 * `postgres-js` relaie ce paramètre au serveur, qui refuse la connexion :
 * collée telle quelle, elle donnait un site qui n'enregistre rien.
 */
const NEON = 'postgresql://neondb_owner:mdp@ep-calme-123-pooler.eu-central-1.aws.neon.tech/neondb'

describe('preparerUrlConnexion', () => {
  it('retire channel_binding et garde sslmode', () => {
    const url = new URL(preparerUrlConnexion(`${NEON}?sslmode=require&channel_binding=require`))
    expect(url.searchParams.has('channel_binding')).toBe(false)
    expect(url.searchParams.get('sslmode')).toBe('require')
  })

  it('retire channel_binding quand il est seul', () => {
    expect(preparerUrlConnexion(`${NEON}?channel_binding=require`)).not.toContain('channel_binding')
  })

  it('garde l’hôte, la base et les identifiants', () => {
    const url = new URL(preparerUrlConnexion(`${NEON}?sslmode=require&channel_binding=require`))
    expect(url.hostname).toBe('ep-calme-123-pooler.eu-central-1.aws.neon.tech')
    expect(url.pathname).toBe('/neondb')
    expect(url.username).toBe('neondb_owner')
    expect(url.password).toBe('mdp')
  })

  /**
   * Une URL sans paramètre à retirer doit ressortir **à l'octet près** :
   * `URL` réencode certains caractères d'un mot de passe, et une connexion
   * qui marchait ne doit pas se mettre à échouer.
   */
  it.each([
    `${NEON}?sslmode=require`,
    'postgresql://postgres.ref:p%40ss%2Fw0rd@aws-0-eu-central-1.pooler.supabase.com:6543/postgres',
    'postgresql://postgres:postgres@localhost:5432/tbs',
  ])('rend %s inchangée', (url) => {
    expect(preparerUrlConnexion(url)).toBe(url)
  })

  it('laisse passer ce qui n’est pas une URL', () => {
    expect(preparerUrlConnexion('host=localhost dbname=tbs')).toBe('host=localhost dbname=tbs')
  })
})
