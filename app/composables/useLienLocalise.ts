/**
 * Liens vers des pages qui n'existent pas dans toutes les langues.
 *
 * Trois pages légales et la rubrique Conseils sont volontairement
 * francophones — `defineI18nRoute({ locales: ['fr'] })`. Pour celles-là,
 * `localePath()` et `switchLocalePath()` rendent une **chaîne vide** dans
 * l'autre langue, et `NuxtLink` fabrique alors une balise `<a>` **sans
 * `href`** : un lien qui a l'air d'un lien, se survole comme un lien, et ne
 * mène nulle part.
 *
 * Le site en portait trois à la fois : l'entrée « Advice » du menu anglais,
 * la même dans le pied de page, et le sélecteur de langue dès qu'on était sur
 * une page francophone — en anglais, la rubrique Conseils était donc
 * injoignable, et depuis un article on ne pouvait plus repasser à l'anglais.
 *
 * Plutôt que de masquer ces entrées — ce qui cacherait un contenu utile, écrit
 * pour une clientèle locale et que lisent aussi les anglophones installés au
 * Togo — on renvoie vers la version française en annonçant la langue. Un lien
 * qui change de langue et le dit vaut mieux qu'un lien absent, et bien mieux
 * qu'un lien mort.
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
