<script setup lang="ts">
import type { Branch, Domain } from '#shared/types'

/**
 * Les domaines d'intervention, rangés par branche.
 *
 * Accueil « Mosaïque » (novembre 2026) : une ligne par branche — son nom et
 * son accroche à gauche, ses domaines en pastilles à droite. La liste d'avant
 * mettait les dix-sept domaines bout à bout en cartes de même poids, et l'on
 * ne voyait pas que treize appartiennent aux Équipements. Ici, la répartition
 * se lit d'un coup d'œil.
 *
 * Chaque pastille mène à la page du domaine dans la galerie, et porte sa
 * description en infobulle : la ligne reste courte, le détail est à un
 * survol ou un clic.
 */
const props = defineProps<{ domains: Domain[], branches: Branch[] }>()

/** Branches dans l'ordre d'affichage, chacune avec ses domaines. */
const lignes = computed(() =>
  [...props.branches]
    .sort((a, b) => a.index - b.index)
    .map(branch => ({ branch, domaines: domainesDeLaBranche(props.domains, branch.slug) }))
    .filter(ligne => ligne.domaines.length > 0),
)
</script>

<template>
  <section class="u-gutter u-section bg-white">
    <UiSectionHead
      :eyebrow="$t('home.domains.eyebrow')"
      :title="$t('home.domains.title')"
      :accent="$t('home.domains.accent')"
    >
      <template #aside>
        <div class="flex justify-end">
          <NuxtLinkLocale to="/services" class="u-link-underline">{{ $t('home.domains.detail') }}</NuxtLinkLocale>
        </div>
      </template>
    </UiSectionHead>

    <ul class="border-b border-ink/10">
      <li
        v-for="{ branch, domaines } in lignes"
        :key="branch.slug"
        v-reveal
        class="grid gap-4 border-t border-ink/10 py-[clamp(1.25rem,2.4vw,1.75rem)] md:grid-cols-[16rem_1fr] md:gap-8"
      >
        <div>
          <h3 class="flex items-center gap-3 text-2xl">
            <span class="size-2 shrink-0 rounded-full" :style="{ background: brandColor(branch.color) }" />
            {{ branch.name }}
          </h3>
          <p class="mt-1.5 text-[0.6875rem] uppercase leading-normal tracking-[0.18em] text-ink-mute">
            {{ branch.tagline }}
          </p>
        </div>

        <ul class="flex flex-wrap content-start gap-2">
          <li v-for="domaine in domaines" :key="domaine.slug">
            <NuxtLinkLocale
              :to="`/galerie/${versUrl(domaine.branch)}/${domaine.slug}`"
              :title="domaine.description"
              class="inline-flex min-h-11 items-center border border-ink/15 bg-white px-4 py-2 text-sm text-ink transition-colors duration-400 hover:border-gold hover:bg-sand max-sm:px-3 max-sm:text-[0.8125rem]"
            >
              {{ domaine.title }}
            </NuxtLinkLocale>
          </li>
        </ul>
      </li>
    </ul>
  </section>
</template>
