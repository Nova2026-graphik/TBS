/**
 * Couleurs de branche : du modèle de données à la feuille de style.
 *
 * Les quatre branches portent leur couleur dans les données (`siteData.ts`,
 * base de données, contenu serveur) sous forme hexadécimale : c'est ce que
 * lisent le semis, l'espace de suivi et les notifications par courriel, où
 * aucune feuille de style n'est chargée et où un `var()` ne voudrait rien
 * dire.
 *
 * Ces valeurs hexadécimales sont celles de l'ancienne charte « Sable & Or »,
 * retirée en novembre 2026 : elles restent dans les données parce que la base
 * en production les contient, mais ne sont plus que des identifiants. Le site
 * ne les affiche jamais telles quelles : ces deux fonctions les traduisent au
 * moment du rendu en jetons de la charte (`app/assets/css/main.css`), qui
 * portent les couleurs du logo — bleu, rouge, bleu clair, marine.
 *
 * `brandColor` donne la couleur d'aplat : pastille, filet, bordure.
 * `brandTextColor` donne la variante lisible de la même teinte, pour un usage
 * en couleur de texte. Deux des quatre couleurs de marque sont trop claires
 * pour cela — 2,15:1 et 2,33:1 sur blanc, là où WCAG 1.4.3 (AA) en exige
 * 4,5:1. Elles restent parfaites en pastille, où aucun seuil ne s'applique.
 *
 * Les deux fonctions renvoient un `var()` muni d'une valeur de repli, qui ne
 * sert qu'hors du site — un aperçu isolé, un rendu de composant sans la
 * feuille. C'est la valeur d'origine de la donnée, ce que vérifie
 * `tests/unit/branchColors.spec.ts`.
 */

/** Couleur de marque (identifiant de donnée) → jeton d'aplat. */
const FILL_VARS: Record<string, string> = {
  // Équipements — bleu du logo
  '#827148': 'var(--color-gold, #827148)',
  // Events — rouge du logo
  '#e8a07c': 'var(--color-peach, #e8a07c)',
  // Agro — bleu clair
  '#a5af79': 'var(--color-olive, #a5af79)',
  // Études & Conseils — marine
  '#3e3524': 'var(--color-ink, #3e3524)',
}

/** Couleur de marque (identifiant de donnée) → jeton de texte conforme. */
const TEXT_VARS: Record<string, string> = {
  // Équipements — le bleu du logo est déjà à 4,73:1, il sert tel quel.
  '#827148': 'var(--color-gold, #827148)',
  // Events — le rouge du logo plafonne à 4,61:1 : 5,57:1 en texte.
  '#e8a07c': 'var(--color-peach-text, #a85c33)',
  // Agro — bleu clair : 2,25:1 → 5,58:1 en texte.
  '#a5af79': 'var(--color-olive-text, #5f6a3a)',
  // Études — la marine est à 13,43:1, mais illisible comme accent sur
  // fond sombre ; la charte lui substitue l'accent principal.
  '#3e3524': 'var(--color-gold, #827148)',
}

/**
 * Jeton d'aplat d'une couleur de marque — pastille, filet, bordure.
 * Une couleur inconnue de la charte est renvoyée telle quelle.
 */
export function brandColor(color: string): string {
  return FILL_VARS[color.toLowerCase()] ?? color
}

/**
 * Jeton de texte d'une couleur de marque, conforme à WCAG 1.4.3. Une couleur inconnue de la charte est renvoyée telle quelle.
 */
export function brandTextColor(color: string): string {
  return TEXT_VARS[color.toLowerCase()] ?? color
}
