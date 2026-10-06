/**
 * Préparation de l'URL de connexion avant de la confier au pilote.
 *
 * `postgres-js` reconnaît une poignée de paramètres d'URL (`sslmode`,
 * `connect_timeout`…) et transmet **tous les autres au serveur** comme
 * paramètres de démarrage. Un paramètre propre à `libpq` — que le serveur ne
 * connaît pas — fait donc échouer la connexion entière :
 *
 *   unrecognized configuration parameter "channel_binding"
 *
 * Or c'est exactement ce que contient la chaîne que Neon propose par défaut
 * (`…?sslmode=require&channel_binding=require`). Collée telle quelle dans
 * `DATABASE_URL`, elle donnait un site qui démarre, sert ses pages, et
 * n'enregistre aucune demande de devis — `/api/health` le dirait, encore
 * faudrait-il aller le lire.
 *
 * On retire ces paramètres ici plutôt que d'exiger une URL retouchée à la
 * main : la panne serait silencieuse, et la retouche s'oublie au premier
 * changement de mot de passe. `postgres-js` n'implémente de toute façon pas
 * la liaison de canal ; le paramètre n'a jamais rien protégé, il ne faisait
 * qu'empêcher la connexion.
 */

/** Paramètres de `libpq` que `postgres-js` relaierait au serveur, qui les refuse. */
const PARAMETRES_LIBPQ = ['channel_binding'] as const

export function preparerUrlConnexion(connectionString: string): string {
  let url: URL
  try {
    url = new URL(connectionString)
  }
  catch {
    // Pas une URL — un DSN « clé=valeur », par exemple. On la laisse au
    // pilote, qui donnera un message plus juste que le nôtre.
    return connectionString
  }

  let modifiee = false
  for (const nom of PARAMETRES_LIBPQ) {
    if (url.searchParams.has(nom)) {
      url.searchParams.delete(nom)
      modifiee = true
    }
  }

  // Sans retouche, on rend la chaîne d'origine à l'octet près : `URL` peut
  // réencoder un mot de passe, et une connexion qui marchait doit continuer
  // à marcher.
  return modifiee ? url.toString() : connectionString
}
