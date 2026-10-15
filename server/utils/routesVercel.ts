/**
 * Anciennes adresses : les faire passer par le serveur sur Vercel.
 *
 * `branches-renommees.ts` et `domaines-herites.ts` redirigent en 301 les
 * adresses d'avant le renommage (`?branche=events`) et d'avant les pages
 * domaine (`/galerie?branche=…&domaine=…`). Elles fonctionnent sur le serveur
 * Node, où toute requête traverse Nitro — c'est là que tournent les parcours
 * de bout en bout.
 *
 * Sur Vercel, non. La configuration produite par Nitro place
 * `{ "handle": "filesystem" }` **avant** les fonctions, et le CDN choisit le
 * fichier sans regarder la chaîne de requête : `/services?branche=events`
 * recevait `services/index.html`, tel quel. La page, qui ne connaît que les
 * noms publics, ne reconnaissait pas `events` et ouvrait l'onglet
 * Équipements ; le formulaire de contact ne présélectionnait rien ; l'ancienne
 * adresse d'un domaine montrait la galerie entière. Constaté le 15 octobre
 * 2026 dans `.vercel/output/config.json`.
 *
 * Ces routes sont fusionnées **en tête** de la configuration (Nitro les
 * combine avec `defu`, qui place les tableaux fournis devant), donc avant le
 * CDN. Elles ne redirigent rien elles-mêmes : elles confient la requête à la
 * fonction, qui garde l'adresse d'origine et applique les redirections déjà
 * écrites et testées. Une seule logique de redirection, deux hébergements.
 *
 * Le coût est nul pour les adresses actuelles : seules les combinaisons
 * ci-dessous quittent le CDN.
 */
import { ANCIENS_SLUGS } from '../../shared/utils/branchSlugs'

/** Une route de la Build Output API de Vercel, réduite à ce qui sert ici. */
export interface RouteVercel {
  src: string
  has: { type: 'query', key: string, value?: string }[]
  dest: string
}

/** La fonction qui porte tout le serveur Nitro sur Vercel. */
const FONCTION = '/__fallback'

/** `events|agro` — les anciens noms, et eux seuls. */
const ANCIENS = Object.keys(ANCIENS_SLUGS).join('|')

export const ROUTES_ANCIENNES_ADRESSES: RouteVercel[] = [
  // `?branche=events` sur les trois pages qui acceptent le paramètre.
  {
    src: '^/(?:en/)?(?:galerie|services|contact)/?$',
    has: [{ type: 'query', key: 'branche', value: `^(?:${ANCIENS})$` }],
    dest: FONCTION,
  },
  // `/galerie?branche=…&domaine=…` : le serveur vérifie le couple, et rend
  // la galerie s'il ne désigne aucun domaine réel.
  {
    src: '^/(?:en/)?galerie/?$',
    has: [
      { type: 'query', key: 'branche' },
      { type: 'query', key: 'domaine' },
    ],
    dest: FONCTION,
  },
]
