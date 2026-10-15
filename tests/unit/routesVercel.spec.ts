import { describe, expect, it } from 'vitest'
import { ANCIENS_SLUGS } from '../../shared/utils/branchSlugs'
import { ROUTES_ANCIENNES_ADRESSES } from '../../server/utils/routesVercel'

/**
 * Rejoue l'aiguillage de Vercel sur ces routes : le chemin contre `src`,
 * puis chaque condition `has` contre la chaîne de requête. Une route qui
 * correspond envoie la requête à la fonction, au lieu du fichier pré-rendu.
 */
function versLaFonction(adresse: string): boolean {
  const url = new URL(adresse, 'https://www.tbstogo.com')
  return ROUTES_ANCIENNES_ADRESSES.some(route =>
    new RegExp(route.src).test(url.pathname)
      && route.has.every((condition) => {
        const valeur = url.searchParams.get(condition.key)
        if (valeur === null) return false
        return condition.value === undefined || new RegExp(condition.value).test(valeur)
      }),
  )
}

/**
 * Sur Vercel, le CDN sert les pages pré-rendues sans regarder la chaîne de
 * requête : sans ces routes, `/services?branche=events` ouvrait l'onglet
 * Équipements au lieu d'être redirigé. Mais chaque requête qu'elles
 * détournent coûte une fonction au lieu d'un fichier : elles doivent viser
 * les anciennes adresses, et rien d'autre.
 */
describe('routes Vercel des anciennes adresses', () => {
  it('confient au serveur les anciens noms de branche', () => {
    for (const adresse of [
      '/services?branche=events',
      '/services/?branche=agro',
      '/en/services?branche=events',
      '/contact?branche=events&message=Bonjour',
      '/galerie?branche=agro',
    ]) {
      expect(versLaFonction(adresse), adresse).toBe(true)
    }
  })

  it('confient au serveur les anciennes adresses de domaine', () => {
    for (const adresse of [
      '/galerie?branche=equipements&domaine=mobilier-bureau',
      '/en/galerie?branche=agro-business&domaine=agro-industrie&famille=x',
    ]) {
      expect(versLaFonction(adresse), adresse).toBe(true)
    }
  })

  it('laissent au CDN toutes les adresses actuelles', () => {
    for (const adresse of [
      '/',
      '/services',
      '/services?branche=evenementiel',
      '/services?branche=agro-business',
      '/contact?branche=evenementiel',
      '/galerie',
      '/galerie?branche=equipements',
      '/galerie?filtre=decor',
      '/galerie/evenementiel/organisation',
      // Un ancien nom ailleurs que sur ces trois pages n'est pas une
      // ancienne adresse : il n'a jamais été servi.
      '/a-propos?branche=events',
      // Le nom doit être exact, pas seulement contenu.
      '/services?branche=eventsx',
    ]) {
      expect(versLaFonction(adresse), adresse).toBe(false)
    }
  })

  it('couvrent exactement les anciens noms connus', () => {
    for (const ancien of Object.keys(ANCIENS_SLUGS)) {
      expect(versLaFonction(`/services?branche=${ancien}`), ancien).toBe(true)
    }
  })
})
