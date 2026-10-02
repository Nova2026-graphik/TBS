<script setup lang="ts">
/**
 * Marqueur d'information légale encore attendue de TBS.
 *
 * Affiché en clair sur la page plutôt que laissé en blanc : une mention
 * incomplète se remarque et se corrige, une mention absente ne se découvre
 * qu'au contrôle. La valeur se renseigne dans `shared/utils/legalData.ts`.
 */
defineProps<{
  /** Clé i18n de la précision, pas la précision elle-même. */
  hint?: string
}>()
</script>

<template>
  <span class="u-pending">
    <span aria-hidden="true">▲</span>
    <span>
      {{ $t('legal.pending') }}<template v-if="hint"> — {{ $t(hint) }}</template>
    </span>
  </span>
</template>
