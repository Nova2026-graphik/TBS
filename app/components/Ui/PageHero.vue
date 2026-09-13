<script setup lang="ts">
import { SIZES_HERO_STRIP } from '~/utils/imageSizes'

/**
 * En-tête des pages intérieures (Galerie, Services, Conseils, Contact, FAQ,
 * pages légales). Le fil d'Ariane visible double le JSON-LD BreadcrumbList.
 *
 * `media` ajoute une bande de vignettes sous le chapô : trois ou quatre
 * cadres alignés, façon planche-contact, qui donnent à voir de quoi la page
 * parle avant qu'on ait lu une ligne. Elle occupe le vide qui s'étendait
 * jusqu'ici à droite du titre.
 *
 * Deux partis pris :
 *
 *  - **les vignettes sont décoratives.** Elles n'apportent aucune information
 *    que le texte ne donne déjà, et les mêmes photos se retrouvent en pleine
 *    taille plus bas dans la page. Un `alt` descriptif ferait donc lire deux
 *    fois la même chose à un lecteur d'écran : la bande est retirée de l'arbre
 *    d'accessibilité (`aria-hidden`), conformément à WCAG 1.1.1 pour une image
 *    de pure décoration ;
 *  - **le cadre porte le rapport d'aspect, pas l'image.** La hauteur est donc
 *    réservée avant le chargement : aucun décalage de mise en page, et le
 *    budget CLS de la CI (0,1) reste tenu.
 *
 * `media` reste facultatif, et le rendu sans lui est exactement celui d'avant.
 * Les huit pages qui utilisent ce composant en passent aujourd'hui — les trois
 * pages légales comprises, dont la planche suit les temps de leur chapô plutôt
 * que d'y ajouter du décor.
 */
export interface HeroMedia {
  src: string
  /**
   * Sujet de la vignette. Jamais rendu en `alt` — la bande est décorative —
   * mais exigé à l'appel : il documente le choix de la photo pour qui
   * reprendra la page, là où un chemin de fichier ne dit pas grand-chose.
   */
  subject: string
}

const props = defineProps<{
  eyebrow: string
  title: string
  accent?: string
  lead?: string
  /** Deux à quatre vignettes. Au-delà, les cadres deviennent illisibles. */
  media?: HeroMedia[]
}>()

const strip = computed(() => (props.media ?? []).slice(0, 4))

/**
 * Une colonne par vignette, sur toutes les tailles d'écran. La bande fait
 * environ un tiers de la largeur en bureau et toute la largeur en mobile,
 * d'où les deux valeurs de `sizes`.
 */
const stripColumns = computed(() => `repeat(${strip.value.length}, minmax(0, 1fr))`)
</script>

<template>
  <section class="u-gutter border-b border-ink/8 bg-sand pb-[clamp(2.25rem,5vw,4rem)] pt-[clamp(2.5rem,6vw,5.5rem)]">
    <nav :aria-label="$t('common.breadcrumb')" class="mb-8 flex items-center gap-2 text-[0.6875rem] uppercase tracking-[0.2em] text-ink-mute">
      <NuxtLinkLocale to="/" class="transition-colors hover:text-gold">{{ $t('nav.home') }}</NuxtLinkLocale>
      <span aria-hidden="true">/</span>
      <span class="text-ink-soft">{{ eyebrow }}</span>
    </nav>

    <!--
      Deux colonnes explicites dès `lg` quand la bande est là, et non un
      `flex-wrap` comme sans elle.

      La raison est mesurable : avec `flex-wrap`, le passage à la ligne se
      décide sur la largeur intrinsèque du titre, qui change quand Cormorant
      Garamond remplace la police de repli. La colonne de droite commençait
      donc sous le titre puis remontait à côté de lui vers 150 ms — 0,25 de
      CLS sur trois pages, deux fois et demie le budget de la CI. Une grille
      décide de la même chose avant tout chargement de police.

      Sans bande, on garde exactement la disposition précédente : le chemin
      reste emprunté par toute page appelant le composant sans `media`.
    -->
    <div
      class="items-end gap-x-14 gap-y-6"
      :class="strip.length
        ? 'grid grid-cols-1 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)]'
        : 'flex flex-wrap justify-between'"
    >
      <div v-reveal>
        <span class="u-eyebrow">
          <span class="u-rule" />
          {{ eyebrow }}
        </span>
        <h1 class="mt-4 max-w-[16ch] text-h1">
          {{ title }}
          <span v-if="accent" class="italic">{{ accent }}</span>
        </h1>
      </div>

      <div
        v-if="lead || strip.length"
        class="flex min-w-0 flex-col gap-[clamp(1.25rem,2.5vw,2rem)]"
        :class="strip.length ? '' : 'flex-[0_1_34rem]'"
      >
        <p v-if="lead" v-reveal="90" class="max-w-[52ch] text-[0.9375rem] leading-[1.72]">
          {{ lead }}
        </p>

        <!--
          Planche-contact. Chaque cadre entre avec 110 ms de décalage sur le
          précédent : la bande se compose de gauche à droite plutôt que
          d'apparaître d'un bloc. Le zoom lent de `animate-ken-burns` fait le
          reste — les deux sont neutralisés sous `prefers-reduced-motion`.
        -->
        <div
          v-if="strip.length"
          class="grid gap-[clamp(0.5rem,1vw,0.875rem)]"
          :style="{ gridTemplateColumns: stripColumns }"
          aria-hidden="true"
        >
          <div
            v-for="(item, i) in strip"
            :key="item.src"
            v-reveal="140 + i * 110"
            class="aspect-square overflow-hidden bg-shell"
          >
            <NuxtImg
              :src="item.src"
              alt=""
              preset="card"
              :sizes="SIZES_HERO_STRIP"
              width="800"
              height="800"
              loading="eager"
              class="animate-ken-burns size-full object-cover"
            />
          </div>
        </div>
      </div>
    </div>

    <slot />
  </section>
</template>
