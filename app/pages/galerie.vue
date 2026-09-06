<script setup lang="ts">
import type { GalleryCategory } from '#shared/types'

/**
 * Galerie filtrable.
 *
 * Trois écarts avec la maquette :
 *  - le filtre vit dans l'URL (`?filtre=mariage`) : partageable et indexable ;
 *  - les vignettes masquées sont retirées du DOM plutôt que cachées en CSS,
 *    donc plus d'images invisibles à charger ni de pièges au clavier ;
 *  - chaque vignette ouvre une visionneuse plein écran.
 */
const route = useRoute()
const router = useRouter()
const { data } = await useSiteContent()

const filters = GALLERY_FILTERS
const VALID = filters.map((f) => f.value) as readonly string[]

const activeFilter = computed<string>(() => {
  const raw = route.query.filtre
  const value = Array.isArray(raw) ? raw[0] : raw
  return typeof value === 'string' && VALID.includes(value) ? value : 'all'
})

function setFilter(value: string) {
  const query = { ...route.query }
  if (value === 'all') delete query.filtre
  else query.filtre = value
  router.replace({ query })
}

const visible = computed(() =>
  activeFilter.value === 'all'
    ? data.value.gallery
    : data.value.gallery.filter((i) => i.category === (activeFilter.value as GalleryCategory)),
)

// Index dans `visible`, pour que les flèches de la visionneuse restent
// cohérentes avec le filtre affiché.
const lightboxIndex = ref<number | null>(null)

/**
 * Chargement progressif : neuf vignettes au premier rendu, le reste sur
 * demande. Les vingt-trois d'un coup représentaient l'essentiel des 586 Ko
 * d'images de la page — près de vingt secondes sur une 3G dégradée, courante
 * hors de Lomé.
 *
 * Le rendu serveur ne produit donc que les neuf premières : les autres
 * n'existent ni dans le HTML, ni dans le `srcset`, tant qu'on ne les demande
 * pas. La visionneuse, elle, garde accès à la sélection entière.
 */
const BATCH = 9
const shownCount = ref(BATCH)
const shown = computed(() => visible.value.slice(0, shownCount.value))
const remaining = computed(() => visible.value.length - shown.value.length)

const grid = useTemplateRef<HTMLElement>('grid')


async function showMore() {
  const firstNew = shownCount.value
  shownCount.value += BATCH
  await nextTick()

  // Le bouton disparaît quand tout est affiché : sans cela le focus
  // retomberait sur le `<body>`. On le pose sur la première nouvelle vignette.
  if (remaining.value === 0) {
    const buttons = grid.value?.querySelectorAll<HTMLButtonElement>('li button')
    buttons?.[firstNew]?.focus()
  }
}

// Un changement de filtre invalide l'index courant et remet le compteur à zéro.
watch(activeFilter, () => {
  lightboxIndex.value = null
  shownCount.value = BATCH
})

function chipClass(isActive: boolean) {
  return isActive
    ? 'bg-ink border-ink text-white'
    : 'bg-transparent border-ink/18 text-ink-soft hover:border-gold hover:text-gold'
}

usePageSeo({
  title: 'Galerie — nos réceptions et livraisons',
  description:
    'Une sélection de réceptions équipées par TBS Events et de livraisons réalisées par TBS Distribution entre 2024 et 2026, à Lomé et partout au Togo.',
  path: '/galerie',
  image: '/og-galerie.jpg',
})

useBreadcrumbSchema([{ name: 'Galerie', path: '/galerie' }])

const sizesThird = SIZES_THIRD
</script>

