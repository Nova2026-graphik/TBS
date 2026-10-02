/**
 * `HEAD` sur une route d'API : traité comme le `GET` correspondant.
 *
 * Le routeur de h3 associe un gestionnaire à une méthode et une seule —
 * `matched.handlers[method] || matched.handlers.all` — sans repli de `HEAD`
 * vers `GET`. Or le dépôt déclare ses routes en `*.get.ts` : une requête
 * `HEAD` ne trouvait donc aucun gestionnaire et tombait en 404, sur les cinq
 * routes de lecture.
 *
 * Le cas qui coûte est `/api/health`, dont c'est toute la raison d'être d'être
 * interrogée par une sonde de supervision — et la plupart (UptimeRobot, Better
 * Stack, Pingdom) envoient un `HEAD` par défaut. Le site aurait été signalé en
 * panne permanente tout en répondant parfaitement.
 *
 * La RFC 9110 §9.3.2 est explicite : `HEAD` est identique à `GET`, à ceci près
 * que la réponse ne porte pas de corps. On remet donc la méthode à `GET` avant
 * le routage, et le gestionnaire s'exécute normalement — en-têtes compris, ce
 * que la sonde vient justement vérifier.
 *
 * **Le corps, lui, ne part pas** : Node fixe `ServerResponse._hasBody` à faux
 * à la construction de la réponse, d'après la méthode réellement reçue sur le
 * socket. Cette valeur est déjà posée quand ce middleware s'exécute, et rien
 * ici ne la touche. Écrire la méthode après coup ne la rouvre pas.
 *
 * Portée limitée à `/api/` : le reste du site est pré-rendu et servi par le
 * gestionnaire de fichiers statiques, qui sait déjà répondre à `HEAD`.
 */
import type { H3Event } from 'h3'

/**
 * `event.method` est mis en cache dans un champ privé à la première lecture.
 * Réécrire `req.method` sans l'invalider laisserait un `HEAD` figé pour tout
 * ce qui lit la méthode ensuite — le routeur compris.
 */
interface EventAvecMethodeEnCache extends H3Event {
  _method?: H3Event['method']
}

export default defineEventHandler((event) => {
  if (event.method !== 'HEAD') return
  if (!event.path.startsWith('/api/')) return

  event.node.req.method = 'GET'
  ;(event as EventAvecMethodeEnCache)._method = 'GET'
})
