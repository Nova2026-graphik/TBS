import { ANCIENS_SLUGS } from '../../shared/utils/branchSlugs'

/**
 * Redirection permanente des adresses portant l'ancien nom d'une branche.
 *
 * « TBS Events » est devenue « TBS Événementiel », « TBS Agro » « TBS Agro
 * Business », et les adresses ont suivi. Les anciennes sont indexées et
 * partagées : elles doivent aboutir, et aboutir en **301**, sans quoi deux
 * adresses décrivent le même contenu et se disputent l'index.
 *
 * Deux formes à reprendre :
 *
 *  - le paramètre `?branche=events` sur `/galerie`, `/services` et `/contact` ;
 *  - le segment `/galerie/events/<domaine>`, qui date des pages domaine.
 *
 * Le hook `request` plutôt qu'un middleware, pour la raison établie dans
 * `domaines-herites.ts` : ces pages sont pré-rendues, et Nitro sert un
 * fichier statique avant d'atteindre le moindre middleware du projet.
 *
 * Ce module s'exécute **avant** `domaines-herites`, l'ordre des greffons
 * suivant l'ordre alphabétique des fichiers — `branches-` précède
 * `domaines-`. Une ancienne adresse complète comme
 * `/galerie?branche=events&domaine=location-reception` est donc d'abord
 * traduite en `?branche=evenementiel`, puis transformée en
 * `/galerie/evenementiel/location-reception` par le second. Deux sauts au
 * lieu d'un : c'est le prix d'un renommage qui croise une route déjà
 * réécrite, et les deux sauts sont des 301.
 */

/** `/galerie/<ancien>/<domaine>`, avec ou sans préfixe de langue. */
const SEGMENT = /^(\/(?:en\/)?galerie)\/([a-z0-9-]+)(\/[a-z0-9-]+)$/

/** Les pages qui acceptent `?branche=`. */
const AVEC_PARAMETRE = /^\/(?:en\/)?(?:galerie|services|contact)\/?$/

export default defineNitroPlugin((nitroApp) => {
  nitroApp.hooks.hook('request', async (event) => {
    const url = getRequestURL(event)

    // ── le segment de route ────────────────────────────────────────────────
    const segment = SEGMENT.exec(url.pathname)
    const nouveauSegment = segment && ANCIENS_SLUGS[segment[2]!]
    if (segment && nouveauSegment) {
      const reste = url.searchParams.toString()
      await sendRedirect(
        event,
        `${segment[1]}/${nouveauSegment}${segment[3]}${reste ? `?${reste}` : ''}`,
        301,
      )
      return
    }

    // ── le paramètre de requête ────────────────────────────────────────────
    if (!AVEC_PARAMETRE.test(url.pathname)) return

    const branche = url.searchParams.get('branche')
    const nouveau = branche && ANCIENS_SLUGS[branche]
    if (!nouveau) return

    url.searchParams.set('branche', nouveau)
    await sendRedirect(event, `${url.pathname}?${url.searchParams.toString()}`, 301)
  })
})
