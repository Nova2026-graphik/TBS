<script setup lang="ts">
import type { StatItem } from '#shared/types'

/**
 * Bandeau de chiffres clés. Le filet de 1px entre les cellules est obtenu
 * par un fond coloré + `gap: 1px` — pas de bordures à désactiver aux
 * extrémités quand la grille passe à la ligne.
 *
 * `tone="dark"` : bandeau encre, chiffres en crème. C'est la version de
 * l'accueil « Mosaïque », où il prolonge la mosaïque photo et la sépare
 * franchement de la section blanche qui suit. Le suffixe y passe au bleu
 * clair : le rouge de marque, sur l'encre, reste sous les 3:1 qu'exige un
 * grand texte (WCAG 1.4.3) — le « h » de « 24 h » porte du sens.
 */
withDefaults(defineProps<{ items: StatItem[], tone?: 'light' | 'dark' }>(), { tone: 'light' })
</script>

<template>
  <section class="flex flex-wrap gap-px" :class="tone === 'dark' ? 'bg-white/10' : 'bg-ink/10'">
    <div
      v-for="(stat, i) in items"
      :key="stat.label"
      v-reveal="i * 70"
      class="flex-[1_1_15rem] px-[clamp(1.25rem,2.6vw,2.5rem)] py-[clamp(1.625rem,3.4vw,2.75rem)] max-sm:flex-[1_1_40%]"
      :class="tone === 'dark' ? 'bg-ink' : 'bg-white'"
    >
      <p
        class="font-display text-[clamp(1.5rem,2.6vw,2.125rem)] font-normal"
        :class="tone === 'dark' ? 'text-cream' : 'text-ink'"
      >
        {{ stat.value }}<span v-if="stat.suffix" :class="tone === 'dark' ? 'text-olive' : 'text-peach'">{{ stat.suffix }}</span>
      </p>
      <p
        class="mt-2.5 text-[0.6875rem] uppercase tracking-[0.2em]"
        :class="tone === 'dark' ? 'text-white' : 'text-ink'"
      >
        {{ stat.label }}
      </p>
      <p v-if="stat.hint" class="mt-2 text-sm" :class="tone === 'dark' ? 'text-white/65' : 'text-ink-soft'">
        {{ stat.hint }}
      </p>
    </div>
  </section>
</template>
