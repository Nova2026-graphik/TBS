<script setup lang="ts">
import type { Domain, ServiceBlock } from '#shared/types'

/**
 * Bloc prestation, en carte compacte : photo 4:3 à gauche, texte à droite.
 *
 * Il occupait la largeur entière, image et texte alternés — quatre blocs de
 * 500 px chacun, deux mille pixels de page pour quatre paragraphes. La
 * maquette les range en 2 × 2, et rien du texte ne change.
 *
 * Les mots-clés deviennent des liens. « Bureaux », « Sièges », « Rangement »
 * étaient des étiquettes inertes ; chacun mène maintenant à la page du
 * domaine, avec la famille présélectionnée quand une famille du domaine lui
 * correspond — « Bureaux » ouvre « Bureaux & tables ». Sinon, la page du
 * domaine sans filtre, ce qui est déjà mieux qu'une étiquette qui ne fait
 * rien.
 */
const props = defineProps<{
  block: ServiceBlock
  /** Le domaine décrit, quand le bloc en désigne un. */
  domain?: Domain
}>()

const sizesQuarter = SIZES_QUARTER

/** Le lien d'un mot-clé : domaine + famille si l'une lui correspond. */
function lien(tag: string) {
  const d = props.domain
  if (!d) return null
  const famille = (d.families ?? []).find(f => contientTexte(f, tag) || contientTexte(tag, f))
  return {
    path: `/galerie/${versUrl(d.branch)}/${d.slug}`,
    query: famille ? { famille } : undefined,
  }
}
</script>

<template>
  <article class="grid items-start gap-[1.375rem] sm:grid-cols-[12.5rem_1fr]">
    <NuxtImg
      :src="block.image"
      :alt="block.imageAlt"
      preset="card"
      loading="lazy"
      :sizes="sizesQuarter"
      width="600"
      height="450"
      class="aspect-4/3 w-full object-cover"
    />
    <div class="min-w-0">
      <p class="text-[0.625rem] uppercase tracking-[0.2em] text-ink-mute max-lg:text-xs max-lg:tracking-[0.14em]">{{ block.eyebrow }}</p>
      <h3 class="mb-2 mt-1 font-display text-2xl leading-[1.15] text-ink">
        <NuxtLinkLocale
          v-if="domain"
          :to="`/galerie/${versUrl(domain.branch)}/${domain.slug}`"
          class="inline-block transition-colors duration-400 hover:text-gold max-lg:py-2.5"
        >
          {{ block.title }}
        </NuxtLinkLocale>
        <template v-else>{{ block.title }}</template>
      </h3>
      <p class="mb-3 text-[0.84375rem] leading-[1.6] text-ink-soft">{{ block.description }}</p>

      <ul class="flex flex-wrap gap-1.5">
        <li v-for="tag in block.tags" :key="tag">
          <NuxtLinkLocale
            v-if="lien(tag)"
            :to="lien(tag)!"
            class="inline-flex min-h-11 items-center border border-ink/15 bg-sand px-2.5 py-1.5 text-[0.625rem] uppercase tracking-[0.14em] text-ink transition-colors duration-400 hover:border-gold hover:text-gold max-lg:text-xs lg:min-h-0"
          >
            {{ tag }}
          </NuxtLinkLocale>
          <span
            v-else
            class="inline-flex items-center border border-ink/15 bg-sand px-2.5 py-1.5 text-[0.625rem] uppercase tracking-[0.14em] text-ink max-lg:text-xs"
          >
            {{ tag }}
          </span>
        </li>
      </ul>
    </div>
  </article>
</template>
