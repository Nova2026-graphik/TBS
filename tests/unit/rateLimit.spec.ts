import { beforeEach, describe, expect, it, vi } from 'vitest'
import {
  isQuoteRateLimited,
  isRateLimitedInMemory,
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
