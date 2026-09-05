<script setup lang="ts">
/**
 * En-tête de section : surtitre + titre (avec segment en italique) et,
 * en option, un paragraphe ou un lien alignés à droite.
 *
 * Le titre est découpé en `title` + `accent` : `accent` passe en italique,
 * signature typographique reprise de la maquette d'origine sur toutes les
 * sections.
 */
withDefaults(
  defineProps<{
    eyebrow?: string
    /** Pastille colorée devant le surtitre (couleur de branche). */
    dot?: string
    title: string
    accent?: string
    /** `h2` par défaut ; `h1` pour l'en-tête principal d'une page. */
    as?: 'h1' | 'h2'
    align?: 'between' | 'start'
  }>(),
  { as: 'h2', align: 'between' },
)
</script>

<template>
  <div
    v-reveal
    class="mb-[clamp(1.875rem,4vw,3.625rem)] flex flex-wrap gap-6"
    :class="
      align === 'between'
        ? 'items-end justify-between'
        : 'flex-col items-start'
    "
  >
    <div>
      <span v-if="eyebrow" class="u-eyebrow">
        <span
          v-if="dot"
          class="size-[7px] shrink-0 rounded-full"
          :style="{ background: dot }"
        />
        {{ eyebrow }}
      </span>

      <component
        :is="as"
        class="mt-4 max-w-[22ch]"
        :class="as === 'h1' ? 'text-h1' : 'text-h2'"
      >
        {{ title }}
        <span v-if="accent" class="italic">{{ accent }}</span>
      </component>
    </div>

    <div v-if="$slots.aside" class="flex-[0_1_25rem]">
      <slot name="aside" />
    </div>
  </div>
</template>
