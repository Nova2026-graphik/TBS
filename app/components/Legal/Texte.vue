<script setup lang="ts">
/**
 * Un paragraphe — ou un élément de liste — de page légale, écrit dans les
 * fichiers de langue et relu par `decouperTexteEnrichi`.
 *
 * Le texte traverse l'interpolation de Vue segment par segment : il est
 * échappé par construction, sans `v-html` nulle part. C'est volontaire sur
 * des pages dont le contenu finira par être mis à jour par d'autres mains
 * que celles qui ont écrit le code.
 */
const props = withDefaults(defineProps<{
  /** La chaîne déjà traduite, pas la clé. */
  texte: string
  /** `p` pour un paragraphe, `li` dans une liste, `span` en incise. */
  tag?: string
}>(), { tag: 'p' })

const segments = computed(() => decouperTexteEnrichi(props.texte))
</script>

<template>
  <component :is="tag">
    <template v-for="(segment, i) in segments" :key="i">
      <strong v-if="segment.type === 'fort'">{{ segment.texte }}</strong>
      <NuxtLinkLocale v-else-if="segment.type === 'route'" :to="segment.cible">
        {{ segment.texte }}
      </NuxtLinkLocale>
      <a v-else-if="segment.type === 'lien'" :href="segment.cible">{{ segment.texte }}</a>
      <template v-else>{{ segment.texte }}</template>
    </template>
  </component>
</template>
