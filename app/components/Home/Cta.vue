<script setup lang="ts">
/**
 * Appel final de l'accueil, en deux moitiés.
 *
 * Accueil « Mosaïque » (novembre 2026) : à gauche, l'invitation, les deux
 * actions — devis et WhatsApp — et les coordonnées en clair ; à droite, la
 * photo de réception en plein, sans voile. Les autres pages gardent le
 * bandeau commun (`SharedCtaBanner`) ; l'accueil, page d'entrée, met tout à
 * portée de main sans avoir à ouvrir /contact.
 */
const info = useSiteInfo()

const sizesHalfLg = SIZES_HALF_LG
</script>

<template>
  <section class="grid border-t border-white/10 bg-ink lg:grid-cols-2">
    <div class="u-gutter flex flex-col justify-center gap-5 py-[clamp(3rem,6vw,5.5rem)]">
      <div v-reveal>
        <span class="u-eyebrow text-cream/70">
          <span class="u-rule" />
          {{ $t('cta.eyebrow') }}
        </span>
        <h2 class="mt-4 max-w-[14ch] text-h2 text-white">
          {{ $t('cta.title') }} <span class="italic text-cream">{{ $t('cta.accent') }}</span>
        </h2>
        <p class="mt-5 max-w-[46ch] text-[0.9375rem] leading-[1.72] text-white/75">
          {{ $t('cta.lead') }}
        </p>

        <div class="mt-7 flex flex-wrap gap-3 max-sm:[&>*]:w-full">
          <UiButton to="/contact" variant="light" size="lg">{{ $t('common.quote') }}</UiButton>
          <UiButton :href="info.whatsappUrl" target="_blank" rel="noopener noreferrer" variant="outline" size="lg">
            {{ $t('common.whatsappWrite') }}
          </UiButton>
        </div>

        <dl class="mt-8 grid gap-x-8 gap-y-4 border-t border-white/12 pt-6 text-sm text-white/75 sm:grid-cols-2">
          <div>
            <dt class="mb-1 text-[0.6875rem] uppercase tracking-[0.2em] text-cream/60">{{ $t('common.phone') }}</dt>
            <dd><a :href="`tel:${info.phonePrimary}`" class="transition-colors hover:text-white">{{ info.phoneDisplay }}</a></dd>
          </div>
          <div>
            <dt class="mb-1 text-[0.6875rem] uppercase tracking-[0.2em] text-cream/60">{{ $t('common.email') }}</dt>
            <dd><a :href="`mailto:${info.email}`" class="break-all transition-colors hover:text-white">{{ info.email }}</a></dd>
          </div>
          <div>
            <dt class="mb-1 text-[0.6875rem] uppercase tracking-[0.2em] text-cream/60">{{ $t('common.address') }}</dt>
            <dd>{{ $t('common.addressShort') }}</dd>
          </div>
          <div>
            <dt class="mb-1 text-[0.6875rem] uppercase tracking-[0.2em] text-cream/60">{{ $t('common.hours') }}</dt>
            <dd>{{ $t('common.hoursWeek') }}, {{ $t('common.hoursWeekTime') }}</dd>
          </div>
        </dl>
      </div>
    </div>

    <div class="relative min-h-[14rem] max-lg:order-first lg:min-h-[26rem]">
      <NuxtImg
        src="/images/branche-events.jpg"
        alt=""
        aria-hidden="true"
        preset="card"
        loading="lazy"
        :sizes="sizesHalfLg"
        width="1200"
        height="900"
        class="absolute inset-0 size-full object-cover"
      />
    </div>
  </section>
</template>
