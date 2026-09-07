<script setup lang="ts">
/**
 * Bandeau d'appel à l'action, répété en bas de chaque page.
 * Photo sombre + voile brun : le texte reste lisible sans dépendre du cliché.
 */
const info = useSiteInfo()

const sizesFull = SIZES_FULL
const densitiesFull = DENSITIES_FULL
</script>

<template>
  <section class="relative overflow-hidden bg-ink">
    <NuxtImg
      src="/images/branche-events.jpg"
      alt=""
      aria-hidden="true"
      preset="card"
      loading="lazy"
      :sizes="sizesFull"
      :densities="densitiesFull"
      width="1600"
      height="900"
      class="absolute inset-0 size-full object-cover opacity-45"
    />
    <div
      class="absolute inset-0"
      style="background: linear-gradient(90deg, rgb(62 53 36 / 0.94) 0%, rgb(62 53 36 / 0.72) 60%, rgb(62 53 36 / 0.55) 100%)"
    />

    <div class="u-gutter relative flex flex-wrap items-end justify-between gap-x-16 gap-y-9 py-[clamp(3rem,7vw,6.5rem)]">
      <div v-reveal>
        <span class="u-eyebrow text-cream/70">
          <span class="u-rule" />
          {{ $t('cta.eyebrow') }}
        </span>
        <h2 class="mt-4 max-w-[18ch] text-h2 text-white">
          {{ $t('cta.title') }} <span class="italic text-cream">{{ $t('cta.accent') }}</span>
        </h2>
        <p class="mt-5 max-w-[46ch] text-[0.9375rem] leading-[1.72] text-white/75">
          {{ $t('cta.lead') }}
        </p>
      </div>

      <div v-reveal="120" class="flex flex-wrap items-center gap-4">
        <UiButton to="/contact" variant="light" size="lg">{{ $t('common.quote') }}</UiButton>
        <a
          :href="`tel:${info.phonePrimary}`"
          class="inline-flex min-h-6 items-center border-b border-white/40 pb-1.5 text-[0.6875rem] uppercase tracking-[0.18em] text-white transition-colors hover:border-white"
        >
          {{ info.phoneDisplay }}
        </a>
      </div>
    </div>
  </section>
</template>
