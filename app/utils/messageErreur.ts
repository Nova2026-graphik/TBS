/**
 * Message lisible d'une erreur renvoyée par une route `/api`.
 *
 * Le serveur place ses explications dans `message`, pas dans `statusMessage` :
 * ce dernier finit dans la ligne de statut HTTP, qui n'accepte pas les
 * caractères accentués — h3 l'avertit à chaque erreur et finira par les
 * retirer. Un « Session expirée » y deviendrait « Session expire ».
 *
 * Nitro remplit `message` de « Server Error » pour une erreur imprévue : ce
 * libellé anglais et vide de sens n'est jamais montré, l'appelant garde alors
 * son propre texte.
 */
export function messageErreurServeur(erreur: unknown): string | undefined {
  const message = (erreur as { data?: { message?: unknown } } | null)?.data?.message
  if (typeof message !== 'string') return undefined

  const propre = message.trim()
  return propre && propre !== 'Server Error' ? propre : undefined
}
