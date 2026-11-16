<script setup lang="ts">
import type { Inspiration } from '#shared/types'

/**
 * Trois ambiances, le texte posé sur la photo.
 *
 * Accueil « Mosaïque » (novembre 2026) : le titre et la description passent
 * sur l'image, sous un voile qui ne fonce que le bas du cliché. Chaque carte
 * mène à la galerie, où l'on retrouve ces réceptions.
 */
defineProps<{ inspirations: Inspiration[] }>()

const sizesThirdMd = SIZES_THIRD_MD
</script>

<template>
  <section class="u-gutter u-section bg-white">
    <UiSectionHead :eyebrow="$t('home.inspirations.eyebrow')" :title="$t('home.inspirations.title')" :accent="$t('home.inspirations.accent')">
      <template #aside>
        <div class="flex justify-end">
          <NuxtLinkLocale to="/galerie" class="u-link-underline">{{ $t('common.seeGallery') }}</NuxtLinkLocale>
        </div>
      </template>
    </UiSectionHead>

    <div class="grid gap-[clamp(0.875rem,1.6vw,1.375rem)] md:grid-cols-3">
      <NuxtLinkLocale
        v-for="(item, i) in inspirations"
        :key="item.title"
        v-reveal="i * 90"
        to="/galerie"
        class="group relative block aspect-4/3 overflow-hidden bg-shell md:aspect-4/5"
      >
        <NuxtImg
          :src="item.image"
          :alt="item.imageAlt"
          preset="card"
          loading="lazy"
          :sizes="sizesThirdMd"
          width="800"
          height="1000"
          class="absolute inset-0 size-full object-cover transition-transform duration-[1.2s] ease-[var(--ease-out-expo)] group-hover:scale-[1.05]"
        />
        <span class="u-scrim-bottom absolute inset-0" aria-hidden="true" />
        <span class="absolute inset-0 flex flex-col justify-end p-[clamp(1.25rem,2.2vw,1.75rem)] text-white">
          <span class="block font-display text-[clamp(1.5rem,2.3vw,2.125rem)] leading-[1.1]">{{ item.title }}</span>
          <span class="mt-2.5 block max-w-[36ch] text-sm leading-[1.65] text-white/85">{{ item.description }}</span>
        </span>
      </NuxtLinkLocale>
    </div>
  </section>
</template>
