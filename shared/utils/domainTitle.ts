/**
 * Découpe le titre d'un domaine en deux lignes pour la bannière.
 *
 * La maquette pose le titre sur deux lignes, la seconde en italique. Le
 * découpage est calculé plutôt que saisi dans les données : dix-sept titres
 * coupés à la main, c'est dix-sept occasions d'oublier la coupe en ajoutant
 * un domaine — et la règle est simple à énoncer.
 *
 * Deux cas :
 *  - le titre contient « & » : la coupe suit l'esperluette, qui reste avec la
 *    première ligne. « Mobilier & matériel de bureau » donne « Mobilier & » /
 *    « matériel de bureau », soit la lecture naturelle du titre ;
 *  - sinon, la coupe tombe entre les mots, au plus près du milieu **en
 *    nombre de caractères** et non en nombre de mots : « Matériel roulant »
 *    se coupe en deux lignes égales là où un partage par mots donnerait la
 *    même chose, mais « Systèmes photovoltaïques autonomes » non.
 *
 * Un titre d'un seul mot n'est pas coupé : la seconde ligne reste vide, et la
 * bannière n'affiche alors qu'une ligne.
 */
export function splitDomainTitle(title: string): [string, string] {
  const propre = title.trim().replace(/\s+/g, ' ')
  const mots = propre.split(' ')
  if (mots.length < 2) return [propre, '']

  // L'esperluette commande, quand elle n'est ni en tête ni en queue.
  const esperluette = mots.indexOf('&')
  if (esperluette > 0 && esperluette < mots.length - 1) {
    return [mots.slice(0, esperluette + 1).join(' '), mots.slice(esperluette + 1).join(' ')]
  }

  // Sinon, la coupe qui équilibre le mieux les deux lignes.
  let coupe = 1
  let ecart = Number.POSITIVE_INFINITY
  for (let i = 1; i < mots.length; i += 1) {
    const gauche = mots.slice(0, i).join(' ').length
    const droite = mots.slice(i).join(' ').length
    const distance = Math.abs(gauche - droite)
    if (distance < ecart) {
      ecart = distance
      coupe = i
    }
  }
  return [mots.slice(0, coupe).join(' '), mots.slice(coupe).join(' ')]
}
