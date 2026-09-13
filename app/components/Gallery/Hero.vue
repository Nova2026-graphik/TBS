<script setup lang="ts">
import type { Branch, GalleryCategory, GalleryItem } from '#shared/types'
import { DENSITIES_FULL, SIZES_FULL } from '~/utils/imageSizes'

/**
 * En-tête de la galerie — planche animée.
 *
 * Elle remplace la planche-contact statique de `UiPageHero` sur cette page,
 * et sur celle-ci seulement : les quatre autres pages intérieures gardent
 * l'en-tête commun, qui leur suffit.
 *
 * La composition suit celle des pages de présentation modernes — un grand
 * cadre animé en tête, la titraille dessous — mais l'habillage reste celui du
 * site : angles vifs, sable et encre, Cormorant pour le titre. On emprunte le
 * mouvement, pas la charte.
 *
 * Ce qui tourne : une **collection** à la fois, c'est-à-dire une des
 * catégories de la galerie. Chaque diapositive montre sa photo de couverture
 * et une carte qui la nomme — « Mariages · 6 réalisations · TBS Événementiel ».
 *
 * Trois partis pris :
 *
 *  - **la carte est un bouton, pas une légende.** Elle applique le filtre
 *    correspondant. Sans cela, l'animation ne serait qu'un diaporama de plus :
 *    ici elle sert d'entrée dans le catalogue, au même titre que les pastilles
 *    posées sous le titre — et elle reste la seule chose lisible de la
 *    planche, le reste étant décoratif ;
 *  - **la planche suit l'URL.** Choisir « Cérémonies » dans les pastilles
 *    amène la diapositive correspondante et arrête la rotation : le visiteur
 *    voit ce qu'il vient de demander, il ne le regarde pas défiler ;
 *  - **le mouvement s'arrête.** Rotation de six secondes, donc au-delà des
 *    cinq secondes de WCAG 2.2.2 : bouton de pause explicite, arrêt au survol,
 *    au focus clavier et quand l'onglet passe en arrière-plan. Sous
 *    `prefers-reduced-motion`, la rotation est *désactivée* — pas accélérée :
 *    la réduction globale de `main.css` ramène les durées à 0,01 ms, ce qui
 *    ferait sauter la photo toutes les six secondes, exactement ce que le
 *    réglage cherche à éviter.
 */
const props = defineProps<{
  items: GalleryItem[]
  branches: Branch[]
  /**
   * Filtre de catégorie actif dans l'URL. `all` laisse la planche tourner ;
   * toute autre valeur l'immobilise sur la collection demandée.
   */
  active: string
}>()

const emit = defineEmits<{ select: [value: string] }>()

const { t } = useI18n()

/** Durée d'affichage d'une diapositive. */
const DUREE_MS = 6_000

/** Cadence du minuteur : soixante pas par diapositive, assez fin pour une barre fluide. */
const PAS_MS = 100

interface Collection {
  value: GalleryCategory
  label: string
  count: number
  /** Branche qui a réalisé la majorité des photos de la collection. */
  branchName: string
  color: string
  image: string
}

/**
 * Branche majoritaire d'un lot. Une collection mélange rarement les branches —
 * « Fournitures & équipements » est la seule à le faire — mais quand elle le
 * fait, la carte doit nommer celle qui a fourni l'essentiel des photos, pas la
 * première rencontrée.
 */
function brancheMajoritaire(lot: GalleryItem[]): string | undefined {
  const comptes = new Map<string, number>()
  for (const item of lot) comptes.set(item.branch, (comptes.get(item.branch) ?? 0) + 1)
  return [...comptes.entries()].sort((a, b) => b[1] - a[1])[0]?.[0]
}

/**
 * Une diapositive par collection **non vide**, dans l'ordre des pastilles.
 *
 * Une catégorie sans photo publiée est retirée plutôt que montrée vide : la
 * planche promet des réalisations, elle ne doit pas ouvrir sur un catalogue
 * vide au clic.
 */
const collections = computed<Collection[]>(() =>
  GALLERY_FILTERS
    .filter(filtre => filtre.value !== 'all')
    .map((filtre): Collection | null => {
      const lot = props.items.filter(item => item.category === filtre.value)
      const couverture = lot[0]
      if (!couverture) return null

      const branche = props.branches.find(b => b.slug === brancheMajoritaire(lot))
      return {
        value: filtre.value,
        label: t(`gallery.filters.${filtre.value}`),
        count: lot.length,
        branchName: branche?.name ?? '',
        color: branche ? brandColor(branche.color) : 'var(--color-gold)',
        image: couverture.image,
      }
    })
    .filter((collection): collection is Collection => collection !== null),
)

