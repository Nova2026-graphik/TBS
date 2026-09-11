<script setup lang="ts">
import type { Domain, Equipment } from '#shared/types'

/**
 * Fiche rapide d'une référence — modale ouverte au clic sur une carte.
 *
 * Elle évite une page par référence : deux cent dix-neuf pages qui ne
 * porteraient qu'un titre, une phrase et trois caractéristiques seraient deux
 * cent dix-neuf pages maigres à indexer, pour un catalogue qui ne vend rien
 * en ligne. La fiche répond à la même question sans quitter la grille.
 *
 * Accessibilité, sur le modèle de `GalleryLightbox` : dialogue modal, focus
 * déplacé à l'ouverture et rendu au retour, Échap ferme, flèches gauche et
 * droite passent d'une référence à l'autre, défilement de la page verrouillé.
 */
const props = defineProps<{
  references: Equipment[]
  index: number | null
  domain: Domain
}>()

const emit = defineEmits<{ close: [], navigate: [index: number] }>()

const dialog = ref<HTMLElement | null>(null)
const courante = computed(() =>
  props.index === null ? null : props.references[props.index] ?? null,
)

function go(delta: number) {
  if (props.index === null || !props.references.length) return
  emit('navigate', (props.index + delta + props.references.length) % props.references.length)
}

