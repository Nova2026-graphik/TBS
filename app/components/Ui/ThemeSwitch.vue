<script setup lang="ts">
/**
 * Sélecteur de charte — deux thèmes, voir `app/composables/useTheme.ts`.
 *
 * Un contrôle segmenté plutôt qu'un interrupteur : avec un interrupteur, le
 * visiteur voit l'état courant mais pas ce qui l'attend de l'autre côté. Ici
 * les deux chartes sont posées côte à côte, chacune résumée par ses deux
 * couleurs — on choisit ce qu'on voit.
 *
 * Accessibilité :
 *  - `aria-pressed` porte l'état, et non la seule couleur : la sélection reste
 *    perceptible sans distinguer les teintes (WCAG 1.4.1). Le contour clair
 *    de l'option active la double d'une différence de forme ;
 *  - chaque bouton a un nom textuel — « Charte Sable & Or » — lu par les
 *    lecteurs d'écran, là où les pastilles ne disent rien ;
 *  - les cibles font 24 px de haut, le minimum de WCAG 2.5.8 ;
 *  - les pastilles portent leur couleur en dur et non un jeton de thème :
 *    l'aperçu d'une charte doit montrer cette charte, pas celle en cours.
 *
 * Le composant est dessiné pour les surfaces sombres du site — le bandeau
 * supérieur et le tiroir mobile, les deux seuls endroits où il apparaît.
 */
const { theme, setTheme } = useTheme()

const options = THEME_ORDER.map(id => THEMES[id])
</script>

<template>
  <div
    role="group"
    :aria-label="$t('theme.label')"
    class="flex items-center gap-1"
  >
    <button
      v-for="option in options"
      :key="option.id"
      type="button"
      :aria-pressed="theme === option.id"
      class="flex h-6 items-center gap-1 rounded-full border px-1.5 transition-colors duration-400 ease-[var(--ease-out-expo)]"
      :class="
        theme === option.id
          ? 'border-white/70 bg-white/10'
          : 'border-transparent opacity-55 hover:opacity-100'
      "
      @click="setTheme(option.id)"
    >
      <span
        v-for="swatch in option.swatches"
        :key="swatch"
        class="size-2 rounded-full"
        :style="{ background: swatch }"
      />
      <span class="sr-only">{{ $t('theme.select', { name: $t(option.labelKey) }) }}</span>
    </button>
  </div>
</template>
