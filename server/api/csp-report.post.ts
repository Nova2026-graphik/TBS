/**
 * POST /api/csp-report — point de collecte des violations de la politique.
 *
 * Le navigateur y poste tout seul, sans que rien du site ne l'appelle. Trois
 * précautions en découlent :
 *
 *  - **rien n'est cru.** L'adresse est publique et accepte n'importe quel
 *    corps ; ce qui n'est pas un rapport est ignoré en silence ;
 *  - **on n'inonde pas.** Une page cassée produit la même violation à chaque
 *    visite ; la fenêtre de `errorReporter` n'en retient qu'une par quart
 *    d'heure et par signature ;
 *  - **rien de personnel ne sort.** Les URL sont réduites à leur chemin, la
 *    chaîne de requête retirée.
 *
 * La réponse est un 204 dans tous les cas : le navigateur n'attend rien, et
 * distinguer les corps valides des autres renseignerait qui sonde l'adresse.
 */
import { parseCspReport, formatViolation, violationSignature } from '../utils/cspReport'
import { shouldAlert } from '../utils/errorReporter'

/** Au-delà, ce n'est plus un rapport de violation. */
const MAX_BODY_BYTES = 16_384

/** JSON permissif : un corps illisible n'est pas une erreur, c'est du bruit. */
function lireJson(source: string): unknown {
  try {
    return JSON.parse(source)
  }
  catch {
    return null
  }
}

export default defineEventHandler(async (event) => {
  const brut = await readRawBody(event, 'utf8').catch(() => null)

  if (brut && brut.length <= MAX_BODY_BYTES) {
    for (const violation of parseCspReport(lireJson(brut))) {
      if (shouldAlert(violationSignature(violation))) {
        console.warn(formatViolation(violation))
      }
    }
  }

  setResponseStatus(event, 204)
  return null
})
