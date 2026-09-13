/**
 * Redirection permanente des anciennes adresses de domaine.
 *
 * `/galerie?branche=equipements&domaine=mobilier-bureau` était l'adresse d'un
 * domaine avant qu'il n'ait sa page. Ces liens sont indexés et partagés : ils
 * doivent aboutir, et aboutir en **301**, sans quoi deux adresses décrivent le
 * même contenu et se disputent l'index.
 *
 * Pourquoi le hook `request`, et pas les deux endroits plus évidents — tous
 * deux essayés, tous deux mesurés :
 *
 *  - **middleware de route Vue** : `/galerie` est pré-rendu. Nitro sert un
 *    fichier HTML statique, qui ne fait pas tourner le routeur Vue. La
 *    redirection n'arrivait qu'après hydratation, côté client — donc jamais
 *    pour un robot d'indexation, et jamais en 301 ;
 *  - **middleware serveur** (`server/middleware/`) : le gestionnaire des
 *    fichiers publics est lui-même monté en middleware, et Nitro le place
 *    **avant** ceux du projet. La requête repartait avec son `ETag` et son
 *    `Last-Modified` sans avoir croisé le nôtre. Vérifié dans la sortie
 *    compilée : trois middleware, les fichiers publics en tête.
 *
 * Le hook `request` s'exécute dans `onRequest` de l'application h3, avant le
 * premier gestionnaire. C'est le seul point d'où la redirection part vraiment.
 *
 * `routeRules` ne convenait pas davantage : ses motifs portent sur le chemin,
 * et la distinction se joue ici sur la chaîne de requête.
 *
 * Trois précautions :
 *
 *  - **les deux** paramètres sont exigés. `?branche=` seul reste un filtre
 *    légitime de la galerie — il montre les réalisations d'une branche
 *    entière, ce qu'aucune page domaine ne fait ;
 *  - `?filtre=` et tout autre paramètre sont conservés et repassés ;
 *  - **le couple est vérifié** contre les données avant toute redirection. Un
 *    premier jet se contentait d'un slug plausible, et envoyait donc
 *    `?branche=nimportequoi&domaine=nimportequoi` vers un 404 — alors que
 *    cette adresse rendait jusqu'ici la galerie complète. Transformer en
 *    erreur une page qui marchait, pour un lien mal recopié, est une
 *    régression et non une rigueur. Les couples inconnus ou incohérents
 *    (`events` + `roulant`) restent donc à la galerie, qui les ignore déjà.
 */
import { domains } from '../data/content'
import { versUrl } from '../../shared/utils/branchSlugs'

/**
 * Les couples `branche/domaine` qui existent réellement, figés au démarrage.
 * Le contenu statique est la source du repli du site : le lire ici ne coûte
 * rien à l'exécution.
 *
 * La clé porte le **nom public** de la branche, pas son identifiant interne :
 * c'est ce que l'URL transmet. `events` arrive donc ici sous la forme
 * `evenementiel`, et l'ancienne forme est traduite en amont par
 * `branches-renommees.ts`.
 */
const COUPLES = new Set(domains.map(d => `${versUrl(d.branch)}/${d.slug}`))

/** `/galerie` et `/en/galerie`, avec ou sans barre finale. */
const GALERIE = /^\/(?:en\/)?galerie\/?$/

export default defineNitroPlugin((nitroApp) => {
  nitroApp.hooks.hook('request', async (event) => {
    const url = getRequestURL(event)
    if (!GALERIE.test(url.pathname)) return

    const branche = url.searchParams.get('branche')
    const domaine = url.searchParams.get('domaine')
    if (!branche || !domaine || !COUPLES.has(`${branche}/${domaine}`)) return

    url.searchParams.delete('branche')
    url.searchParams.delete('domaine')
    const reste = url.searchParams.toString()
    const prefixe = url.pathname.startsWith('/en/') ? '/en' : ''

    await sendRedirect(
      event,
      `${prefixe}/galerie/${branche}/${domaine}${reste ? `?${reste}` : ''}`,
      301,
    )
  })
})