<template>
  <div>
    <UiPageHero
      eyebrow="Galerie"
      title="Nos réceptions,"
      accent="salle par salle"
      lead="Une sélection de réceptions équipées par TBS Events et de livraisons réalisées par TBS Distribution entre 2024 et 2026. Filtrez par secteur."
    >
      <div class="mt-[clamp(1.75rem,4vw,3rem)] flex flex-wrap gap-2.5">
        <button
          v-for="filter in filters"
          :key="filter.value"
          type="button"
          :aria-pressed="activeFilter === filter.value"
          class="rounded-full border px-5 py-2.5 text-[0.6875rem] uppercase tracking-[0.16em] transition-colors duration-400"
          :class="chipClass(activeFilter === filter.value)"
          @click="setFilter(filter.value)"
        >
          {{ filter.label }}
        </button>
      </div>
    </UiPageHero>

    <section ref="grid" class="u-gutter u-section bg-white">
      <!-- Compteur : l'utilisateur voit immédiatement l'effet du filtre. -->
      <p class="mb-8 text-[0.6875rem] uppercase tracking-[0.2em] text-ink-mute" aria-live="polite">
        <template v-if="remaining > 0">
          {{ shown.length }} sur {{ visible.length }} réalisations
        </template>
        <template v-else>
          {{ visible.length }} réalisation{{ visible.length > 1 ? 's' : '' }}
        </template>
      </p>

      <TransitionGroup
        tag="ul"
        class="grid gap-[clamp(0.875rem,1.8vw,1.5rem)] sm:grid-cols-2 lg:grid-cols-3"
        enter-active-class="transition-[opacity,transform] duration-500 ease-[var(--ease-out-expo)]"
        enter-from-class="opacity-0 translate-y-3"
        leave-active-class="absolute transition-opacity duration-200"
        leave-to-class="opacity-0"
      >
        <li v-for="(item, i) in shown" :key="item.id">
          <button
            type="button"
            class="group block w-full text-left"
            @click="lightboxIndex = i"
          >
            <div class="relative aspect-4/3 overflow-hidden bg-shell">
              <NuxtImg
                :src="item.image"
                :alt="item.imageAlt"
                preset="card"
                loading="lazy"
                fetchpriority="low"
                :sizes="sizesThird"
                width="900"
                height="675"
                class="size-full object-cover transition-transform duration-[1.1s] ease-[var(--ease-out-expo)] group-hover:scale-[1.05]"
              />
              <!-- Voile + loupe : signale que la vignette est cliquable. -->
              <span
                class="pointer-events-none absolute inset-0 flex items-center justify-center bg-ink/0 opacity-0 transition-[background-color,opacity] duration-500 group-hover:bg-ink/35 group-hover:opacity-100 group-focus-visible:bg-ink/35 group-focus-visible:opacity-100"
              >
                <span class="flex size-12 items-center justify-center rounded-full border border-white/70 text-white">
                  <svg viewBox="0 0 24 24" class="size-5" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true">
                    <circle cx="11" cy="11" r="6" />
                    <path d="m15.5 15.5 4 4" stroke-linecap="round" />
                  </svg>
                </span>
              </span>
            </div>

            <div class="flex items-baseline justify-between gap-3.5 pt-4">
              <span class="text-[0.9375rem] text-ink">{{ item.title }}</span>
              <span
                v-if="item.location"
                class="shrink-0 text-[0.6875rem] uppercase tracking-[0.18em] text-ink-mute"
              >
                {{ item.location }}
              </span>
            </div>
          </button>
        </li>
      </TransitionGroup>

      <div v-if="!visible.length" class="border border-ink/12 bg-sand p-12 text-center">
        <p class="text-[0.9375rem]">
          Aucune réalisation dans cette catégorie pour le moment.
        </p>
        <UiButton variant="ghost" class="mt-6" @click="setFilter('all')">
          Voir tout
        </UiButton>
      </div>

      <div v-if="remaining > 0" class="mt-[clamp(2rem,4vw,3.5rem)] flex justify-center">
        <UiButton variant="ghost" @click="showMore">
          Voir {{ Math.min(remaining, BATCH) }} réalisation{{ Math.min(remaining, BATCH) > 1 ? 's' : '' }} de plus
        </UiButton>
      </div>

      <div class="mt-[clamp(2.5rem,5vw,4.5rem)] flex justify-center">
        <UiButton to="/contact" size="lg">Un projet similaire ? Parlons-en</UiButton>
      </div>
    </section>

    <GalleryLightbox
      :items="visible"
      :index="lightboxIndex"
      @close="lightboxIndex = null"
      @navigate="lightboxIndex = $event"
    />

    <SharedCtaBanner />
  </div>
</template>
