<script setup lang="ts">
import type { QuoteStatus } from '#shared/utils/adminQuotes'
import { quoteStatusLabel, quoteStatusTone } from '#shared/utils/adminQuotes'

/** Pastille de statut : la couleur porte le repère, l'intitulé porte le sens. */
defineProps<{ status: QuoteStatus }>()
</script>

<template>
  <span class="inline-flex items-center gap-2 whitespace-nowrap text-[0.8125rem]">
    <span class="size-2 shrink-0 rounded-full" :style="{ background: quoteStatusTone(status) }" />
    {{ quoteStatusLabel(status) }}
  </span>
</template>
