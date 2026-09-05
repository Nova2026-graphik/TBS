<script setup lang="ts">
import type { Inspiration } from '#shared/types'

defineProps<{ inspirations: Inspiration[] }>()

const sizesThirdMd = SIZES_THIRD_MD
</script>

<template>
  <section class="u-gutter u-section bg-sand">
    <UiSectionHead eyebrow="Inspirations" title="Trois ambiances" accent="signées TBS">
      <template #aside>
        <NuxtLink to="/galerie" class="u-link-underline">Voir la galerie</NuxtLink>
      </template>
    </UiSectionHead>

    <div class="grid gap-[clamp(1.25rem,2.4vw,2.125rem)] md:grid-cols-3">
      <article v-for="(item, i) in inspirations" :key="item.title" v-reveal="i * 90" class="group">
        <div class="relative aspect-3/4 overflow-hidden bg-shell">
          <NuxtImg
            :src="item.image"
            :alt="item.imageAlt"
            preset="card"
            loading="lazy"
            :sizes="sizesThirdMd"
            width="800"
            height="1067"
            class="size-full object-cover transition-transform duration-[1.2s] ease-[var(--ease-out-expo)] group-hover:scale-[1.05]"
          />
        </div>
        <h3 class="mt-5 text-[clamp(1.25rem,2.1vw,1.75rem)]">{{ item.title }}</h3>
        <p class="mt-2.5 max-w-[40ch] text-[0.9375rem] leading-[1.72]">{{ item.description }}</p>
      </article>
    </div>
  </section>
</template>
