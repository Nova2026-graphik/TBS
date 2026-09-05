<script setup lang="ts">
/** Étiquette de catégorie, utilisée en grappes sous les descriptions. */
defineProps<{ items: string[] }>()
</script>

<template>
  <ul class="flex flex-wrap gap-2">
    <li v-for="item in items" :key="item" class="u-tag">{{ item }}</li>
  </ul>
</template>