const section = useTemplateRef<HTMLElement>('section')

const actif = ref(0)
const courante = computed(() => collections.value[actif.value])

/** Écoulé sur la diapositive courante, en millisecondes. */
const ecoule = ref(0)
const progression = computed(() => Math.min(ecoule.value / DUREE_MS, 1))

const enPauseManuelle = ref(false)
const focusDedans = ref(false)
const survole = useElementHover(section)
const visibilite = useDocumentVisibility()
const mouvementReduit = usePreferredReducedMotion()

/**
 * Un filtre choisi vaut arrêt : la planche montre alors la collection
 * demandée et s'y tient. Elle repart quand le visiteur revient à « Tout voir ».
 */
const filtree = computed(() => props.active !== 'all')

const rotationAutomatique = computed(
  () => collections.value.length > 1
    && mouvementReduit.value !== 'reduce'
    && !filtree.value,
)

const enPause = computed(
  () =>
    enPauseManuelle.value
    || survole.value
    || focusDedans.value
    || visibilite.value === 'hidden',
)

/**
 * Le minuteur tourne en continu et n'accumule que hors pause : la barre de
 * progression et le changement de diapositive lisent ainsi la même horloge.
 */
useIntervalFn(() => {
  if (!rotationAutomatique.value || enPause.value) return

  ecoule.value += PAS_MS
  if (ecoule.value >= DUREE_MS) aller((actif.value + 1) % collections.value.length)
}, PAS_MS)

function aller(index: number) {
  actif.value = index
  ecoule.value = 0
}

/** La planche suit le filtre de l'URL, d'où qu'il vienne. */
watch(
  () => props.active,
  (valeur) => {
    const index = collections.value.findIndex(collection => collection.value === valeur)
    if (index >= 0) aller(index)
  },
  { immediate: true },
)

/**
 * Les photos secondaires n'arrivent qu'une fois la page chargée : les cinq
 * étant dans la fenêtre, un `loading="lazy"` ne les aurait pas retenues et
 * elles se seraient disputé la bande passante avec celle qui, elle, doit
 * s'afficher tout de suite. `load` a déjà pu passer au moment de
 * l'hydratation — d'où la vérification de `readyState`.
 */
const imagesSecondaires = ref(false)

onMounted(() => {
  if (document.readyState === 'complete') {
    imagesSecondaires.value = true
    return
  }
  useEventListener(window, 'load', () => {
    imagesSecondaires.value = true
  }, { once: true })
})

/** Visible dès le rendu serveur : sans JavaScript, la planche reste lisible et fixe. */
function estRendue(index: number) {
  return index === 0 || imagesSecondaires.value
}

const sizesFull = SIZES_FULL
const densitiesFull = DENSITIES_FULL

/** Vignette de la carte : 64 px de côté, quel que soit l'écran. */
const sizesCarte = 'xs:64px sm:64px md:64px lg:64px xl:64px xxl:64px 2xl:64px'

/**
 * Sous-titre de la carte. Deux clés plutôt qu'une forme plurielle de
 * `vue-i18n` : le choix se lit ici, et la traduction anglaise n'a pas à
 * porter une syntaxe qu'aucune autre clé du dossier n'utilise.
 */
function meta(collection: Collection): string {
  const cle = collection.count > 1 ? 'gallery.hero.meta' : 'gallery.hero.metaOne'
  return t(cle, { count: collection.count, branch: collection.branchName })
}
</script>

