<script setup lang="ts">
import type { GalleryItem } from '#shared/types'

/**
 * Visionneuse plein écran — ajout par rapport à la maquette, où les
 * vignettes n'étaient pas cliquables.
 *
 * Accessibilité : dialogue modal, focus déplacé à l'ouverture et rendu à la
 * fermeture, Échap ferme, flèches gauche/droite naviguent, le scroll de la
 * page est verrouillé.
 */
const props = defineProps<{ items: GalleryItem[], index: number | null }>()
const emit = defineEmits<{ close: [], navigate: [index: number] }>()

const dialog = ref<HTMLElement | null>(null)
const current = computed(() => (props.index === null ? null : props.items[props.index] ?? null))

function go(delta: number) {
  if (props.index === null || !props.items.length) return
  emit('navigate', (props.index + delta + props.items.length) % props.items.length)
}

watch(
  () => props.index,
  async (value) => {
    if (import.meta.server) return
    document.documentElement.style.overflow = value === null ? '' : 'hidden'
    if (value !== null) {
      await nextTick()
      dialog.value?.focus()
    }
  },
)

onBeforeUnmount(() => {
  if (import.meta.client) document.documentElement.style.overflow = ''
})

onKeyStroke('Escape', () => props.index !== null && emit('close'))
onKeyStroke('ArrowLeft', () => props.index !== null && go(-1))
onKeyStroke('ArrowRight', () => props.index !== null && go(1))

const sizesLightbox = SIZES_LIGHTBOX
</script>

<template>
  <Teleport to="body">
    <Transition
      enter-active-class="transition-opacity duration-300"
      enter-from-class="opacity-0"
      leave-active-class="transition-opacity duration-200"
      leave-to-class="opacity-0"
    >
      <!--
        Le clic sur le fond ferme la visionneuse. C'est un raccourci de confort
        pour la souris, doublé au clavier par la touche Échap (cf. plus haut) :
        aucune fonction n'est réservée au pointeur, d'où la dérogation.
      -->
      <!-- eslint-disable-next-line vuejs-accessibility/click-events-have-key-events, vuejs-accessibility/no-static-element-interactions -->
      <div
        v-if="current"
        ref="dialog"
        role="dialog"
        aria-modal="true"
        :aria-label="current.title"
        tabindex="-1"
        class="fixed inset-0 z-200 flex flex-col bg-ink/97 backdrop-blur-sm"
        @click.self="emit('close')"
      >
        <div class="flex items-center justify-between gap-6 px-[clamp(1rem,4vw,3rem)] py-4">
          <p class="text-[0.6875rem] uppercase tracking-[0.2em] text-white/55">
            {{ (index ?? 0) + 1 }} / {{ items.length }}
          </p>
          <button
            type="button"
            class="flex size-11 items-center justify-center text-2xl text-white/70 transition-colors hover:text-white"
            :aria-label="$t('gallery.lightbox.close')"
            @click="emit('close')"
          >
            <span aria-hidden="true">&times;</span>
          </button>
        </div>

        <div class="flex min-h-0 flex-1 items-center gap-3 px-[clamp(0.5rem,3vw,3rem)]">
          <button
            type="button"
            class="hidden size-12 shrink-0 items-center justify-center border border-white/20 text-white transition-colors hover:bg-white hover:text-ink sm:flex"
            :aria-label="$t('gallery.lightbox.previous')"
            @click="go(-1)"
          >
            <span aria-hidden="true">&#8592;</span>
          </button>

          <figure class="flex min-h-0 flex-1 flex-col items-center justify-center gap-5">
            <NuxtImg
              :src="current.image"
              :alt="current.imageAlt"
              :sizes="sizesLightbox"
              width="1600"
              height="1067"
              class="max-h-[68svh] w-auto object-contain"
            />
            <figcaption class="text-center">
              <p class="font-display text-[clamp(1.25rem,2.4vw,1.75rem)] text-cream">
                {{ current.title }}
              </p>
              <p v-if="current.location" class="mt-1.5 text-[0.6875rem] uppercase tracking-[0.2em] text-white/45">
                {{ current.location }}
              </p>
            </figcaption>
          </figure>

          <button
            type="button"
            class="hidden size-12 shrink-0 items-center justify-center border border-white/20 text-white transition-colors hover:bg-white hover:text-ink sm:flex"
            :aria-label="$t('gallery.lightbox.next')"
            @click="go(1)"
          >
            <span aria-hidden="true">&#8594;</span>
          </button>
        </div>

        <!-- Sur mobile, les flèches latérales sont trop étroites : on les
             reprend en pleine largeur sous la légende. -->
        <div class="flex gap-2 px-4 pb-6 pt-4 sm:hidden">
          <button
            type="button"
            class="flex-1 border border-white/20 py-3 text-[0.6875rem] uppercase tracking-[0.18em] text-white"
            @click="go(-1)"
          >
            Précédente
          </button>
          <button
            type="button"
            class="flex-1 border border-white/20 py-3 text-[0.6875rem] uppercase tracking-[0.18em] text-white"
            @click="go(1)"
          >
            Suivante
          </button>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>
