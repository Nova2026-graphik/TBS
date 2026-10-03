/**
 * Garde du déclencheur de tâches planifiées.
 *
 * `nitro.scheduledTasks` suppose un **processus qui dure**. Le préréglage Node
 * en a un ; Vercel n'en a pas : chaque requête réveille une fonction qui meurt
 * ensuite, et personne n'est là à 3 h du matin pour regarder l'heure. La tâche
 * `quotes:anonymise` ne partirait donc jamais en production.
 *
 * Ce n'est pas une gêne, c'est une fausse déclaration : la politique de
 * confidentialité promet une anonymisation « automatique », déclenchée « chaque
 * nuit », sans intervention manuelle. Sans planificateur, le site garderait
 * indéfiniment des noms et des numéros de téléphone en annonçant les effacer au
 * bout de deux ans.
 *
 * D'où cette route, appelée par le cron de la plate-forme (`vercel.json`).
 * Vercel joint l'en-tête `Authorization: Bearer $CRON_SECRET` à ses appels :
 * c'est ce secret que l'on vérifie, sans quoi n'importe qui pourrait déclencher
 * la purge à volonté.
 *
 * **Sans `CRON_SECRET`, la route n'existe pas** — 404, comme l'espace de suivi
 * sans mot de passe. Un déploiement qui oublie la variable n'ouvre pas une
 * porte, il laisse la tâche non programmée ; c'est signalé au journal.
 */
import { safeEqual } from './adminSession'

/** `true` si le déclencheur est configuré. */
export function isCronEnabled(secret: string | undefined): secret is string {
  return typeof secret === 'string' && secret.length > 0
}

/**
 * Vérifie l'en-tête `Authorization` d'un appel de cron.
 *
 * Le schéma `Bearer` est reconnu sans tenir compte de la casse — la RFC 7235
 * le veut insensible — mais le secret, lui, est comparé à temps constant :
 * une comparaison naïve laisse deviner le préfixe correct, caractère par
 * caractère.
 */
export function isAuthorizedCron(header: string | undefined, secret: string): boolean {
  if (!header) return false

  const trouve = /^Bearer[ \t]+(.+)$/i.exec(header.trim())
  if (!trouve) return false

  return safeEqual(trouve[1]!, secret)
}
