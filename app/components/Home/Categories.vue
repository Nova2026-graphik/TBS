<script setup lang="ts">
import type { RentalCategory } from '#shared/types'

/** Les six univers du parc locatif TBS Events. */
defineProps<{ categories: RentalCategory[] }>()

const sizesThird = SIZES_THIRD
</script>

<template>
  <section class="u-gutter u-section bg-sand">
    <UiSectionHead
      eyebrow="TBS Events — nos catégories"
      dot="#E8A07C"
      title="Six univers,"
      accent="une seule livraison"
    >
      <template #aside>
        <NuxtLink to="/services?branche=events" class="u-link-underline">
          Voir le catalogue
        </NuxtLink>
      </template>
    </UiSectionHead>

    <div class="grid gap-[clamp(0.875rem,1.6vw,1.375rem)] sm:grid-cols-2 lg:grid-cols-3">
      <NuxtLink
        v-for="(category, i) in categories"
        :key="category.slug"
        v-reveal="(i % 3) * 80"
        :to="`/services?branche=events#${category.slug}`"
        class="group block transition-transform duration-600 ease-[var(--ease-out-expo)] hover:-translate-y-1.5"
      >
        <div class="relative aspect-4/3 overflow-hidden bg-shell">
          <NuxtImg
            :src="category.image"
            :alt="category.imageAlt"
            preset="card"
            loading="lazy"
            :sizes="sizesThird"
            width="900"
            height="675"
            class="size-full object-cover transition-transform duration-[1.1s] ease-[var(--ease-out-expo)] group-hover:scale-[1.05]"
          />
        </div>

        <div class="flex items-baseline justify-between gap-3.5 px-0.5 pt-4">
          <span class="font-display text-[clamp(1.25rem,2.1vw,1.6875rem)] text-ink">
            {{ category.name }}
          </span>
          <span class="shrink-0 text-[0.6875rem] uppercase tracking-[0.18em] text-ink-soft">
            {{ category.refCount }} réf.
          </span>
        </div>
      </NuxtLink>
    </div>
  </section>
</template>
