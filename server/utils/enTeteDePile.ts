/**
 * Placer un gestionnaire **en tête** de la pile h3 de Nitro.
 *
 * Les redirections des anciennes adresses (`branches-renommees.ts`,
 * `domaines-herites.ts`) doivent passer avant le gestionnaire des fichiers
 * publics : `/galerie` est pré-rendu, et servi tel quel sinon. Elles
 * partaient jusqu'ici du hook `request` — qui passe bien avant, mais qui ne
 * peut pas arrêter la suite. h3 enchaînait donc sur le hook des en-têtes de
 * sécurité, puis sur la règle d'en-têtes `'/**'` de `nuxt.config.ts`, qui
 * écrivaient tous deux sur une réponse déjà partie : `ERR_HTTP_HEADERS_SENT`,
 * deux erreurs 500 journalisées à chaque redirection — et signalées par
 * courriel —, pour une réponse 301 pourtant correcte… mais privée de ses
 * en-têtes de sécurité, HSTS compris.
 *
 * Un gestionnaire de la pile, lui, arrête tout : h3 vérifie `event.handled`
 * après chacun et rend la main dès qu'une réponse est partie. En tête de
 * pile, il passe avant la règle d'en-têtes et avant les fichiers publics, et
 * après les hooks `request` — la réponse 301 reçoit donc les en-têtes de
 * sécurité comme les autres.
 *
 * Nitro exécute les plugins une fois sa pile montée : l'ajout tient.
 */
import type { EventHandler } from 'h3'
import type { NitroApp } from 'nitropack/types'

export function placerEnTeteDePile(nitroApp: NitroApp, handler: EventHandler): void {
  nitroApp.h3App.stack.unshift({ route: '', handler })
}
