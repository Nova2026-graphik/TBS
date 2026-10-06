import { expect, test } from '@playwright/test'
import { INDEXNOW_KEY } from '../../scripts/indexnow.mjs'

/**
 * Ce que voient les moteurs, sur la sortie de production.
 *
 * Aucun de ces défauts ne se remarque en naviguant : un `noindex` oublié, une
 * canonique vers un autre domaine ou un fichier de clé absent laissent le site
 * parfaitement utilisable — et invisible dans les résultats.
 */
test.describe('référencement', () => {
  test('l’accueil se laisse indexer et se déclare canonique', async ({ page }) => {
    await page.goto('/')
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', /^index, follow/)
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', /^https:\/\/www\.tbstogo\.com\/$/)
  })

  test('les données structurées nomment le site et l’entreprise', async ({ page }) => {
    await page.goto('/')
    const blocs = await page.locator('script[type="application/ld+json"]').allTextContents()
    const schemas = blocs.map(texte => JSON.parse(texte) as Record<string, unknown>)

    const site = schemas.find(s => s['@type'] === 'WebSite')
    expect(site?.name).toBe('TBS Distribution')
    expect(site?.alternateName).toContain('TBS Togo')

    const entreprise = schemas.find(s => s['@type'] === 'LocalBusiness')
    expect(entreprise?.alternateName).toContain('TBS Togo')
    expect((site?.publisher as { '@id': string })['@id']).toBe(entreprise?.['@id'])
  })

  test('robots.txt autorise l’exploration et donne le sitemap', async ({ request }) => {
    const texte = await (await request.get('/robots.txt')).text()
    expect(texte).toMatch(/^Sitemap: https:\/\/www\.tbstogo\.com\/sitemap_index\.xml$/m)
    expect(texte).not.toMatch(/^Disallow: \/$/m)
  })

  test('la clé IndexNow est publiée telle quelle', async ({ request }) => {
    const reponse = await request.get(`/${INDEXNOW_KEY}.txt`)
    expect(reponse.status()).toBe(200)
    expect(await reponse.text()).toBe(INDEXNOW_KEY)
  })
})
