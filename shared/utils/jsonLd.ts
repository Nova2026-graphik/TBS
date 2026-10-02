/**
 * Sérialisation des données structurées JSON-LD.
 *
 * Le JSON-LD voyage dans le corps d'un `<script type="application/ld+json">`,
 * et `JSON.stringify` **n'échappe pas `<`**. Une chaîne contenant `</script>`
 * ferme donc la balise, et ce qui suit est interprété par le navigateur comme
 * du balisage — pas comme des données.
 *
 * Ce n'est pas théorique sur ce site : le JSON-LD `FAQPage` est alimenté par
 * la table `faq_items`, et l'édition du contenu sans redéploiement est une
 * fonctionnalité annoncée. Une réponse de FAQ saisie depuis le back-office
 * deviendrait sinon une injection persistante dans toutes les pages qui la
 * portent.
 *
 * `<` est l'échappement JSON de `<` : il est strictement équivalent pour
 * tout analyseur JSON, les robots d'indexation compris, et ne peut plus
 * fermer la balise. `&` est laissé tel quel — il n'a aucun sens dans le corps
 * d'un `<script>`, que le navigateur ne traite pas comme du HTML.
 */
export function serialiserJsonLd(donnees: unknown): string {
  return JSON.stringify(donnees).replaceAll('<', '\\u003c')
}
