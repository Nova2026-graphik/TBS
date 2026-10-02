<script setup lang="ts">
/**
 * Liste à puces d'une page légale, écrite comme un tableau dans les fichiers
 * de langue.
 *
 * Les entrées restent groupées sous une seule clé : l'anglais n'ordonne pas
 * toujours une énumération comme le français, et une liste éclatée en clés
 * numérotées (`item1`, `item2`…) interdit d'en changer l'ordre ou le nombre
 * d'une langue à l'autre.
 */
const props = defineProps<{
  /** Clé i18n du tableau — `legal.notice.othersItems`, par exemple. */
  cle: string
}>()

const { tm, rt } = useI18n()
const entrees = computed(() => (tm(props.cle) as unknown[]).map(entree => rt(entree as string)))
</script>

<template>
  <ul>
    <LegalTexte v-for="(entree, i) in entrees" :key="i" tag="li" :texte="entree" />
  </ul>
</template>
