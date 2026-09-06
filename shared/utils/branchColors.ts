/**
 * Couleurs de branche : décoratif d'un côté, texte de l'autre.
 *
 * `BRANCH_COLORS` porte les teintes de la charte. Deux d'entre elles — la
 * pêche des Events et l'olive de l'Agro — sont trop claires pour du texte :
 * 2,15:1 et 2,33:1 sur blanc, là où WCAG 1.4.3 (AA) en exige 4,5:1. Elles
 * restent parfaites en pastille, en filet ou en bordure, où aucun seuil ne
 * s'applique.
 *
 * `brandTextColor` donne la variante lisible d'une couleur de marque. Même
 * teinte, luminance abaissée : l'identité visuelle ne bouge pas.
 */

/** Couleur de marque → couleur de texte conforme. */
const TEXT_VARIANTS: Record<string, string> = {
  // Events — pêche : 2,15:1 → 4,95:1
  '#e8a07c': '#a85c33',
  // Agro — olive : 2,33:1 → 5,82:1
  '#a5af79': '#5f6a3a',
  // Études — brun profond : 12,07:1, mais illisible comme accent sur fond
  // sombre ; la charte lui substitue l'or, à 4,77:1.
  '#3e3524': '#827148',
}

/**
 * Variante lisible d'une couleur de marque, pour un usage en couleur de texte.
 * Une couleur déjà conforme — l'or des Équipements — est renvoyée telle quelle.
 */
export function brandTextColor(color: string): string {
  return TEXT_VARIANTS[color.toLowerCase()] ?? color
}
