<script setup lang="ts">
import type { BranchSlug, DomainSlug, GalleryCategory } from '#shared/types'

const { t } = useI18n()

/**
 * Galerie filtrable.
 *
 * Trois écarts avec la maquette :
 *  - le filtre vit dans l'URL (`?filtre=mariage`) : partageable et indexable ;
 *  - les vignettes masquées sont retirées du DOM plutôt que cachées en CSS,
 *    donc plus d'images invisibles à charger ni de pièges au clavier ;
 *  - chaque vignette ouvre une visionneuse plein écran.
 *
 * Trois filtres coexistent, tous dans l'URL : `?filtre=` par catégorie de
 * réception, `?branche=` et `?domaine=` par métier. Les deux familles
 * **s'excluent** — croiser « Mariages » et « Matériel informatique » ne
 * donnerait jamais rien, et un cul-de-sac se contourne mal. Choisir dans l'une
 * efface donc l'autre.
 */
const route = useRoute()
const router = useRouter()
const { data } = await useSiteContent()

/** Les valeurs restent les catégories de la base ; seuls les libellés changent. */
const filters = computed(() =>
  GALLERY_FILTERS.map(filter => ({ ...filter, label: t(`gallery.filters.${filter.value}`) })),
)
/** Les valeurs valides ne dépendent pas de la langue : elles viennent des données. */
const VALID = GALLERY_FILTERS.map(f => f.value) as readonly string[]

const activeFilter = computed<string>(() => {
  const raw = route.query.filtre
  const value = Array.isArray(raw) ? raw[0] : raw
  return typeof value === 'string' && VALID.includes(value) ? value : 'all'
})

function setFilter(value: string) {
  const query = { ...route.query }
  if (value === 'all') delete query.filtre
  else query.filtre = value
  // Les deux familles de filtre s'excluent.
  delete query.branche
  delete query.domaine
  router.replace({ query })
}

/**
 * Filtre métier, lu dans l'URL comme le filtre par catégorie. Une valeur
 * inconnue est ignorée plutôt que de vider la galerie : un lien mal recopié
 * doit ramener le visiteur au catalogue complet, pas à un écran vide.
 */
const activeBranch = computed<BranchSlug | null>(() => {
  const raw = route.query.branche
  const value = Array.isArray(raw) ? raw[0] : raw
  const connue = data.value.branches.some(b => b.slug === value)
  return connue ? (value as BranchSlug) : null
})

const activeDomain = computed<DomainSlug | null>(() => {
  const raw = route.query.domaine
  const value = Array.isArray(raw) ? raw[0] : raw
  const domaine = data.value.domains.find(d => d.slug === value)
  // Un domaine n'a de sens que dans sa branche : le préciser sans elle, ou
  // avec une autre, ne décrit rien.
  const coherent = domaine && (!activeBranch.value || domaine.branch === activeBranch.value)
  return coherent ? (value as DomainSlug) : null
})

/** Intitulés du filtre métier actif, pour le bandeau au-dessus de la grille. */
const activeSector = computed(() => {
  if (!activeBranch.value) return null
  const branche = data.value.branches.find(b => b.slug === activeBranch.value)
  const domaine = data.value.domains.find(d => d.slug === activeDomain.value)
  return branche ? { branche, domaine: domaine ?? null } : null
})

const visible = computed(() => {
  if (activeBranch.value) {
    return data.value.gallery.filter(i =>
      i.branch === activeBranch.value
      && (!activeDomain.value || i.domain === activeDomain.value),
    )
  }
  return activeFilter.value === 'all'
    ? data.value.gallery
    : data.value.gallery.filter(i => i.category === (activeFilter.value as GalleryCategory))
})

/** Retire le filtre métier et revient au catalogue complet. */
function clearSector() {
  const query = { ...route.query }
  delete query.branche
  delete query.domaine
  router.replace({ query })
}

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
watch([activeFilter, activeBranch, activeDomain], () => {
  lightboxIndex.value = null
  shownCount.value = BATCH
})

/**
 * Un filtre choisi en bas de page change la grille située au-dessus : sans ce
 * défilement, le visiteur reste devant les secteurs et croit qu'il ne s'est
 * rien passé. On ne le déclenche qu'à la navigation, jamais au premier rendu.
 */
watch([activeBranch, activeDomain], ([branche], [brancheAvant]) => {
  if (!import.meta.client || (!branche && !brancheAvant)) return
  nextTick(() => grid.value?.scrollIntoView({ behavior: 'smooth', block: 'start' }))
})

function chipClass(isActive: boolean) {
  return isActive
    ? 'bg-ink border-ink text-white'
    : 'bg-transparent border-ink/18 text-ink-soft hover:border-gold hover:text-gold'
}

usePageSeo({
  title: t('seo.gallery.title'),
  description: t('seo.gallery.description'),
  path: '/galerie',
  image: '/og-galerie.jpg',
})

useBreadcrumbSchema([{ name: 'Galerie', path: '/galerie' }])

const sizesThird = SIZES_THIRD

/**
 * Planche-contact de l'en-tête : une réalisation par famille, dans l'ordre des
 * filtres posés juste en dessous. Le visiteur voit ce qu'il va pouvoir trier.
 */
