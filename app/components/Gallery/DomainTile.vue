<script setup lang="ts">
import type { Domain } from '#shared/types'

/**
 * Tuile d'un domaine dans le panneau des secteurs.
 *
 * Elle remplace les puces en `flex-wrap` dont la largeur suivait la longueur
 * du texte : « Matériel roulant » faisait une puce courte, « Équipements
 * hospitaliers & de laboratoire » en faisait une qui occupait la rangée
 * entière. D'où des rangées de une ou deux puces, des alignements qui
 * sautaient, et treize domaines qui ne tenaient plus dans la hauteur du
 * panneau — la première puce passait sous le bord et n'était plus cliquable.
 *
 * Toutes les tuiles ont donc la même taille, et c'est la grille qui les
 * range. Le nom est coupé à deux lignes plutôt que d'élargir sa colonne :
 * `min-w-0` sur le bloc central est ce qui l'y oblige — sans lui, un élément
 * de grille refuse de devenir plus étroit que son contenu, et le plus long
 * intitulé dicterait la largeur des trois colonnes.
 */
const props = defineProps<{
  domain: Domain
  /** Rang dans la branche, affiché « 01 ». */
  index: number
  /** Nombre de références du domaine, compté dans les données. */
  total: number
  /** Segment d'URL public de la branche. */
  branchUrl: string
}>()

const { t } = useI18n()

/** Une seule lettre, quand aucune vignette n'existe pour le domaine. */
const initiale = computed(() => props.domain.title.trim().charAt(0).toUpperCase())

const etiquette = computed(() =>
  t('gallery.sectors.tileLabel', { domain: props.domain.title, count: props.total }),
)

const sizesThumbnail = SIZES_THUMBNAIL
</script>

<template>
  <NuxtLinkLocale
    :to="`/galerie/${branchUrl}/${domain.slug}`"
    :aria-label="etiquette"
    class="group/tuile flex h-[4.375rem] items-center gap-3 border border-white/20 bg-white/[0.07] py-2 pl-2 pr-3 text-white transition-[background-color,border-color,transform,box-shadow] duration-250 ease-out hover:border-white/60 hover:bg-white/[0.18] hover:shadow-[0_14px_24px_-14px_rgba(0,0,0,0.6)] focus-visible:border-white/60 focus-visible:bg-white/[0.18] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white max-md:h-16 md:hover:-translate-y-0.5 md:focus-visible:-translate-y-0.5 motion-reduce:transform-none motion-reduce:transition-none"
  >
    <!--
      Le carré clair sert de fond aux objets détourés : posés sur le voile
      sombre du panneau, ils disparaîtraient. `bg-cream` suit la charte
      active — sable en « Sable & Or », bleu pâle en « Bleu & Rouge ».
    -->
    <span class="grid size-[3.25rem] flex-none place-items-center bg-cream">
      <NuxtImg
        v-if="domain.thumbnail"
        :src="domain.thumbnail"
        alt=""
        preset="card"
        loading="lazy"
        :sizes="sizesThumbnail"
        width="84"
        height="84"
        class="max-h-[2.625rem] max-w-[2.625rem] object-contain"
      />
      <span v-else aria-hidden="true" class="font-display text-[1.375rem] leading-none text-ink">
        {{ initiale }}
      </span>
    </span>

    <!-- `min-w-0` : sans lui, le plus long intitulé élargirait les colonnes. -->
    <span aria-hidden="true" class="min-w-0 flex-1">
      <span class="mb-[3px] block text-[0.625rem] uppercase tracking-[0.18em] text-white/55">
        {{ String(index).padStart(2, '0') }}
      </span>
      <!--
        Pas de `block` ici : `line-clamp-2` pose `display:-webkit-box`, et les
        deux classes se disputaient la propriété. `block` l'emportait, la
        coupe à deux lignes ne s'appliquait plus, et dans une tuile étroite le
        nom débordait de la carte en s'écrivant une lettre par ligne.
      -->
      <span class="line-clamp-2 text-[0.84375rem] leading-[1.2] [overflow-wrap:anywhere]">
        {{ domain.title }}
      </span>
    </span>

    <span aria-hidden="true" class="flex-none text-right text-[0.6875rem] uppercase leading-[1.3] tracking-[0.14em] text-white/60">
      <b class="block text-[0.9375rem] font-normal tracking-normal text-white">
        {{ total }}<span
          class="inline-block w-0 overflow-hidden opacity-0 transition-[width,opacity] duration-250 group-hover/tuile:w-[1.1em] group-hover/tuile:opacity-100 group-focus-visible/tuile:w-[1.1em] group-focus-visible/tuile:opacity-100"
        >&nbsp;&rarr;</span>
      </b>
      {{ $t('gallery.sectors.tileUnit') }}
    </span>
  </NuxtLinkLocale>
</template>
