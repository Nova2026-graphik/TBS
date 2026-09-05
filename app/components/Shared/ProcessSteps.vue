<script setup lang="ts">
import type { ProcessStep } from '#shared/types'

/**
 * Étapes numérotées, partagées entre l'accueil et chaque branche de
 * /services. La ligne de liaison entre les numéros n'apparaît qu'en
 * desktop, où les cartes sont réellement alignées.
 */
defineProps<{
  eyebrow: string
  dot?: string
  title: string
  accent: string
  steps: ProcessStep[]
  footnote?: string
  tone?: 'light' | 'sand'
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

    <ol class="relative grid gap-x-8 gap-y-10 sm:grid-cols-2 lg:grid-cols-4">
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

    <p
      v-if="footnote"
      v-reveal
      class="mt-[clamp(2rem,4vw,3.5rem)] max-w-[70ch] border-l-2 border-gold/40 pl-6 text-sm leading-[1.8] text-ink-soft"
    >
      {{ footnote }}
    </p>
  </section>
</template>
