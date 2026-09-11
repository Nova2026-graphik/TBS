<script setup lang="ts">
import type { DomainSlug } from '#shared/types'

/**
 * Page produits d'un domaine.
 *
 * Le clic sur un domaine ne changeait pas de page : l'URL prenait
 * `?branche=…&domaine=…` et une liste s'ajoutait **sous** la galerie, après
 * les photographies. Trois conséquences, toutes visibles : la liste était
 * hors de vue au premier écran, elle n'était pas indexable comme page
 * distincte, et Events, Études et Agro n'en avaient aucune. Chaque domaine a
 * désormais son adresse — `/galerie/<branche>/<domaine>` — donc son titre,
 * sa méta-description et son entrée au sitemap.
 *
 * La page reste un catalogue de **fourniture**, pas de vente : aucun prix,
 * aucun panier, aucun stock. Tout mène au devis, comme le reste du site.
 */
const route = useRoute()
const router = useRouter()
const { t } = useI18n()
const { data } = await useSiteContent()

const brancheParam = computed(() => String(route.params.branche ?? ''))
const domaineParam = computed(() => String(route.params.domaine ?? ''))

const branch = computed(() => data.value.branches.find(b => b.slug === brancheParam.value) ?? null)
const domain = computed(() => data.value.domains.find(d => d.slug === domaineParam.value) ?? null)

/**
 * Une URL qui ne désigne rien renvoie 404, et non une page vide.
 *
 * Le couple compte autant que ses moitiés : `/galerie/events/informatique`
 * nomme deux choses réelles mais pas un domaine d'Events. Le laisser passer
 * donnerait deux adresses pour la même page, et une page qui se contredit.
 */
if (!branch.value || !domain.value || domain.value.branch !== branch.value.slug) {
  throw createError({ statusCode: 404, statusMessage: 'Domaine introuvable', fatal: true })
}

const domaine = computed(() => domain.value!)
const branche = computed(() => branch.value!)

const references = computed(() =>
  // `?? []` : la réponse de `/api/site-content` survit à un déploiement, et
  // peut donc dater d'une version où ce champ n'existait pas encore.
  (data.value.equipment ?? []).filter(e => e.domain === domaineParam.value),
)

/** Rang du domaine dans sa branche — « Domaine 01 / 13 ». */
const freres = computed(() => data.value.domains.filter(d => d.branch === branche.value.slug))
const rang = computed(() => freres.value.findIndex(d => d.slug === domaineParam.value) + 1)

// ── Filtre par famille ──────────────────────────────────────────────────────

/**
 * La famille vit dans l'URL, comme les filtres de la galerie : un lien vers
 * « les sièges du mobilier de bureau » se partage, et le retour arrière
 * revient au filtre précédent plutôt qu'à la page d'accueil du domaine.
 */
const familles = computed(() => domaine.value.families ?? [])

const familleActive = computed(() => {
  const brut = route.query.famille
  const valeur = Array.isArray(brut) ? brut[0] : brut
  return typeof valeur === 'string' && familles.value.includes(valeur) ? valeur : null
})

function setFamille(valeur: string | null) {
  const query = { ...route.query }
  if (valeur) query.famille = valeur
  else delete query.famille
  delete query.page
  router.replace({ query })
}

const filtrees = computed(() =>
  familleActive.value
    ? references.value.filter(r => r.family === familleActive.value)
    : references.value,
)

// ── Pagination ──────────────────────────────────────────────────────────────

/**
 * Douze par page. Le domaine le plus fourni en compte quarante-huit : tout
 * afficher d'un coup, ce sont quarante-huit visuels à charger sur une
 * connexion togolaise, pour une page qu'on parcourt rarement en entier.
 */
const PAR_PAGE = 12

const pages = computed(() => Math.max(1, Math.ceil(filtrees.value.length / PAR_PAGE)))

const page = computed(() => {
  const brut = Number(Array.isArray(route.query.page) ? route.query.page[0] : route.query.page)
  // Une page hors bornes ramène à la première : un lien mal recopié doit
  // rendre le catalogue, pas un écran vide.
  return Number.isInteger(brut) && brut >= 1 && brut <= pages.value ? brut : 1
})

