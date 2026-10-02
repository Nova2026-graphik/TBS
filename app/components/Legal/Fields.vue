<script setup lang="ts">
import type { LegalField } from '#shared/utils/legalData'

/**
 * Bloc d'identification légale, en liste de définitions : la structure porte
 * la relation intitulé / valeur, ce qu'une suite de paragraphes ne fait pas.
 *
 * Intitulés et précisions sont des clés de traduction ; la valeur n'en est
 * une que lorsqu'elle est rédigée — « Vercel Inc. » s'affiche tel quel dans
 * les deux langues.
 */
defineProps<{ fields: LegalField[] }>()
</script>

<template>
  <dl class="grid gap-x-8 gap-y-3 border-t border-ink/10 pt-6 sm:grid-cols-[minmax(9rem,14rem)_1fr]">
    <template v-for="field in fields" :key="field.label">
      <dt class="text-[0.6875rem] uppercase tracking-[0.16em] text-ink-mute sm:pt-0.5">
        {{ $t(field.label) }}
      </dt>
      <dd class="text-[0.9375rem] leading-[1.7] text-ink-soft">
        <template v-if="field.valueKey">{{ $t(field.valueKey) }}</template>
        <template v-else-if="field.value">{{ field.value }}</template>
        <LegalPending v-else :hint="field.hint" />
      </dd>
    </template>
  </dl>
</template>
