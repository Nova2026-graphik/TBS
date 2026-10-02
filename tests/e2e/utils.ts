import type { Page } from '@playwright/test'

/**
 * Attend que la page réponde aux gestes.
 *
 * Le balisage vient du pré-rendu : les éléments existent avant que Vue n'ait
 * repris la main. Un clic envoyé dans cet intervalle ne déclenche rien — le
 * gestionnaire n'est pas encore attaché — et le test échoue sur une absence
 * qu'aucune trace n'explique.
 *
 * Cette attente était dupliquée dans trois fichiers de parcours et absente
 * des quatre autres. Les trois tests qui ont échoué par intermittence le
 * 8 septembre 2026 étaient précisément ceux qui interagissaient sans elle :
 * ils passaient quand la machine était rapide, échouaient sous charge.
 *
 * À appeler après chaque `page.goto()` suivi d'un geste.
 */
export async function pageInteractive(page: Page) {
  await page.waitForLoadState('networkidle')
}
