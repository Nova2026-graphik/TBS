<script setup lang="ts">
import type { ServiceBlock } from '#shared/types'

/**
 * Bloc prestation en deux colonnes, image et texte alternés.
 *
 * L'inversion déplace la colonne image en second via `order`, sans toucher
 * à l'ordre du DOM : la lecture au clavier et au lecteur d'écran reste
 * image → texte quelle que soit la parité de la boucle.
 */
defineProps<{ block: ServiceBlock, reversed: boolean, accent: string }>()

const sizesHalfLg = SIZES_HALF_LG
</script>

<template>
  <article
    class="grid items-center gap-[clamp(1.5rem,4vw,4rem)] lg:grid-cols-2"
    :class="reversed ? 'lg:[&>*:first-child]:order-2' : ''"
  >
    <div v-reveal class="relative aspect-4/3 overflow-hidden bg-shell">
      <NuxtImg
        :src="block.image"
        :alt="block.imageAlt"
        preset="card"
        loading="lazy"
        :sizes="sizesHalfLg"
        width="1000"
        height="750"
        class="size-full object-cover"
      />
    </div>

    <div v-reveal="100">
      <span class="u-eyebrow" :style="{ color: brandTextColor(accent) }">
        {{ block.eyebrow }}
      </span>

      <h2 class="mt-4 max-w-[18ch] text-h3">{{ block.title }}</h2>

      <p class="mt-5 max-w-[48ch] text-[0.9375rem] leading-[1.75]">
        {{ block.description }}
      </p>

      <UiTag :items="block.tags" class="mt-7" />
    </div>
  </article>
</template>
