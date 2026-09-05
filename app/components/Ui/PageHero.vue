<script setup lang="ts">
/**
 * En-tête des pages intérieures (Galerie, Services, Contact, FAQ).
 * Le fil d'Ariane visible double le JSON-LD BreadcrumbList.
 */
defineProps<{
  eyebrow: string
  title: string
  accent?: string
  lead?: string
}>()
</script>

<template>
  <section class="u-gutter border-b border-ink/8 bg-sand pb-[clamp(2.25rem,5vw,4rem)] pt-[clamp(2.5rem,6vw,5.5rem)]">
    <nav aria-label="Fil d'Ariane" class="mb-8 flex items-center gap-2 text-[0.6875rem] uppercase tracking-[0.2em] text-ink-mute">
      <NuxtLink to="/" class="transition-colors hover:text-gold">Accueil</NuxtLink>
      <span aria-hidden="true">/</span>
      <span class="text-ink-soft">{{ eyebrow }}</span>
    </nav>

    <div class="flex flex-wrap items-end justify-between gap-x-14 gap-y-6">
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

      <p v-if="lead" v-reveal="90" class="max-w-[52ch] flex-[0_1_34rem] text-[0.9375rem] leading-[1.72]">
        {{ lead }}
      </p>
    </div>

    <slot />
  </section>
</template>