const HERO_MEDIA = [
  { src: '/images/galerie-mariage-adjovi.jpg', subject: 'Mariage — salle dressée' },
  { src: '/images/galerie-ceremonie-officielle.jpg', subject: 'Cérémonie officielle' },
  { src: '/images/galerie-diner-gala.jpg', subject: 'Dîner de gala — entreprise' },
  { src: '/images/galerie-verrerie.jpg', subject: 'Verrerie — décor & détails' },
]
</script>

<template>
  <div>
    <UiPageHero
      :eyebrow="$t('gallery.eyebrow')"
      :title="$t('gallery.title')"
      :accent="$t('gallery.accent')"
      :lead="$t('gallery.lead')"
      :media="HERO_MEDIA"
    >
      <div class="mt-[clamp(1.75rem,4vw,3rem)] flex flex-wrap gap-2.5">
        <button
          v-for="filter in filters"
          :key="filter.value"
          type="button"
          :aria-pressed="!activeSector && activeFilter === filter.value"
          class="rounded-full border px-5 py-2.5 text-[0.6875rem] uppercase tracking-[0.16em] transition-colors duration-400"
          :class="chipClass(!activeSector && activeFilter === filter.value)"
          @click="setFilter(filter.value)"
        >
          {{ filter.label }}
        </button>
      </div>
    </UiPageHero>

    <section ref="grid" class="u-gutter u-section bg-white">
      <!--
        Filtre métier actif. Sans ce rappel, un visiteur arrivé par un lien
        filtré croit que la galerie entière tient en trois photos.
      -->
      <div
        v-if="activeSector"
        class="mb-8 flex flex-wrap items-center justify-between gap-x-6 gap-y-3 border-l-2 bg-sand px-5 py-4"
        :style="{ borderColor: activeSector.branche.color }"
      >
        <p class="text-[0.9375rem] text-ink">
          {{ activeSector.domaine
            ? $t('gallery.sectorFilterDomain', { sector: activeSector.branche.name, domain: activeSector.domaine.title })
            : $t('gallery.sectorFilter', { sector: activeSector.branche.name }) }}
        </p>
        <button
          type="button"
          class="inline-flex min-h-11 items-center gap-2 text-[0.6875rem] uppercase tracking-[0.16em] text-ink-soft transition-colors duration-400 hover:text-gold"
          @click="clearSector"
        >
          {{ $t('gallery.clearFilter') }}
          <svg viewBox="0 0 24 24" class="size-3.5" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true">
            <path d="M6 6l12 12M18 6L6 18" stroke-linecap="round" />
          </svg>
        </button>
      </div>

      <!-- Compteur : l'utilisateur voit immédiatement l'effet du filtre. -->
      <p class="mb-8 text-[0.6875rem] uppercase tracking-[0.2em] text-ink-mute" aria-live="polite">
        <template v-if="remaining > 0">
          {{ shown.length }} sur {{ visible.length }} réalisations
        </template>
        <template v-else>
          {{ visible.length }} réalisation{{ visible.length > 1 ? 's' : '' }}
        </template>
      </p>

      <!--
        Écran vide. La photothèque ne couvre pas encore tous les domaines — la
        branche Études n'a aucune réalisation publiée. Un « 0 résultat » sec se
        lirait comme une panne : on dit ce qui manque, et on propose la suite.
      -->
      <div
        v-if="!visible.length"
        class="border border-ink/12 bg-sand px-[clamp(1.25rem,3vw,2.5rem)] py-[clamp(2rem,4vw,3.5rem)]"
      >
        <h3 class="max-w-[28ch] text-h3">
          {{ activeSector ? $t('gallery.emptyTitle') : $t('gallery.emptyCategory') }}
        </h3>
        <p class="mt-4 max-w-[58ch] text-[0.9375rem] leading-[1.75] text-ink-soft">
          {{ $t('gallery.emptyBody') }}
        </p>
        <div class="mt-8 flex flex-wrap items-center gap-4">
          <UiButton :to="{ path: '/contact', query: { branche: activeBranch ?? undefined } }" size="lg">
            {{ $t('gallery.emptyCta') }}
          </UiButton>
          <UiButton variant="ghost" @click="activeSector ? clearSector() : setFilter('all')">
            {{ $t('gallery.clearFilter') }}
          </UiButton>
        </div>
      </div>

      <TransitionGroup
        v-else
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

      <div v-if="remaining > 0" class="mt-[clamp(2rem,4vw,3.5rem)] flex justify-center">
        <UiButton variant="ghost" @click="showMore">
          Voir {{ Math.min(remaining, BATCH) }} réalisation{{ Math.min(remaining, BATCH) > 1 ? 's' : '' }} de plus
        </UiButton>
      </div>

      <div class="mt-[clamp(2.5rem,5vw,4.5rem)] flex justify-center">
        <UiButton to="/contact" size="lg">{{ $t('gallery.similar') }}</UiButton>
      </div>
    </section>

    <!-- Les vignettes montrent des réceptions ; l'accordéon rappelle que la
         même société couvre trois autres secteurs. Il ferme la page côté
         « qui fait quoi », avant l'appel au devis. -->
    <GallerySectors :branches="data.branches" :domains="data.domains" />

    <GalleryLightbox
      :items="visible"
      :index="lightboxIndex"
      @close="lightboxIndex = null"
      @navigate="lightboxIndex = $event"
    />

    <SharedCtaBanner />
  </div>
</template>
