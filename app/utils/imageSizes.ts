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

/**
 * Grille des références d'un domaine : deux colonnes en mobile, trois à
 * partir de `md`, quatre à partir de `lg`. La carte ne dépasse donc jamais le
 * quart de la largeur utile, et les 219 visuels tiennent leur poids.
 */
export const SIZES_QUARTER = buildSizes('50vw', { md: '33vw', lg: '25vw' })

/** Vignette de domaine dans la barre latérale : 42 px, quelle que soit la largeur. */
export const SIZES_THUMBNAIL = buildSizes('42px')

/**
 * Planche-contact des en-têtes de page (`UiPageHero`). La bande occupe toute
 * la largeur en mobile et un tiers environ en bureau ; divisée par trois ou
 * quatre cadres, chaque vignette ne dépasse jamais 200 px de large.
 */
export const SIZES_HERO_STRIP = buildSizes('33vw', { lg: '12vw' })

/** Visionneuse : pleine largeur en mobile, 80 % au-delà de `lg`. */
export const SIZES_LIGHTBOX = buildSizes('100vw', { lg: '80vw' })

/**
 * Densités pour une image **pleine largeur**.
 *
 * Avec `sizes`, @nuxt/image émet un `srcset` en descripteurs `w` : le
 * navigateur y applique lui-même la densité de l'écran. Les densités du
 * module ne servent alors qu'à prolonger l'échelle vers le haut — et sur une
 * image en 100vw, l'échelle des points de rupture couvre déjà 320 → 1536 px,
 * soit de quoi servir un téléphone 390 px en 3× (1170 px → variante 1280).
 *
 * La densité 2 n'ajoutait donc que des variantes 2048 et 3072, au-delà de la
 * largeur des sources (1400 px) : IPX les ramène au même fichier, mais elles
 * restent en tête du `srcset`, et @nuxt/image y prend le repli du `<img src>`
 * comme du `<link rel="preload">`. Un navigateur sans `imagesrcset` chargeait
 * ainsi la variante la plus lourde du lot.
 *
 * À réserver au plein écran : sur une vignette en 33vw, l'échelle plafonne à
 * ~500 px et la densité 2 reste indispensable.
 */
export const DENSITIES_FULL = '1'