const affichees = computed(() =>
  filtrees.value.slice((page.value - 1) * PAR_PAGE, page.value * PAR_PAGE),
)

const grille = useTemplateRef<HTMLElement>('grille')

function setPage(valeur: number) {
  const query = { ...route.query }
  if (valeur > 1) query.page = String(valeur)
  else delete query.page
  router.replace({ query })
  // Sans ce retour en haut, changer de page laisse le visiteur devant la
  // pagination, face à des produits qu'il n'a pas vus défiler.
  nextTick(() => grille.value?.scrollIntoView({ behavior: 'smooth', block: 'start' }))
}

// ── Fiche rapide ────────────────────────────────────────────────────────────

/** L'index porte sur les références **filtrées** : les flèches suivent l'écran. */
const ficheIndex = ref<number | null>(null)

watch([familleActive, page, domaineParam], () => {
  ficheIndex.value = null
})

// ── Réalisations du domaine ─────────────────────────────────────────────────

const realisations = computed(() =>
  data.value.gallery.filter(i => i.domain === domaineParam.value),
)

// ── Référencement ───────────────────────────────────────────────────────────

const chemin = computed(() => `/galerie/${brancheParam.value}/${domaineParam.value}`)

usePageSeo({
  title: t('domain.seo.title', { domain: domaine.value.title, branch: branche.value.name }),
  description: domaine.value.intro ?? domaine.value.description,
  path: chemin.value,
  image: domaine.value.image ?? '/og-galerie.jpg',
})

useBreadcrumbSchema([
  { name: t('nav.gallery'), path: '/galerie' },
  { name: domaine.value.title, path: chemin.value },
])

const sizesThird = SIZES_THIRD
</script>

