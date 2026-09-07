<script setup lang="ts">
import type { Testimonial } from '#shared/types'

/**
 * Carrousel de témoignages.
 *
 * Réécrit par rapport à la maquette : au lieu d'un `translateX` calculé à la
 * main sur une largeur fixe de trois éléments, on utilise le scroll natif
 * avec `scroll-snap`. Résultat : glissement au doigt sur mobile, molette
 * horizontale au trackpad, navigation clavier — et aucune arithmétique de
 * pourcentages à maintenir si le nombre de témoignages change.
 */
const props = defineProps<{ testimonials: Testimonial[] }>()

const track = ref<HTMLElement | null>(null)
const active = ref(0)

function scrollTo(index: number) {
  const el = track.value
  if (!el) return
  const clamped = (index + props.testimonials.length) % props.testimonials.length
  const child = el.children[clamped] as HTMLElement | undefined
  if (!child) return
  el.scrollTo({ left: child.offsetLeft - el.offsetLeft, behavior: 'smooth' })
  active.value = clamped
}

/** Recalage de l'indicateur quand l'utilisateur fait défiler lui-même. */
function onScroll() {
  const el = track.value
  if (!el) return
  const center = el.scrollLeft + el.clientWidth / 2
  let best = 0
  let bestDistance = Number.POSITIVE_INFINITY
  Array.from(el.children).forEach((child, i) => {
    const node = child as HTMLElement
    const distance = Math.abs(node.offsetLeft - el.offsetLeft + node.clientWidth / 2 - center)
    if (distance < bestDistance) {
      bestDistance = distance
      best = i
    }
  })
  active.value = best
}
</script>

<template>
  <section class="u-gutter u-section bg-ink text-white">
    <div v-reveal class="mb-[clamp(1.875rem,4vw,3.25rem)] flex flex-wrap items-end justify-between gap-6">
      <span class="u-eyebrow text-cream/70">
        <span class="u-rule" />
        Ils nous ont confié leur date
      </span>

      <div class="flex gap-2">
        <button
          type="button"
          class="flex size-11 items-center justify-center border border-white/25 text-white transition-colors duration-400 hover:border-white hover:bg-white hover:text-ink"
          :aria-label="$t('home.testimonials.previous')"
          @click="scrollTo(active - 1)"
        >
          <span aria-hidden="true">&#8592;</span>
        </button>
        <button
          type="button"
          class="flex size-11 items-center justify-center border border-white/25 text-white transition-colors duration-400 hover:border-white hover:bg-white hover:text-ink"
          :aria-label="$t('home.testimonials.next')"
          @click="scrollTo(active + 1)"
        >
          <span aria-hidden="true">&#8594;</span>
        </button>
      </div>
    </div>

    <ul
      ref="track"
      class="-mx-[var(--spacing-gutter)] flex snap-x snap-mandatory gap-6 overflow-x-auto px-[var(--spacing-gutter)] pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      @scroll.passive="onScroll"
    >
      <li
        v-for="(item, i) in testimonials"
        :key="i"
        class="w-[min(100%,42rem)] shrink-0 snap-start"
      >
        <blockquote class="flex h-full flex-col justify-between border-t border-white/15 pt-8">
          <p class="font-display text-[clamp(1.375rem,2.6vw,2rem)] leading-[1.4] text-cream">
            «&nbsp;{{ item.quote }}&nbsp;»
          </p>
          <footer class="mt-8 flex items-center gap-3.5 text-[0.6875rem] uppercase tracking-[0.18em] text-white/50">
            <span class="h-px w-8 bg-white/35" aria-hidden="true" />
            <span>{{ item.author }} — {{ item.context }}</span>
          </footer>
        </blockquote>
      </li>
    </ul>

    <!-- Indicateurs cliquables : ils disent aussi combien il en reste.
         Le trait reste fin, mais la cible fait 44 px de haut : à 2 px, elle
         était impossible à viser au doigt (WCAG 2.5.8 en demande 24). -->
    <div class="mt-5 flex gap-1">
      <button
        v-for="(item, i) in testimonials"
        :key="`dot-${i}`"
        type="button"
        class="group grid h-11 place-items-center px-1"
        :aria-label="$t('home.testimonials.goTo', { n: i + 1 })"
        :aria-current="i === active"
        @click="scrollTo(i)"
      >
        <span
          class="h-0.5 transition-all duration-500 ease-[var(--ease-out-expo)]"
          :class="i === active ? 'w-10 bg-cream' : 'w-5 bg-white/25 group-hover:bg-white/50'"
        />
      </button>
    </div>
  </section>
</template>
