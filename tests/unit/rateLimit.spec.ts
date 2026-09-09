import { beforeEach, describe, expect, it, vi } from 'vitest'
import {
  isAdminRateLimited,
  isQuoteRateLimited,
  isRateLimitedInMemory,
  recordAdminFailure,
  resetRateLimitMemory,
  WINDOW_MS,
} from '../../server/utils/rateLimit'

type Database = Parameters<typeof isQuoteRateLimited>[0]

/** Base qui répond `hits` au décompte de la fenêtre. */
function baseAvec(hits: number): Database {
  const chain = {
    select: () => chain,
    from: () => chain,
    where: () => Promise.resolve([{ count: hits }]),
  }
  return chain as unknown as Database
}

beforeEach(() => {
  resetRateLimitMemory()
})

describe('fenêtre en mémoire', () => {
  it('laisse passer jusqu’à la limite, refuse au-delà', async () => {
    for (let i = 0; i < 10; i++) {
      expect(isRateLimitedInMemory('ip', 10).limited).toBe(false)
    }
    expect(isRateLimitedInMemory('ip', 10).limited).toBe(true)
  })

  it('compte séparément deux adresses', () => {
    for (let i = 0; i < 10; i++) isRateLimitedInMemory('ip-a', 10)

    expect(isRateLimitedInMemory('ip-a', 10).limited).toBe(true)
    expect(isRateLimitedInMemory('ip-b', 10).limited).toBe(false)
  })

  it('oublie les envois sortis de la fenêtre', () => {
    const debut = Date.now()
    for (let i = 0; i < 10; i++) isRateLimitedInMemory('ip', 10, debut)

    expect(isRateLimitedInMemory('ip', 10, debut).limited).toBe(true)
    expect(isRateLimitedInMemory('ip', 10, debut + WINDOW_MS + 1).limited).toBe(false)
  })
})

describe('décompte en base', () => {
  it('refuse dès que le quota est atteint', async () => {
    const decision = await isQuoteRateLimited(baseAvec(10), 'ip', 10)
    expect(decision).toMatchObject({ limited: true, scope: 'database', hits: 10 })
  })

  it('laisse passer sous le quota', async () => {
    const decision = await isQuoteRateLimited(baseAvec(9), 'ip', 10)
    expect(decision).toMatchObject({ limited: false, scope: 'database' })
  })

  it('retombe en mémoire quand la base est absente', async () => {
    const decision = await isQuoteRateLimited(null, 'ip', 10)
    expect(decision.scope).toBe('memory')
  })

  it('retombe en mémoire quand le décompte échoue, sans ouvrir le quota', async () => {
    const journal = vi.spyOn(console, 'error').mockImplementation(() => {})
    const enPanne = {
      select: () => {
        throw new Error('connexion perdue')
      },
    } as unknown as Database

    for (let i = 0; i < 10; i++) await isQuoteRateLimited(enPanne, 'ip', 10)
    const decision = await isQuoteRateLimited(enPanne, 'ip', 10)

    expect(decision).toMatchObject({ limited: true, scope: 'memory' })
    journal.mockRestore()
  })
})

/* ── Ouverture de session sur l'espace de suivi ────────────────────────────── */

/** Base qui accepte une insertion et compte `hits` tentatives. */
function baseAdmin(hits: number, insertions: string[] = []): Database {
  const chain = {
    select: () => chain,
    from: () => chain,
    where: () => Promise.resolve([{ count: hits }]),
    insert: () => ({
      values: (row: { ipHash: string }) => {
        insertions.push(row.ipHash)
        return Promise.resolve()
      },
    }),
  }
  return chain as unknown as Database
}

describe('limiteur de la page de connexion', () => {
  it('ne compte pas les connexions réussies', async () => {
    // Le cas qui verrouillait l'accès aux personnes autorisées : dix
    // ouvertures de session dans l'heure, toutes légitimes.
    for (let i = 0; i < 20; i++) {
      expect((await isAdminRateLimited(null, 'ip', 10)).limited).toBe(false)
    }
  })

  it('verrouille après dix échecs, et pas avant', async () => {
    for (let i = 0; i < 10; i++) {
      expect((await isAdminRateLimited(null, 'ip', 10)).limited).toBe(false)
      await recordAdminFailure(null, 'ip')
    }
    expect((await isAdminRateLimited(null, 'ip', 10)).limited).toBe(true)
  })

  it('sépare les adresses', async () => {
    for (let i = 0; i < 10; i++) await recordAdminFailure(null, 'ip-a')

    expect((await isAdminRateLimited(null, 'ip-a', 10)).limited).toBe(true)
    expect((await isAdminRateLimited(null, 'ip-b', 10)).limited).toBe(false)
  })

  it('oublie les échecs sortis de la fenêtre', async () => {
    const debut = Date.now()
    for (let i = 0; i < 10; i++) await recordAdminFailure(null, 'ip', new Date(debut))

    expect((await isAdminRateLimited(null, 'ip', 10, new Date(debut))).limited).toBe(true)
    expect((await isAdminRateLimited(null, 'ip', 10, new Date(debut + WINDOW_MS + 1))).limited)
      .toBe(false)
  })

  it('compte en base dès qu’une base répond', async () => {
    const resultat = await isAdminRateLimited(baseAdmin(10), 'ip', 10)

    expect(resultat.scope).toBe('database')
    expect(resultat.limited).toBe(true)
  })

  it('écrit l’échec en base', async () => {
    const insertions: string[] = []
    await recordAdminFailure(baseAdmin(0, insertions), 'empreinte')

    expect(insertions).toEqual(['empreinte'])
  })

  it('retombe en mémoire si la base tousse, sans ouvrir la porte', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {})
    const enPanne = {
      select: () => {
        throw new Error('connexion perdue')
      },
    } as unknown as Database

    for (let i = 0; i < 10; i++) await recordAdminFailure(null, 'ip')
    const resultat = await isAdminRateLimited(enPanne, 'ip', 10)

    expect(resultat.scope).toBe('memory')
    expect(resultat.limited).toBe(true)
  })

  it('ne lève jamais quand l’écriture échoue', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {})
    const enPanne = {
      insert: () => ({ values: () => Promise.reject(new Error('table absente')) }),
    } as unknown as Database

    // Le refus d'accès a déjà eu lieu : une écriture manquée ne doit pas
    // transformer un 401 en 500, ce qui renseignerait l'attaquant.
    await expect(recordAdminFailure(enPanne, 'ip')).resolves.toBeUndefined()
  })
})
