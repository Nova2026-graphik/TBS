/**
 * Valeurs `sizes` pour <NuxtImg>.
 *
 * Attention : @nuxt/image exige un **préfixe d'écran sur chaque jeton**.
 * Un jeton nu — `sizes="100vw"` — n'est pas compris et produit un srcset
 * dégénéré de deux entrées (`1w` et `2w`), c'est-à-dire une image de 1 à 2
 * pixels servie à la place de la photo. Le bug est silencieux : la page se
 * charge, l'image est simplement floue ou invisible.
 *
 * Ces constantes centralisent donc les combinaisons utilisées dans le site,
 * toutes explicitement qualifiées sur les sept points de rupture par défaut
 * (xs 320, sm 640, md 768, lg 1024, xl 1280, xxl 1536, 2xl 1536).
 */
const SCREENS = ['xs', 'sm', 'md', 'lg', 'xl', 'xxl', '2xl'] as const

type Screen = (typeof SCREENS)[number]

/**
 * Construit une chaîne `sizes` à partir d'une largeur de base et de
 * remplacements par point de rupture.
 *
 *   buildSizes('100vw', { md: '50vw' })
 *   → 'xs:100vw sm:100vw md:50vw lg:50vw xl:50vw xxl:50vw 2xl:50vw'
 */
function buildSizes(base: string, overrides: Partial<Record<Screen, string>> = {}): string {
  let current = base
  return SCREENS.map((screen) => {
    current = overrides[screen] ?? current
    return `${screen}:${current}`
  }).join(' ')
}

/** Image pleine largeur (hero, bandeaux). */
export const SIZES_FULL = buildSizes('100vw')

/** Une colonne en mobile, deux à partir de `md`. */
export const SIZES_HALF_MD = buildSizes('100vw', { md: '50vw' })

/** Une colonne en mobile, deux à partir de `lg`. */
export const SIZES_HALF_LG = buildSizes('100vw', { lg: '50vw' })

/** Une, puis deux (`sm`), puis trois colonnes (`lg`). */
export const SIZES_THIRD = buildSizes('100vw', { sm: '50vw', lg: '33vw' })

/** Une colonne en mobile, trois à partir de `md`. */
export const SIZES_THIRD_MD = buildSizes('100vw', { md: '33vw' })

/** Visionneuse : pleine largeur en mobile, 80 % au-delà de `lg`. */
export const SIZES_LIGHTBOX = buildSizes('100vw', { lg: '80vw' })
