/**
 * Connexion PostgreSQL paresseuse.
 *
 * Le site doit rester fonctionnel sans base : si `DATABASE_URL` est absent,
 * `useDb()` renvoie `null` et les routes API basculent sur le contenu
 * statique de `server/data/content.ts`.
 */
import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import * as schema from './schema'

export type Database = ReturnType<typeof drizzle<typeof schema>>

let _db: Database | null = null
let _sql: ReturnType<typeof postgres> | null = null
let _attempted = false

function resolveConnectionString(): string | undefined {
  // useRuntimeConfig() n'est pas disponible hors contexte Nitro (ex. scripts
  // de seed) : on retombe alors sur process.env.
  try {
    const config = useRuntimeConfig()
    if (config.databaseUrl) return config.databaseUrl
  } catch {
    /* hors contexte Nitro */
  }
  return process.env.DATABASE_URL || process.env.NUXT_DATABASE_URL
}

export function useDb(): Database | null {
  if (_db) return _db
  if (_attempted) return null
  _attempted = true

  const connectionString = resolveConnectionString()
  if (!connectionString) return null

  try {
    _sql = postgres(connectionString, {
      max: Number(process.env.DATABASE_POOL_MAX ?? 5),
      idle_timeout: 20,
      connect_timeout: 10,
      // Supabase / Neon exigent TLS ; `prepare: false` est requis derrière
      // le pooler transactionnel de Supabase (PgBouncer).
      ssl: connectionString.includes('localhost') ? false : 'require',
      prepare: false,
      onnotice: () => {},
    })
    _db = drizzle(_sql, { schema })
    return _db
  } catch (error) {
    console.error('[db] connexion impossible, repli sur le contenu statique :', error)
    return null
  }
}

/** Fermeture propre (scripts de seed, tests). */
export async function closeDb(): Promise<void> {
  if (_sql) {
    await _sql.end({ timeout: 5 })
    _sql = null
    _db = null
    _attempted = false
  }
}

export { schema }
