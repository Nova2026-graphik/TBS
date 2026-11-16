<script setup lang="ts">
import type { RentalCategory } from '#shared/types'

/**
 * Les six univers du parc locatif TBS Événementiel, en bandeau défilant.
 *
 * Accueil « Mosaïque » (novembre 2026) : une rangée de grandes vignettes
 * verticales qui déborde à droite de l'écran — la coupure dit qu'il y a une
 * suite. Le défilement est natif (`scroll-snap`) : glissement au doigt sur
 * mobile, molette horizontale au trackpad, et deux flèches sur bureau, qui
 * s'éteignent en bout de course.
 */
defineProps<{ categories: RentalCategory[] }>()

const sizesStrip = SIZES_STRIP

const piste = ref<HTMLElement | null>(null)
const auDebut = ref(true)
const aLaFin = ref(false)
const mouvementReduit = usePreferredReducedMotion()

/** Met à jour l'état des deux flèches d'après la position de la piste. */
function mesurer() {
  const el = piste.value
  if (!el) return
  auDebut.value = el.scrollLeft < 8
  aLaFin.value = el.scrollLeft + el.clientWidth > el.scrollWidth - 8
}

/** Avance ou recule d'une vignette. */
function defiler(sens: 1 | -1) {
  const el = piste.value
  const carte = el?.firstElementChild as HTMLElement | null | undefined
  if (!el || !carte) return
  const ecart = Number.parseFloat(getComputedStyle(el).columnGap) || 0
  el.scrollBy({
    left: sens * (carte.getBoundingClientRect().width + ecart),
    behavior: mouvementReduit.value === 'reduce' ? 'auto' : 'smooth',
  })
}

onMounted(mesurer)
useEventListener('resize', mesurer, { passive: true })
</script>

<template>
  <section class="u-gutter u-section overflow-hidden bg-sand">
    <UiSectionHead
      :eyebrow="$t('home.categories.eyebrow')"
      dot="var(--color-peach)"
      :title="$t('home.categories.title')"
      :accent="$t('home.categories.accent')"
    >
      <template #aside>
        <div class="flex items-center justify-end gap-6">
          <NuxtLinkLocale :to="{ path: '/services', query: { branche: versUrl('events') } }" class="u-link-underline">
            {{ $t('home.categories.catalogue') }}
          </NuxtLinkLocale>
          <div class="flex gap-2 max-md:hidden">
            <button
              v-for="sens in ([-1, 1] as const)"
              :key="sens"
              type="button"
              class="flex size-11 items-center justify-center border border-ink/20 text-ink transition-colors duration-400 enabled:hover:border-ink enabled:hover:bg-ink enabled:hover:text-white disabled:cursor-default disabled:opacity-35"
              :aria-label="sens < 0 ? $t('home.categories.previous') : $t('home.categories.next')"
              :disabled="sens < 0 ? auDebut : aLaFin"
              @click="defiler(sens)"
            >
              <span aria-hidden="true">{{ sens < 0 ? '←' : '→' }}</span>
            </button>
          </div>
        </div>
      </template>
    </UiSectionHead>

    <!--
      La piste déborde dans la gouttière de droite : la dernière vignette
      visible est coupée par le bord de l'écran, pas par la marge.
    -->
    <div
      ref="piste"
      class="-mr-[var(--spacing-gutter)] flex snap-x snap-mandatory gap-[clamp(0.875rem,1.6vw,1.375rem)] overflow-x-auto pb-1 pr-[var(--spacing-gutter)] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      @scroll.passive="mesurer"
    >
      <NuxtLinkLocale
        v-for="category in categories"
        :key="category.slug"
        :to="{ path: '/services', query: { branche: versUrl('events') }, hash: `#${category.slug}` }"
        class="group w-[72%] shrink-0 snap-start sm:w-[clamp(15rem,22vw,20rem)]"
      >
        <div class="relative aspect-3/4 overflow-hidden bg-shell">
          <NuxtImg
            :src="category.image"
            :alt="category.imageAlt"
            preset="card"
            loading="lazy"
            :sizes="sizesStrip"
            width="600"
            height="800"
            class="size-full object-cover transition-transform duration-[1.1s] ease-[var(--ease-out-expo)] group-hover:scale-[1.05]"
          />
        </div>

        <div class="flex items-baseline justify-between gap-3.5 px-0.5 pt-4">
          <span class="font-display text-[clamp(1.25rem,2vw,1.625rem)] text-ink">
            {{ category.name }}
          </span>
          <span class="shrink-0 text-[0.6875rem] uppercase tracking-[0.18em] text-ink-soft">
            {{ $t('home.categories.refCount', { count: category.refCount }) }}
          </span>
        </div>
      </NuxtLinkLocale>
    </div>
  </section>
</template>
