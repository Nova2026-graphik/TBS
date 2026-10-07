/**
 * Déclencheur de l'anonymisation des demandes de devis expirées.
 *
 * Appelé par le cron de la plate-forme — `vercel.json`, chaque nuit à 3 h —
 * parce qu'un hébergement serverless n'a pas de processus pour tenir le
 * planificateur de Nitro. Cf. `server/utils/cronAuth.ts` pour le pourquoi.
 *
 * En **GET** : c'est le seul verbe que les tâches planifiées de Vercel savent
 * envoyer. La route modifie pourtant des données, ce qu'un GET ne devrait pas
 * faire ; elle est donc fermée par un secret, et `/api/` est déjà hors
 * indexation.
 */
import { isAuthorizedCron, isCronEnabled } from '../../utils/cronAuth'

interface ResultatAnonymisation {
  skipped?: string
  count?: number
  cutoff?: string
  tentatives?: number
  error?: string
}

export default defineEventHandler(async (event) => {
  const secret = process.env.CRON_SECRET

  // Pas de secret, pas de route : annoncer une 401 révélerait qu'il existe
  // ici une porte dont la clé est ailleurs.
  if (!isCronEnabled(secret)) {
    throw createError({ statusCode: 404, message: 'Page introuvable' })
  }

  if (!isAuthorizedCron(getHeader(event, 'authorization'), secret)) {
    throw createError({ statusCode: 401, message: 'Non autorisé' })
  }

  const { result } = await runTask<ResultatAnonymisation>('quotes:anonymise')

  // La tâche avale ses propres erreurs pour ne pas faire tomber le serveur ;
  // le cron, lui, doit les voir, sans quoi une purge en panne passe pour un
  // succès dans le tableau de bord de la plate-forme.
  if (result?.error) {
    throw createError({ statusCode: 500, message: 'Anonymisation impossible' })
  }

  return result
})