watch(
  () => props.index,
  async (valeur) => {
    if (import.meta.server) return
    document.documentElement.style.overflow = valeur === null ? '' : 'hidden'
    if (valeur !== null) {
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

const info = useSiteInfo()
const { t } = useI18n()

/**
 * Le devis part avec ce que le visiteur vient de lire : la branche, et le nom
 * de la référence. Sans cela il lui faudrait retrouver et retaper l'intitulé
 * exact — ce que personne ne fait.
 */
const lienDevis = computed(() => ({
  path: '/contact',
  query: {
    branche: props.domain.branch,
    message: courante.value
      ? t('domain.quote.intro', { name: courante.value.name, domain: props.domain.title })
      : undefined,
  },
}))

const lienWhatsapp = computed(() => {
  const texte = courante.value
    ? t('domain.quote.whatsapp', { name: courante.value.name })
    : ''
  return `https://wa.me/${info.whatsapp}?text=${encodeURIComponent(texte)}`
})

/**
 * Fiche du catalogue d'origine.
 *
 * Le champ `source` porte un chemin relatif au site dont les descriptions
 * proviennent. Le lien est demandé par la maquette ; il mérite une décision
 * commerciale explicite, car il envoie un visiteur de TBS vers la boutique
 * d'un tiers. Le retirer ne coûte que ce bloc.
 */
const lienSource = computed(() =>
  courante.value?.source ? `https://stea-afrika.com${courante.value.source}` : null,
)

const sizesQuickView = SIZES_HALF_LG
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
        Le clic sur le fond ferme la fiche : raccourci de confort pour la
        souris, doublé au clavier par Échap. Aucune fonction n'est réservée au
        pointeur, d'où la dérogation.
      -->
      <!-- eslint-disable-next-line vuejs-accessibility/click-events-have-key-events, vuejs-accessibility/no-static-element-interactions -->
      <div
        v-if="courante"
        ref="dialog"
        role="dialog"
        aria-modal="true"
        :aria-label="courante.name"
        tabindex="-1"
        class="fixed inset-0 z-200 flex items-end justify-center bg-ink/85 p-0 backdrop-blur-sm sm:items-center sm:p-6"
        @click.self="emit('close')"
      >
        <div
          class="relative flex max-h-[92vh] w-full max-w-4xl flex-col overflow-y-auto bg-white sm:max-h-[86vh] sm:flex-row"
        >
          <button
            type="button"
            class="absolute right-0 top-0 z-10 flex size-11 items-center justify-center text-2xl text-ink-mute transition-colors hover:text-ink"
            :aria-label="$t('domain.quickView.close')"
            @click="emit('close')"
          >
            <span aria-hidden="true">&times;</span>
          </button>

          <!-- Le visuel suit la même règle que la carte dont il vient. -->
          <div
            class="flex shrink-0 items-center justify-center p-8 sm:w-2/5"
            :class="courante.kind === 'photo' ? 'bg-shell' : 'bg-white'"
          >
            <div
              v-if="courante.kind === 'med' && courante.image"
              class="aspect-square w-full max-w-[17rem] overflow-hidden rounded-full shadow-[0_12px_30px_-14px_rgba(0,0,0,0.45)]"
            >
              <NuxtImg
                :src="courante.image"
                alt=""
                preset="hero"
                :sizes="sizesQuickView"
                width="700"
                height="700"
                class="size-full object-cover"
              />
            </div>
            <NuxtImg
              v-else-if="courante.image"
              :src="courante.image"
              alt=""
              preset="hero"
              :sizes="sizesQuickView"
              width="700"
              height="875"
              class="max-h-[46vh] w-auto max-w-full object-contain"
            />
            <div
              v-else
              class="flex aspect-4/5 w-full flex-col items-center justify-center gap-3"
            >
              <NuxtImg
                v-if="domain.thumbnail"
                :src="domain.thumbnail"
                alt=""
                preset="card"
                :sizes="sizesQuickView"
                width="400"
                height="400"
                class="w-[55%] object-contain opacity-[0.14]"
              />
              <span class="text-[0.5625rem] uppercase tracking-[0.16em] text-ink-mute">
                {{ $t('domain.card.comingSoon') }}
              </span>
            </div>
          </div>

          <div class="flex-1 px-7 pb-8 pt-12 sm:px-9">
            <p class="text-[0.5625rem] uppercase tracking-[0.18em] text-ink-mute">
              {{ $t('domain.quickView.position', { i: (index ?? 0) + 1, n: references.length }) }}
              · {{ domain.title }}<template v-if="courante.family"> · {{ courante.family }}</template>
            </p>

            <h2 class="mt-3 font-display text-[clamp(1.5rem,3vw,2rem)] leading-[1.15] text-ink">
              {{ courante.name }}
            </h2>

            <p class="mt-4 max-w-[52ch] text-[0.9375rem] leading-[1.7] text-ink-soft">
              {{ courante.description }}
            </p>

            <ul v-if="courante.specs.length" class="mt-5 flex flex-wrap gap-1.5">
              <li
                v-for="spec in courante.specs"
                :key="spec"
                class="border border-ink/15 px-2 py-0.5 text-[0.6875rem] leading-[1.5] tracking-[0.04em] text-ink-mute"
              >
                {{ spec }}
              </li>
            </ul>

            <p class="mt-6 text-[0.8125rem] leading-[1.7] text-ink-mute">
              {{ $t('domain.quickView.availability') }}
            </p>

            <p v-if="courante.nonContractual" class="mt-2 text-[0.8125rem] text-ink-mute">
              {{ $t('domain.card.nonContractual') }}.
            </p>

            <a
              v-if="lienSource"
              :href="lienSource"
              target="_blank"
              rel="noopener nofollow"
              class="mt-3 inline-flex min-h-11 items-center text-[0.8125rem] text-ink-mute underline underline-offset-4 transition-colors duration-400 hover:text-gold"
            >
              {{ $t('domain.quickView.source') }} <span aria-hidden="true">&nbsp;↗</span>
            </a>

            <div class="mt-7 flex flex-wrap items-center gap-3">
              <UiButton :to="lienDevis" size="md">
                {{ $t('common.quote') }}
              </UiButton>
              <UiButton :href="lienWhatsapp" variant="ghost" size="md" target="_blank" rel="noopener">
                {{ $t('common.whatsapp') }} <span aria-hidden="true">↗</span>
              </UiButton>
            </div>

            <!--
              Flèches de parcours : la fiche se lit en série, comme la grille.
              Elles doublent les touches ← et → pour qui n'utilise pas le
              clavier.
            -->
            <div v-if="references.length > 1" class="mt-8 flex items-center gap-2 border-t border-ink/10 pt-5">
              <button
                type="button"
                class="flex size-11 items-center justify-center border border-ink/15 text-ink-soft transition-colors hover:border-gold hover:text-gold"
                :aria-label="$t('domain.quickView.previous')"
                @click="go(-1)"
              >
                <span aria-hidden="true">‹</span>
              </button>
              <button
                type="button"
                class="flex size-11 items-center justify-center border border-ink/15 text-ink-soft transition-colors hover:border-gold hover:text-gold"
                :aria-label="$t('domain.quickView.next')"
                @click="go(1)"
              >
                <span aria-hidden="true">›</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>