<template>
  <section
    ref="section"
    class="u-gutter border-b border-ink/8 bg-sand pb-[clamp(2.25rem,5vw,4rem)] pt-[clamp(1.75rem,4vw,3rem)]"
    @focusin="focusDedans = true"
    @focusout="focusDedans = false"
  >
    <nav
      :aria-label="$t('common.breadcrumb')"
      class="mb-6 flex items-center gap-2 text-[0.6875rem] uppercase tracking-[0.2em] text-ink-mute"
    >
      <NuxtLinkLocale to="/" class="transition-colors hover:text-gold">{{ $t('nav.home') }}</NuxtLinkLocale>
      <span aria-hidden="true">/</span>
      <span class="text-ink-soft">{{ $t('gallery.eyebrow') }}</span>
    </nav>

    <!--
      Le cadre porte le rapport d'aspect, pas l'image : la hauteur est réservée
      avant tout chargement, et le budget CLS de la CI (0,1) reste tenu.

      Trois proportions : portrait en mobile, où un panorama ne montrerait plus
      rien ; paysage dès `sm` ; deux pour un en bureau.

      En bureau, une **hauteur fixe** remplace le rapport d'aspect, et ce n'est
      pas un détail de goût :

       - un deux pour un sur une colonne de 1 280 px donne 640 px de planche.
         Le titre de premier rang et les pastilles de filtre passaient alors
         tous deux sous la ligne de flottaison, et la page s'ouvrait sur une
         photo sans nom. La planche est le sujet de la page, elle n'est pas la
         page ;
       - `max-height` ne réglait pas la chose. Sur une boîte à `aspect-ratio`,
         le navigateur **recalcule la largeur** depuis le rapport dès que la
         hauteur est bridée : la planche perdait 320 px de large et se
         décalait à gauche des pastilles. Une hauteur posée réserve la même
         place — le CLS reste nul — sans toucher à la largeur.
    -->
    <div
      v-if="collections.length"
      class="relative aspect-4/5 overflow-hidden bg-shell sm:aspect-3/2 lg:aspect-auto lg:h-[30rem]"
    >
      <!--
        Les photos sont empilées et se croisent en fondu : la sortante reste
        sous l'entrante, aucun aplat de fond n'apparaît entre deux clichés. Le
        zoom lent repart à chaque diapositive, par la seule bascule de classe.

        Elles sont décoratives : les mêmes photos se retrouvent en pleine
        taille dans la grille, avec leur légende. Un `alt` descriptif ferait
        lire deux fois la même chose à un lecteur d'écran (WCAG 1.1.1).
      -->
      <div class="pointer-events-none absolute inset-0" aria-hidden="true">
        <template v-for="(collection, i) in collections" :key="collection.value">
          <div
            v-if="estRendue(i)"
            class="galerie-cliche absolute inset-0"
            :class="i === actif ? 'is-active' : ''"
          >
            <NuxtImg
              :src="collection.image"
              alt=""
              preset="hero"
              :preload="i === 0"
              :fetchpriority="i === 0 ? 'high' : 'low'"
              :sizes="sizesFull"
              :densities="densitiesFull"
              width="1920"
              height="1280"
              class="size-full object-cover"
            />
          </div>
        </template>
      </div>

      <!--
        Voile **bas seulement**, et non sur toute la hauteur comme dans les
        bandeaux de la maison : la planche est ici le sujet, pas un fond de
        titre. Un voile plein ternissait les salles claires — nappage ivoire,
        verrerie — c'est-à-dire précisément ce que la page vient montrer. Il
        ne couvre donc que la bande où passent les segments et la commande
        d'arrêt, qui, eux, ont besoin d'un contraste garanti.
      -->
      <div class="galerie-voile pointer-events-none absolute inset-x-0 bottom-0 h-[clamp(4.5rem,10vw,7.5rem)]" />

      <!--
        Carte de collection, au centre. C'est le seul contenu lisible de la
        planche : le reste est décoratif et sort de l'arbre d'accessibilité.
      -->
      <div class="absolute inset-0 flex items-center justify-center p-[clamp(1rem,3vw,2rem)]">
        <Transition name="galerie-carte" mode="out-in">
          <button
            v-if="courante"
            :key="courante.value"
            type="button"
            class="flex max-w-full items-center gap-4 bg-bone py-3 pl-3 pr-[clamp(1rem,2.5vw,1.75rem)] text-left shadow-panel transition-transform duration-500 ease-[var(--ease-out-expo)] hover:-translate-y-0.5"
            :aria-label="$t('gallery.hero.filter', { collection: courante.label })"
            @click="emit('select', courante.value)"
          >
            <span class="relative size-14 shrink-0 overflow-hidden bg-shell sm:size-16">
              <NuxtImg
                :src="courante.image"
                alt=""
                preset="card"
                :sizes="sizesCarte"
                width="128"
                height="128"
                loading="lazy"
                class="size-full object-cover"
              />
              <span class="absolute inset-x-0 bottom-0 h-0.5" :style="{ background: courante.color }" />
            </span>

            <span class="min-w-0">
              <span class="block truncate text-[clamp(1rem,2vw,1.375rem)] leading-tight text-ink">
                {{ courante.label }}
              </span>
              <span class="mt-1 block truncate text-[0.6875rem] uppercase tracking-[0.16em] text-ink-mute">
                {{ meta(courante) }}
              </span>
            </span>
          </button>
        </Transition>
      </div>

      <!--
        Segments : celui de la diapositive affichée se remplit sur les six
        secondes, et cesse de se remplir dès que la rotation est en pause — ce
        qui rend l'état visible sans avoir à l'écrire.
      -->
      <div
        v-if="collections.length > 1"
        class="absolute inset-x-0 bottom-0 flex items-center justify-center gap-1.5 px-[clamp(1rem,3vw,2rem)] pb-[clamp(0.25rem,1.5vw,1rem)]"
      >
        <button
          v-for="(collection, i) in collections"
          :key="collection.value"
          type="button"
          class="group flex h-11 w-9 items-center sm:w-14"
          :aria-label="$t('gallery.hero.show', { collection: collection.label })"
          :aria-current="i === actif ? 'true' : undefined"
          @click="aller(i)"
        >
          <span class="relative block h-0.5 w-full overflow-hidden bg-white/35 transition-colors duration-500 group-hover:bg-white/60">
            <span
              class="absolute inset-y-0 left-0 transition-[width] duration-100 ease-linear"
              :style="{
                width: i === actif ? `${(filtree ? 1 : progression) * 100}%` : '0%',
                background: collection.color,
              }"
            />
          </span>
        </button>

        <!-- WCAG 2.2.2 : l'arrêt doit être explicite, pas seulement au survol.
             Le bouton disparaît quand plus rien ne tourne — un filtre posé, ou
             `prefers-reduced-motion` — plutôt que d'offrir une commande sans
             effet. -->
        <button
          v-if="rotationAutomatique"
          type="button"
          class="flex size-11 items-center justify-center text-white/70 transition-colors duration-500 hover:text-white"
          :aria-label="enPauseManuelle ? $t('hero.resume') : $t('hero.pause')"
          :aria-pressed="enPauseManuelle"
          @click="enPauseManuelle = !enPauseManuelle"
        >
          <svg viewBox="0 0 24 24" class="size-4" fill="currentColor" aria-hidden="true">
            <path v-if="enPauseManuelle" d="M8 5v14l11-7z" />
            <path v-else d="M7 5h3.5v14H7zM13.5 5H17v14h-3.5z" />
          </svg>
        </button>
      </div>
    </div>

    <!--
      Titraille sous la planche, centrée : le grand cadre porte le regard, le
      titre le nomme. La mesure reste bornée — un titre pleine largeur en
      Cormorant se lit mal au-delà d'une vingtaine de caractères par ligne.
    -->
    <div class="mx-auto mt-[clamp(1.75rem,4vw,3rem)] flex max-w-[62rem] flex-col items-center text-center">
      <span v-reveal class="u-eyebrow">
        <span class="u-rule" />
        {{ $t('gallery.eyebrow') }}
        <span class="u-rule" />
      </span>

      <h1 v-reveal="90" class="mt-4 max-w-[18ch] text-h1">
        {{ $t('gallery.title') }}
        <span class="italic">{{ $t('gallery.accent') }}</span>
      </h1>

      <p v-reveal="150" class="mt-5 max-w-[58ch] text-[0.9375rem] leading-[1.72]">
        {{ $t('gallery.lead') }}
      </p>
    </div>

    <slot />
  </section>
