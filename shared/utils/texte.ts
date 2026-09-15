/**
 * Comparaison de textes sans accents ni casse.
 *
 * Deux usages : la recherche de la FAQ — « delai » doit trouver « délai » —
 * et le rapprochement d'un mot-clé de prestation avec une famille de
 * domaine, « Bureaux » avec « Bureaux & tables ». Dans les deux cas, l'accent
 * et la majuscule ne portent pas de sens ; on les enlève avant de comparer.
 */
export function sansAccents(texte: string): string {
  return texte
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .trim()
}

/** Vrai si `texte` contient `recherche`, accents et casse ignorés. */
export function contientTexte(texte: string, recherche: string): boolean {
  const r = sansAccents(recherche)
  return r.length > 0 && sansAccents(texte).includes(r)
}
