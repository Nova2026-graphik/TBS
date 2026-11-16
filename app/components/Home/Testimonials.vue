<script setup lang="ts">
import type { Testimonial } from '#shared/types'

/**
 * Témoignages.
 *
 * Accueil « Mosaïque » (novembre 2026) : sur bureau, les trois témoignages
 * sont visibles d'un coup, en colonnes — il n'y en a que trois, et un
 * carrousel en cachait deux sur trois derrière des flèches. Sur mobile, la
 * même liste devient une rangée qui glisse au doigt (scroll natif avec
 * `scroll-snap`), et les indicateurs disent où l'on en est et combien il en
 * reste.
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
    <div v-reveal class="mb-[clamp(1.875rem,4vw,3.25rem)]">
      <span class="u-eyebrow text-cream/70">
        <span class="u-rule" />
        {{ $t('home.testimonials.eyebrow') }}
      </span>
    </div>

    <!--
      Une seule liste pour les deux formats : grille de trois colonnes à
      partir de `md`, rangée défilante en dessous.
    -->
    <ul
      ref="track"
      class="max-md:-mr-[var(--spacing-gutter)] max-md:flex max-md:snap-x max-md:snap-mandatory max-md:gap-5 max-md:overflow-x-auto max-md:pr-[var(--spacing-gutter)] max-md:[scrollbar-width:none] max-md:[&::-webkit-scrollbar]:hidden md:grid md:grid-cols-3 md:gap-[clamp(1.5rem,3vw,3rem)]"
      @scroll.passive="onScroll"
    >
      <li
        v-for="(item, i) in testimonials"
        :key="i"
        v-reveal="i * 90"
        class="max-md:w-[86%] max-md:shrink-0 max-md:snap-start"
      >
        <blockquote class="flex h-full flex-col justify-between gap-8 border-t border-white/15 pt-8">
          <p class="font-display text-[clamp(1.375rem,1.9vw,1.75rem)] leading-[1.4] text-cream">
            «&nbsp;{{ item.quote }}&nbsp;»
          </p>
          <footer class="flex items-center gap-3.5 text-[0.6875rem] uppercase tracking-[0.18em] text-white/60">
            <span class="h-px w-8 shrink-0 bg-white/35" aria-hidden="true" />
            <span>{{ item.author }} — {{ item.context }}</span>
          </footer>
        </blockquote>
      </li>
    </ul>

    <!-- Indicateurs cliquables, sur mobile seulement : ils disent aussi
         combien il en reste. Le trait reste fin, mais la cible fait 44 px de
         haut (WCAG 2.5.8 en demande 24). -->
    <div class="mt-5 flex gap-1 md:hidden">
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
