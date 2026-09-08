/**
 * Thème de couleurs du site.
 *
 * Deux chartes cohabitent — voir `app/assets/css/main.css` :
 *
 *  - `principal` : « Sable & Or », la charte historique du site ;
 *  - `logo` : « Bleu & Rouge », bâtie sur les deux couleurs du logotype.
 *
 * Tout le basculement tient dans l'attribut `data-theme` de <html>. Les
 * couleurs sont des `var()` : le navigateur les recalcule sur place, sans
 * recharger la page, sans seconde feuille de style, et sans que le moindre
 * composant ait à connaître le thème courant.
 *
 * Le choix est mémorisé dans `localStorage` — une préférence d'affichage,
 * strictement locale : rien n'est envoyé au serveur, et la politique de
 * confidentialité n'a pas à en parler. `localStorage` échoue en navigation
 * privée stricte ; le site retombe alors sur le thème principal à chaque
 * visite, ce qui est le comportement attendu et non une panne.
 *
 * Les pages étant pré-rendues, l'attribut ne peut pas être posé par le
 * serveur : le HTML est le même pour tout le monde. Il est donc écrit avant le
 * premier rendu par le script en ligne d'`app.vue` — sans quoi la page
 * s'afficherait un instant en sable avant de virer au bleu.
 */

export type ThemeId = 'principal' | 'logo'

export interface ThemeDefinition {
  id: ThemeId
  /** Clé i18n du nom affiché. */
  labelKey: string
  /** Les deux teintes de l'aperçu du sélecteur. */
  swatches: [string, string]
  /** Valeur de <meta name="theme-color">, pour la barre du navigateur. */
  browserTheme: string
}

export const THEMES: Record<ThemeId, ThemeDefinition> = {
  principal: {
    id: 'principal',
    labelKey: 'theme.principal',
    swatches: ['#3e3524', '#827148'],
    browserTheme: '#3e3524',
  },
  logo: {
    id: 'logo',
    labelKey: 'theme.logo',
    swatches: ['#3376ba', '#d83934'],
    browserTheme: '#16304d',
  },
}

export const THEME_ORDER: ThemeId[] = ['principal', 'logo']

/** Thème appliqué quand rien n'a été choisi. */
export const DEFAULT_THEME: ThemeId = 'principal'

/**
 * Clé de stockage. Reprise telle quelle par le script anti-clignotement
 * d'`app.vue` : si elle change ici, elle doit y changer aussi.
 */
export const THEME_STORAGE_KEY = 'tbs-theme'

function isThemeId(value: unknown): value is ThemeId {
  return typeof value === 'string' && value in THEMES
}

/** Thème retenu au chargement précédent, ou le thème par défaut. */
function readStoredTheme(): ThemeId {
  try {
    const stored = window.localStorage.getItem(THEME_STORAGE_KEY)
    return isThemeId(stored) ? stored : DEFAULT_THEME
  }
  catch {
    return DEFAULT_THEME
  }
}

export function useTheme() {
  // `useState` plutôt qu'un `ref` de module : l'état est partagé par le
  // bandeau et le tiroir mobile, et reste propre à la requête côté serveur.
  const theme = useState<ThemeId>('tbs-theme', () => DEFAULT_THEME)

  const definition = computed(() => THEMES[theme.value])

  function setTheme(next: ThemeId) {
    if (!isThemeId(next)) return
    theme.value = next
    if (import.meta.server) return

    document.documentElement.dataset.theme = next
    try {
      window.localStorage.setItem(THEME_STORAGE_KEY, next)
    }
    catch {
      // Stockage refusé (navigation privée stricte, cookies bloqués) : le
      // thème s'applique quand même, il ne survivra simplement pas au
      // rechargement. Rien à signaler au visiteur.
    }
  }

  /** Passe au thème suivant — deux thèmes, donc l'autre. */
  function toggleTheme() {
    const i = THEME_ORDER.indexOf(theme.value)
    setTheme(THEME_ORDER[(i + 1) % THEME_ORDER.length]!)
  }

  /**
   * Aligne l'état Vue sur l'attribut déjà posé par le script en ligne. Appelé
   * une seule fois, à l'hydratation, depuis `app.vue`.
   */
  function syncThemeFromDocument() {
    if (import.meta.server) return
    const attribute = document.documentElement.dataset.theme
    const resolved = isThemeId(attribute) ? attribute : readStoredTheme()
    theme.value = resolved
    document.documentElement.dataset.theme = resolved
  }

  return { theme: readonly(theme), definition, setTheme, toggleTheme, syncThemeFromDocument }
}
