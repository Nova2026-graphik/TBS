<script setup lang="ts">
/**
 * Feuille du bas — le dialogue des téléphones.
 *
 * Une fenêtre centrée de 860 px n'a pas de sens sur un écran de 375 : elle
 * se réduit à une colonne étroite dont la moitié est de la marge. La feuille
 * monte du bas, prend toute la largeur et 90 % de la hauteur visible ; le
 * pouce reste au même endroit pour lire, faire défiler et fermer.
 *
 * `90dvh` et non `90vh` : sur Android, `vh` compte la barre d'adresse même
 * quand elle est rétractée, et une feuille en `vh` dépasse l'écran de la
 * hauteur de cette barre. `dvh` suit ce qui est réellement visible.
 *
 * Trois fermetures, aucune réservée au pointeur : le bouton (44 px), la
 * touche Échap, et le geste vers le bas — un glissement de plus de 80 px
 * depuis la poignée. Le geste est un raccourci ; le bouton est la garantie.
 *
 * À partir de `sm`, le composant rend une fenêtre centrée classique : c'est
 * le même contenu, le même focus piégé, la même fermeture, et l'appelant n'a
 * rien à savoir de la largeur d'écran.
 */
const props = defineProps<{
  open: boolean
  label: string
}>()

const emit = defineEmits<{ close: [] }>()

const dialogue = ref<HTMLElement | null>(null)

useDialogueFocus(dialogue, computed(() => props.open))
onKeyStroke('Escape', () => props.open && emit('close'))

// ── Le geste vers le bas ────────────────────────────────────────────────────
const SEUIL = 80
let departY: number | null = null
const decalage = ref(0)

function debut(e: TouchEvent) {
  departY = e.touches[0]?.clientY ?? null
}
function mouvement(e: TouchEvent) {
  if (departY === null) return
  const y = e.touches[0]?.clientY ?? departY
  decalage.value = Math.max(0, y - departY)
}
function fin() {
  if (decalage.value > SEUIL) emit('close')
  decalage.value = 0
  departY = null
}
</script>

<template>
  <Teleport to="body">
    <Transition
      enter-active-class="transition-opacity duration-300"
      enter-from-class="opacity-0"
      leave-active-class="transition-opacity duration-200"
      leave-to-class="opacity-0"
    >
      <!-- eslint-disable-next-line vuejs-accessibility/click-events-have-key-events, vuejs-accessibility/no-static-element-interactions -->
      <div
        v-if="open"
        class="fixed inset-0 z-200 flex items-end justify-center bg-ink/85 backdrop-blur-sm sm:items-center sm:p-6"
        @click.self="emit('close')"
      >
        <div
          ref="dialogue"
          role="dialog"
          aria-modal="true"
          :aria-label="label"
          tabindex="-1"
          class="relative flex h-[90dvh] w-full flex-col bg-white transition-transform duration-200 ease-out motion-reduce:transition-none sm:h-auto sm:max-h-[86dvh] sm:max-w-4xl"
          :style="decalage ? { transform: `translateY(${decalage}px)`, transitionDuration: '0ms' } : undefined"
        >
          <!--
            La poignée : zone de saisie du geste, et repère visuel que la
            feuille se tire. Masquée à partir de `sm`, où il n'y a pas de geste.
          -->
          <div
            class="flex h-11 shrink-0 touch-none items-center justify-center sm:hidden"
            @touchstart.passive="debut"
            @touchmove.passive="mouvement"
            @touchend="fin"
            @touchcancel="fin"
          >
            <span aria-hidden="true" class="h-1 w-10 rounded-full bg-ink/20" />
          </div>

          <button
            type="button"
            class="absolute right-0 top-0 z-10 flex size-11 items-center justify-center text-2xl text-ink-mute transition-colors hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-[-4px] focus-visible:outline-ink"
            :aria-label="$t('domain.quickView.close')"
            @click="emit('close')"
          >
            <span aria-hidden="true">&times;</span>
          </button>

          <!-- Le contenu défile ; le pied, s'il y en a un, reste collé en bas. -->
          <div class="min-h-0 flex-1 overflow-y-auto overscroll-contain">
            <slot />
          </div>

          <div v-if="$slots.footer" class="shrink-0 border-t border-ink/10 bg-white p-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
            <slot name="footer" />
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>
