<script setup lang="ts">
import type { StatItem } from '#shared/types'

/**
 * Bandeau de chiffres clés. Le filet de 1px entre les cellules est obtenu
 * par un fond coloré + `gap: 1px` — pas de bordures à désactiver aux
 * extrémités quand la grille passe à la ligne.
 */
defineProps<{ items: StatItem[] }>()
</script>

<template>
  <section class="flex flex-wrap gap-px bg-ink/10">
    <div
      v-for="(stat, i) in items"
      :key="stat.label"
      v-reveal="i * 70"
      class="flex-[1_1_15rem] bg-white px-[clamp(1.25rem,2.6vw,2.5rem)] py-[clamp(1.625rem,3.4vw,2.75rem)]"
    >
      <p class="font-display text-[clamp(1.5rem,2.6vw,2.125rem)] font-normal text-ink">
        {{ stat.value }}<span v-if="stat.suffix" class="text-peach">{{ stat.suffix }}</span>
      </p>
      <p class="mt-2.5 text-[0.6875rem] uppercase tracking-[0.2em] text-ink">
        {{ stat.label }}
      </p>
      <p v-if="stat.hint" class="mt-2 text-sm text-ink-soft">{{ stat.hint }}</p>
    </div>
  </section>
</template>
