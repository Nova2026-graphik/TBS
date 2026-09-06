import { beforeEach, describe, expect, it, vi } from 'vitest'

/**
 * Repli statique de la couche d'accès au contenu.
 *
 * C'est la promesse du README — « le site ne tombe jamais en panne à cause de
 * la base, il se dégrade en site statique ». Elle ne se vérifie qu'en
 * simulant les trois états possibles de la connexion : absente, en erreur, et
 * disponible mais vide.
 */
const useDb = vi.fn()
vi.mock('../../server/database/client', () => ({ useDb }))

const { getBranches, getFaqItems, getRentalCategories } = await import(
  '../../server/utils/repository'
)
const content = await import('../../server/data/content')

beforeEach(() => {
  useDb.mockReset()
})

/** Base joignable dont la requête échoue au premier maillon. */
function baseEnPanne() {
  return {
    select: () => {
      throw new Error('connexion perdue')
    },
  }
}

/** Base joignable qui répond `rows` à toute la chaîne select/from/where/orderBy. */
function baseAvec(rows: unknown[]) {
  const chain = {
    select: () => chain,
    from: () => chain,
    where: () => chain,
    orderBy: () => Promise.resolve(rows),
  }
  return chain
}

describe('repli statique', () => {
  it('sert le contenu statique quand aucune base n’est configurée', async () => {
    useDb.mockReturnValue(null)

    const { data, source } = await getBranches()
    expect(source).toBe('static')
    expect(data).toEqual(content.branches)
    expect(data.length).toBeGreaterThan(0)
  })

  it('sert le contenu statique quand la requête échoue', async () => {
    // Le repli journalise l'erreur : attendu ici, et sans intérêt à l'écran.
    const journal = vi.spyOn(console, 'error').mockImplementation(() => {})
    useDb.mockReturnValue(baseEnPanne())

    const { data, source } = await getRentalCategories()
    expect(source).toBe('static')
    expect(data).toEqual(content.rentalCategories)
    expect(journal).toHaveBeenCalledOnce()
    journal.mockRestore()
  })

  it('sert le contenu statique quand la table est vide', async () => {
    // Une base fraîchement migrée mais pas encore alimentée ne doit pas
    // vider le site : sans cette garde, la page s'afficherait sans contenu.
    useDb.mockReturnValue(baseAvec([]))

    const { data, source } = await getFaqItems()
    expect(source).toBe('static')
    expect(data).toEqual(content.faqItems)
  })

  it('sert la base quand elle répond', async () => {
    useDb.mockReturnValue(baseAvec([
      {
        slug: 'events',
        position: 2,
        name: 'TBS Events',
        tagline: 'Location de matériel de réception',
        description: 'Mobilier, nappage, art de la table.',
        color: '#e8a07c',
        image: '/images/branche-events.jpg',
        imageAlt: 'Salle dressée',
        tags: ['Mobilier'],
        isPublished: true,
      },
    ]))

    const { data, source } = await getBranches()
    expect(source).toBe('database')
    expect(data).toHaveLength(1)
    expect(data[0]).toMatchObject({ slug: 'events', name: 'TBS Events', index: 2 })
  })

  it('remplace les étiquettes absentes par une liste vide', async () => {
    // `tags` est `NOT NULL` en base, mais le repli protège d'une ligne
    // insérée à la main sans passer par le schéma.
    useDb.mockReturnValue(baseAvec([
      {
        slug: 'agro',
        position: 4,
        name: 'TBS Agro',
        tagline: 'Agriculture et agro-industrie',
        description: 'Cultures et transformation.',
        color: '#a5af79',
        image: '/images/branche-agro.jpg',
        imageAlt: 'Champ',
        tags: null,
        isPublished: true,
      },
    ]))

    const { data } = await getBranches()
    expect(data[0]?.tags).toEqual([])
  })
})
