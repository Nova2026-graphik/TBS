/**
 * Liens vers des pages qui n'existent pas dans toutes les langues.
 *
 * Les trois pages légales sont volontairement francophones —
 * `defineI18nRoute({ locales: ['fr'] })` : elles engagent la société au regard
 * du droit togolais, et une traduction non relue par un juriste vaudrait moins
 * que le texte d'origine. Pour celles-là, `localePath()` et
 * `switchLocalePath()` rendent une **chaîne vide** dans l'autre langue, et
 * `NuxtLink` fabrique alors une balise `<a>` **sans `href`** : un lien qui a
 * l'air d'un lien, se survole comme un lien, et ne mène nulle part.
 *
 * Le site en portait plusieurs à la fois : les trois entrées légales du pied
 * de page anglais, l'entrée « Advice » du menu — la rubrique Conseils était
 * alors francophone elle aussi, elle est depuis traduite — et le sélecteur de
 * langue dès qu'on se trouvait sur une page francophone, d'où l'impossibilité
 * de repasser à l'anglais depuis un article.
 *
 * Plutôt que de masquer ces entrées, on renvoie vers la version française en
 * annonçant la langue. Un lien qui change de langue et le dit vaut mieux qu'un
 * lien absent, et bien mieux qu'un lien mort.
 */

export interface LienLocalise {
  /** Destination, toujours renseignée. */
  to: string
  /** Présent seulement quand le lien quitte la langue courante. */
  lang?: string
  hreflang?: string
}

export function useLienLocalise() {
  const localePath = useLocalePath()
  const { defaultLocale } = useI18n()

  /**
   * `chemin` est le chemin non préfixé (`/conseils`). Rend la version dans la
   * langue courante quand elle existe, sinon celle de la langue par défaut.
   */
  return function lien(chemin: string): LienLocalise {
    const courant = localePath(chemin)
    if (courant) return { to: courant }

    // La page n'existe pas dans la langue courante : on sort vers la langue
    // par défaut, et les attributs disent au visiteur comme au moteur que le
    // contenu de destination n'est pas dans la langue de la page.
    const defaut = localePath(chemin, defaultLocale) || chemin
    return { to: defaut, lang: defaultLocale, hreflang: defaultLocale }
  }
}