<template>
  <div>
    <DomainHero
      :domain="domaine"
      :branch="branche"
      :total="references.length"
      :rank="rang"
      :siblings="freres.length"
    />

    <div class="u-gutter grid gap-x-10 gap-y-8 pb-[clamp(3rem,7vw,6rem)] pt-[clamp(1.5rem,4vw,3rem)] lg:grid-cols-[16rem_1fr]">
      <DomainNav
        :branches="data.branches"
        :domains="data.domains"
        :references="data.equipment ?? []"
        :active="(domaineParam as DomainSlug)"
        :branch="branche"
      />

      <div class="min-w-0">
        <p class="max-w-[62ch] text-[1.0625rem] leading-[1.75] text-ink-soft">
          {{ domaine.intro ?? domaine.description }}
        </p>

        <!--
          Les références d'exemple sont signalées. Les annoncer comme un
          catalogue arrêté ferait promettre à TBS ce qu'elle n'a pas encore
          arbitré ; le dire coûte un encart.
        -->
        <p
          v-if="domaine.exampleNote"
          class="mt-5 max-w-[62ch] border-l-2 border-gold/40 bg-sand px-4 py-3 text-[0.8125rem] leading-[1.65] text-ink-soft"
        >
          {{ domaine.exampleNote }}
        </p>

        <!-- ── Filtres par famille ───────────────────────────────────── -->
        <div v-if="familles.length" class="mt-9 flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            class="min-h-11 border px-4 py-2 text-[0.6875rem] uppercase tracking-[0.12em] transition-colors duration-400"
            :class="familleActive === null
              ? 'border-ink bg-ink text-white'
              : 'border-ink/18 text-ink-soft hover:border-gold hover:text-gold'"
            :aria-pressed="familleActive === null"
            @click="setFamille(null)"
          >
            {{ $t('domain.filters.all') }}
          </button>
          <button
            v-for="famille in familles"
            :key="famille"
            type="button"
            class="min-h-11 border px-4 py-2 text-[0.6875rem] uppercase tracking-[0.12em] transition-colors duration-400"
            :class="familleActive === famille
              ? 'border-ink bg-ink text-white'
              : 'border-ink/18 text-ink-soft hover:border-gold hover:text-gold'"
            :aria-pressed="familleActive === famille"
            @click="setFamille(famille)"
          >
            {{ famille }}
          </button>
        </div>

        <p class="mt-6 text-[0.6875rem] uppercase tracking-[0.2em] text-ink-mute" aria-live="polite">
          {{ $t('domain.grid.count', { n: filtrees.length }, filtrees.length) }}
          <template v-if="pages > 1">
            · {{ $t('domain.grid.page', { i: page, n: pages }) }}
          </template>
        </p>

        <!-- ── Grille ───────────────────────────────────────────────── -->
        <ul
          ref="grille"
          class="mt-7 grid scroll-mt-28 grid-cols-2 gap-x-6 gap-y-10 md:grid-cols-3 lg:grid-cols-4"
        >
          <li v-for="(reference, i) in affichees" :key="`${reference.domain}-${reference.name}`">
            <DomainCard
              :reference="reference"
              :thumbnail="domaine.thumbnail"
              :medallion="domaine.medallion"
              :index="i"
              @open="ficheIndex = (page - 1) * PAR_PAGE + i"
            />
          </li>
        </ul>

        <!-- ── Pagination ───────────────────────────────────────────── -->
        <nav
          v-if="pages > 1"
          class="mt-12 flex flex-wrap items-center gap-2"
          :aria-label="$t('domain.grid.paginationLabel')"
        >
          <button
            v-for="n in pages"
            :key="n"
            type="button"
            class="flex size-11 items-center justify-center border text-[0.8125rem] transition-colors duration-400"
            :class="n === page
              ? 'border-ink bg-ink text-white'
              : 'border-ink/18 text-ink-soft hover:border-gold hover:text-gold'"
            :aria-current="n === page ? 'page' : undefined"
            @click="setPage(n)"
          >
            {{ n }}
          </button>
          <button
            v-if="page < pages"
            type="button"
            class="flex size-11 items-center justify-center border border-ink/18 text-ink-soft transition-colors duration-400 hover:border-gold hover:text-gold"
            :aria-label="$t('domain.grid.nextPage')"
            @click="setPage(page + 1)"
          >
            <span aria-hidden="true">→</span>
          </button>
        </nav>

        <p class="mt-10 max-w-[62ch] text-sm leading-[1.7] text-ink-soft">
          {{ $t('gallery.equipmentLead') }}
        </p>

        <!-- ── Réalisations du domaine ──────────────────────────────── -->
        <section class="mt-14 border-t border-ink/10 pt-9">
          <h2 class="text-[0.6875rem] uppercase tracking-[0.2em] text-ink-mute">
            {{ $t('domain.works.title') }}
          </h2>

          <ul v-if="realisations.length" class="mt-6 grid gap-x-6 gap-y-8 sm:grid-cols-2 lg:grid-cols-3">
            <li v-for="item in realisations" :key="item.id">
              <NuxtImg
                :src="item.image"
                :alt="item.imageAlt"
                preset="card"
                loading="lazy"
                :sizes="sizesThird"
                width="800"
                height="600"
                class="aspect-4/3 w-full object-cover"
              />
              <p class="mt-3 font-display text-[1.0625rem] leading-[1.35] text-ink">
                {{ item.title }}
              </p>
              <p v-if="item.location" class="mt-1 text-[0.8125rem] text-ink-mute">
                {{ item.location }}
              </p>
            </li>
          </ul>

          <p v-else class="mt-4 max-w-[58ch] text-[0.9375rem] leading-[1.7] text-ink-soft">
            {{ $t('domain.works.empty') }}
          </p>
        </section>

        <div class="mt-12">
          <UiButton
            :to="{
              path: '/contact',
              query: {
                branche: branche.slug,
                message: $t('gallery.equipmentQuoteIntro', { domain: domaine.title }),
              },
            }"
            size="lg"
          >
            {{ $t('gallery.emptyCta') }}
          </UiButton>
        </div>
      </div>
    </div>

    <DomainQuickView
      :references="filtrees"
      :index="ficheIndex"
      :domain="domaine"
      @close="ficheIndex = null"
      @navigate="ficheIndex = $event"
    />
  </div>
</template>
