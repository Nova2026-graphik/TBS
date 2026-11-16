<script setup lang="ts">
import type { RouteLocationRaw } from 'vue-router'
import type { ProcessStep } from '#shared/types'

/**
 * Étapes numérotées, partagées entre l'accueil et chaque branche de
 * /services. La ligne de liaison entre les numéros n'apparaît qu'en
 * desktop, où les cartes sont réellement alignées.
 *
 * `variant="cards"` : l'accueil « Mosaïque » (novembre 2026) pose chaque
 * étape sur une carte blanche ombrée, numéro cerclé, et relie les cartes par
 * une flèche. /services garde la frise d'origine.
 */
defineProps<{
  eyebrow: string
  dot?: string
  title: string
  accent: string
  steps: ProcessStep[]
  footnote?: string
  /**
   * Bouton de l'encart qui porte la note — « Nous consulter » vers le devis.
   * Sans lui, la note reste un paragraphe en retrait comme avant.
   */
  footnoteCta?: { label: string, to: RouteLocationRaw }
  tone?: 'light' | 'sand'
  variant?: 'line' | 'cards'
}>()
</script>

<template>
  <section class="u-gutter u-section" :class="tone === 'sand' ? 'bg-sand' : 'bg-white'">
    <UiSectionHead
      :eyebrow="eyebrow"
      :dot="dot"
      :title="title"
      :accent="accent"
      align="start"
    />

    <ol v-if="variant === 'cards'" class="grid gap-5 sm:grid-cols-2 lg:grid-cols-4 lg:gap-4">
      <li
        v-for="(step, i) in steps"
        :key="step.step"
        v-reveal="i * 90"
        class="relative bg-white px-7 py-8 shadow-lift transition-transform duration-600 ease-[var(--ease-out-expo)] hover:-translate-y-1.5"
      >
        <span class="flex size-12 items-center justify-center rounded-full border border-gold font-display text-[1.375rem] text-gold">
          {{ step.step }}
        </span>
        <h3 class="mt-6 font-sans text-base font-normal tracking-wide text-ink">{{ step.title }}</h3>
        <p class="mt-2.5 text-sm leading-[1.72]">{{ step.description }}</p>

        <!-- Flèche de liaison vers la carte suivante, sur une seule rangée. -->
        <span
          v-if="i < steps.length - 1"
          class="absolute -right-3.5 top-11 z-1 hidden size-7 items-center justify-center text-sm text-gold lg:flex"
          :class="tone === 'sand' ? 'bg-sand' : 'bg-white'"
          aria-hidden="true"
        >&#8594;</span>
      </li>
    </ol>

    <ol v-else class="relative grid gap-x-8 gap-y-10 sm:grid-cols-2 lg:grid-cols-4">
      <!-- Filet de progression, purement décoratif. -->
      <span
        class="pointer-events-none absolute left-0 right-0 top-[0.6875rem] hidden h-px bg-ink/12 lg:block"
        aria-hidden="true"
      />

      <li v-for="(step, i) in steps" :key="step.step" v-reveal="i * 90" class="relative">
        <div class="flex items-center gap-3">
          <span
            class="relative z-1 flex size-[1.375rem] items-center justify-center rounded-full text-[0.625rem] tracking-[0.1em]"
            :class="tone === 'sand' ? 'bg-sand' : 'bg-white'"
          >
            <span class="font-display text-lg text-gold">{{ step.step }}</span>
          </span>
        </div>

        <h3 class="mt-5 font-sans text-base font-normal tracking-wide text-ink">
          {{ step.title }}
        </h3>
        <p class="mt-2.5 max-w-[38ch] text-sm leading-[1.72]">{{ step.description }}</p>
      </li>
    </ol>

    <!--
      La note sur les appels d'offres était un paragraphe en retrait, qu'on
      lisait sans savoir quoi en faire. Avec un bouton, elle devient une
      porte : un encart, et « Nous consulter » qui mène au devis.
    -->
    <div
      v-if="footnote && footnoteCta"
      v-reveal
      class="mt-[2.125rem] flex flex-wrap items-center justify-between gap-6 border border-ink/12 bg-white px-[1.625rem] py-[1.375rem]"
    >
      <p class="max-w-[70ch] text-sm leading-[1.7] text-ink-soft">{{ footnote }}</p>
      <UiButton :to="footnoteCta.to" variant="ghost">{{ footnoteCta.label }}</UiButton>
    </div>
    <p
      v-else-if="footnote"
      v-reveal
      class="mt-[clamp(2rem,4vw,3.5rem)] max-w-[70ch] border-l-2 border-gold/40 pl-6 text-sm leading-[1.8] text-ink-soft"
    >
      {{ footnote }}
    </p>
  </section>
</template>
