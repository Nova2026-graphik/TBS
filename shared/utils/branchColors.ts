/**
 * Couleurs de branche : du modèle de données à la feuille de style.
 *
 * Les quatre branches portent leur couleur dans les données (`siteData.ts`,
 * base de données, contenu serveur) sous forme hexadécimale : c'est ce que
 * lisent le semis, l'espace de suivi et les notifications par courriel, où
 * aucune feuille de style n'est chargée et où un `var()` ne voudrait rien
 * dire.
 *
 * Le site, lui, porte deux thèmes (`app/assets/css/main.css`). Une couleur
 * écrite en dur dans un attribut `style` échapperait au basculement : la
 * pastille de la branche Events resterait pêche sur une page devenue bleue.
 * Ces deux fonctions font la traduction au moment du rendu — même valeur,
 * exprimée comme un jeton de thème.
 *
 * `brandColor` donne la couleur d'aplat : pastille, filet, bordure.
 * `brandTextColor` donne la variante lisible de la même teinte, pour un usage
 * en couleur de texte. Deux des quatre couleurs de marque sont trop claires
 * pour cela — 2,15:1 et 2,33:1 sur blanc, là où WCAG 1.4.3 (AA) en exige
 * 4,5:1. Elles restent parfaites en pastille, où aucun seuil ne s'applique.
 *
 * Les deux fonctions renvoient un `var()` muni de sa valeur de repli : hors
 * du site — un aperçu isolé, un rendu de composant sans la feuille — la
 * couleur du thème principal s'applique quand même.
 */

/** Couleur de marque (thème principal) → jeton d'aplat. */
const FILL_VARS: Record<string, string> = {
  // Équipements — or
  '#827148': 'var(--color-gold, #827148)',
  // Events — pêche
  '#e8a07c': 'var(--color-peach, #e8a07c)',
  // Agro — olive
  '#a5af79': 'var(--color-olive, #a5af79)',
  // Études & Conseils — brun profond
  '#3e3524': 'var(--color-ink, #3e3524)',
}

/** Couleur de marque (thème principal) → jeton de texte conforme. */
const TEXT_VARS: Record<string, string> = {
  // Équipements — l'or est déjà à 4,77:1, il sert tel quel.
  '#827148': 'var(--color-gold, #827148)',
  // Events — pêche : 2,15:1 → 4,95:1
  '#e8a07c': 'var(--color-peach-text, #a85c33)',
  // Agro — olive : 2,33:1 → 5,82:1
  '#a5af79': 'var(--color-olive-text, #5f6a3a)',
  // Études — le brun profond est à 12,07:1, mais illisible comme accent sur
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
 * Jeton de texte d'une couleur de marque, conforme à WCAG 1.4.3 dans les deux
 * thèmes. Une couleur inconnue de la charte est renvoyée telle quelle.
 */
export function brandTextColor(color: string): string {
  return TEXT_VARS[color.toLowerCase()] ?? color
}
