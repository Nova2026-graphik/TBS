<script setup lang="ts">
import type { Domain } from '#shared/types'

/**
 * Les huit domaines d'intervention, tous branches confondues.
 * La pastille reprend la couleur de la branche : le lecteur relie chaque
 * ligne à son métier sans avoir à lire l'étiquette.
 */
const props = defineProps<{ domains: Domain[], branches: { slug: string, color: string, name: string }[] }>()

const colorOf = (slug: string) =>
  props.branches.find(b => b.slug === slug)?.color ?? '#827148'
const nameOf = (slug: string) =>
  props.branches.find(b => b.slug === slug)?.name ?? ''
</script>

<template>
  <section class="u-gutter u-section bg-white">
    <UiSectionHead
      :eyebrow="$t('home.domains.eyebrow')"
      :title="$t('home.domains.title')"
      :accent="$t('home.domains.accent')"
    >
      <template #aside>
        <NuxtLinkLocale to="/services" class="u-link-underline">{{ $t('home.domains.detail') }}</NuxtLinkLocale>
      </template>
    </UiSectionHead>

    <ul class="grid gap-px border-y border-ink/10 bg-ink/10 md:grid-cols-2">
      <li
        v-for="(domain, i) in domains"
        :key="domain.title"
        v-reveal="(i % 2) * 60"
        class="group flex gap-5 bg-white p-[clamp(1.25rem,2.4vw,2rem)] transition-colors duration-500 hover:bg-sand"
      >
        <span
          class="mt-2 size-2 shrink-0 rounded-full transition-transform duration-500 ease-[var(--ease-out-expo)] group-hover:scale-150"
          :style="{ background: brandColor(colorOf(domain.branch)) }"
        />
        <div>
          <p class="text-[0.6875rem] uppercase tracking-[0.2em] text-ink-mute">
            {{ nameOf(domain.branch) }}
          </p>
          <h3 class="mt-2 font-sans text-base font-normal tracking-wide text-ink">
            {{ domain.title }}
          </h3>
          <p class="mt-2 max-w-[46ch] text-sm leading-[1.7]">{{ domain.description }}</p>
        </div>
      </li>
    </ul>
  </section>
</template>
