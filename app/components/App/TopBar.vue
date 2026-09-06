<script setup lang="ts">
/**
 * Bandeau supérieur sombre : rappel des quatre branches à gauche,
 * coordonnées à droite. Masqué sous 768px où il pousserait le header
 * trop bas ; l'information reste accessible dans le footer et sur /contact.
 */
const info = useSiteInfo()

const branchDots = [
  { label: 'Équipements', color: '#827148' },
  { label: 'Events', color: '#E8A07C' },
  { label: 'Études & Conseils', color: '#FFEED6' },
  { label: 'Agro', color: '#A5AF79' },
]
</script>

<template>
  <div class="hidden bg-ink md:block">
    <div class="u-gutter flex flex-wrap items-center justify-between gap-x-6 gap-y-2 py-2.5">
      <ul class="flex flex-wrap items-center gap-x-3 gap-y-1">
        <li
          v-for="(branch, i) in branchDots"
          :key="branch.label"
          class="flex items-center gap-3 text-[0.6875rem] tracking-[0.12em] text-white/60"
        >
          <span class="flex items-center gap-[7px]">
            <span class="size-1.5 rounded-full" :style="{ background: branch.color }" />
            {{ branch.label }}
          </span>
          <span v-if="i < branchDots.length - 1" aria-hidden="true" class="text-white/30">·</span>
        </li>
      </ul>

      <div class="flex flex-wrap items-center gap-x-6 gap-y-1 text-[0.6875rem] tracking-[0.12em]">
        <a
          :href="`tel:${info.phonePrimary}`"
          class="inline-flex min-h-6 items-center text-white/60 transition-colors hover:text-white"
        >
          {{ info.phoneDisplay }}
        </a>
        <a
          :href="`mailto:${info.email}`"
          class="inline-flex min-h-6 items-center text-white/60 transition-colors hover:text-white"
        >
          {{ info.email }}
        </a>
        <span class="text-white/60">Agôè - Démakpoè, Lomé</span>
      </div>
    </div>
  </div>
</template>