</template>

<style scoped>
/* Voile des commandes. La couleur vient du jeton de thème : sur le thème
   sombre, l'ombre portée suit sans qu'on ait à la redéclarer. */
.galerie-voile {
  background: linear-gradient(
    to top,
    rgb(var(--tbs-scrim) / 0.62) 0%,
    rgb(var(--tbs-scrim) / 0) 100%
  );
}

/**
 * Fondu croisé et zoom lent, réglés comme ceux du hero d'accueil : le zoom
 * court sur toute la durée de la diapositive plutôt que sur une amorce de deux
 * secondes qui s'arrêterait. Le retour à l'échelle 1 se fait pendant que
 * l'image s'efface, il ne se voit pas.
 */
.galerie-cliche {
  opacity: 0;
  transform: scale(1);
  transition:
    opacity 1s var(--ease-out-expo),
    transform 6s linear;
  will-change: opacity, transform;
}

.galerie-cliche.is-active {
  opacity: 1;
  transform: scale(1.03);
}

.galerie-carte-enter-active {
  transition:
    opacity 0.5s var(--ease-out-expo) 0.12s,
    transform 0.5s var(--ease-out-expo) 0.12s;
}

.galerie-carte-leave-active {
  transition:
    opacity 0.28s var(--ease-out-expo),
    transform 0.28s var(--ease-out-expo);
}

.galerie-carte-enter-from {
  opacity: 0;
  transform: translateY(12px);
}

.galerie-carte-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}
</style>
