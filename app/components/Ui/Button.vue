<script setup lang="ts">
/**
 * Bouton / lien d'action unique du site.
 *
 * Rend un <NuxtLink> si `to` est fourni, un <a> si `href` l'est, sinon un
 * <button>. Les trois partagent exactement la même géométrie et le même
 * comportement au survol, ce qui évite la dérive visuelle entre pages.
 */
type Variant = 'solid' | 'outline' | 'light' | 'ghost'
type Size = 'md' | 'lg'

const props = withDefaults(
  defineProps<{
    to?: string
    href?: string
    type?: 'button' | 'submit'
    variant?: Variant
    size?: Size
    disabled?: boolean
    block?: boolean
  }>(),
  { variant: 'solid', size: 'md', type: 'button' },
)

const component = computed(() => (props.to ? resolveComponent('NuxtLink') : props.href ? 'a' : 'button'))

const VARIANTS: Record<Variant, string> = {
  // Fond brun profond → or au survol : l'action principale.
  solid: 'bg-ink text-white hover:bg-gold focus-visible:bg-gold',
  // Contour clair sur photo sombre.
  outline:
    'border border-white/50 text-white hover:bg-white hover:text-ink hover:border-white',
  // Fond blanc sur photo sombre.
  light: 'bg-white text-ink hover:bg-gold hover:text-white',
  // Contour discret sur fond clair.
  ghost:
    'border border-ink/20 text-ink hover:border-gold hover:text-gold hover:bg-gold/5',
}

const SIZES: Record<Size, string> = {
  md: 'px-6 py-3.5',
  lg: 'px-8 py-[1.125rem]',
}
</script>

<template>
  <component
    :is="component"
    :to="to"
    :href="href"
    :type="to || href ? undefined : type"
    :disabled="to || href ? undefined : disabled"
    :aria-disabled="disabled || undefined"
    class="inline-flex items-center justify-center gap-2.5 text-center text-[0.6875rem] uppercase tracking-[0.18em] transition-[background-color,color,border-color,transform] duration-500 ease-[var(--ease-out-expo)] disabled:cursor-not-allowed disabled:opacity-55"
    :class="[VARIANTS[variant], SIZES[size], block ? 'w-full' : '']"
  >
    <slot />
  </component>
</template>
