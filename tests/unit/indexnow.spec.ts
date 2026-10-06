import { existsSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import {
  cheminsDepuisFichiers,
  construireSoumission,
  INDEXNOW_KEY,
} from '../../scripts/indexnow.mjs'

/**
 * Les moteurs vérifient la clé en allant lire `/<clé>.txt`. Si le fichier
 * publié et la constante du script divergent, chaque annonce est refusée
 * — sans que rien ne casse visiblement côté site.
 */
describe('clé IndexNow', () => {
  const fichier = join(import.meta.dirname, '../../public', `${INDEXNOW_KEY}.txt`)

  it('a son fichier publié à la racine du site', () => {
    expect(existsSync(fichier)).toBe(true)
  })

  it('le fichier contient exactement la clé, sans fin de ligne', () => {
    expect(readFileSync(fichier, 'utf8')).toBe(INDEXNOW_KEY)
  })

  it('respecte le format du protocole', () => {
    expect(INDEXNOW_KEY).toMatch(/^[a-zA-Z0-9-]{8,128}$/)
  })
})

describe('cheminsDepuisFichiers', () => {
  it('transforme les pages précalculées en chemins publics', () => {
    expect(cheminsDepuisFichiers([
      'index.html',
      'a-propos/index.html',
      'en/conseils/louer-ou-acheter-son-materiel/index.html',
    ])).toEqual(['/', '/a-propos', '/en/conseils/louer-ou-acheter-son-materiel'])
  })

  it('ne garde que les pages, pas les ressources', () => {
    expect(cheminsDepuisFichiers(['_nuxt/entry.js', 'images/logo.png', 'robots.txt', '200.html']))
      .toEqual([])
  })

  /** `/sitemap.xml` est précalculé, mais ce n'est qu'une redirection. */
  it('écarte la redirection du sitemap, l’administration et l’API', () => {
    expect(cheminsDepuisFichiers([
      'sitemap.xml/index.html',
      'admin/index.html',
      'en/admin/index.html',
      'api/health/index.html',
      'contact/index.html',
    ])).toEqual(['/contact'])
  })

  it('ne compte pas deux fois la même page', () => {
    expect(cheminsDepuisFichiers(['faq/index.html', 'faq/index.html'])).toEqual(['/faq'])
  })
})

describe('construireSoumission', () => {
  it('produit le corps attendu par le protocole', () => {
    expect(construireSoumission(['/', '/contact'], 'https://www.tbstogo.com', 'cle')).toEqual({
      host: 'www.tbstogo.com',
      key: 'cle',
      keyLocation: 'https://www.tbstogo.com/cle.txt',
      urlList: ['https://www.tbstogo.com/', 'https://www.tbstogo.com/contact'],
    })
  })

  /** Le protocole refuse un envoi dont une adresse n'est pas sur `host`. */
  it('garde toutes les adresses sur l’hôte déclaré, même avec une barre finale', () => {
    const { host, urlList } = construireSoumission(['/a', '/b'], 'https://www.tbstogo.com/')
    for (const url of urlList) expect(new URL(url).host).toBe(host)
    expect(urlList[0]).toBe('https://www.tbstogo.com/a')
  })
})
