<script setup lang="ts">
/**
 * Sommaire de la rubrique Conseils — `proposition-conseils.png`.
 *
 * Le site n'avait aucune surface d'entrée au-delà des requêtes de marque :
 * six pages statiques se positionnent sur « TBS Distribution » et guère plus.
 * Les requêtes qui rapportent sont longues et précises — « combien de chaises
 * pour 300 invités », « prix location vaisselle mariage Lomé » — et se
 * captent avec du contenu, pas avec une page de services.
 *
 * Trois choses changent avec la maquette :
 *
 *  - **des filtres par thème**, dans le bandeau, avec leurs effectifs
 *    comptés sur les articles publiés, et l'état dans l'URL (`?theme=`) ;
 *  - **l'article phare** garde sa place de tête mais son badge « Avec
 *    calculateur » suit une propriété de l'article, pas le seul fait d'être
 *    à la une — un futur article phare sans calculateur ne le portera pas ;
 *  - **un encart** en fin de liste, pour qui cherche un repère absent.
 *
 * Titres, résumés, dates et durées ne bougent pas.
 */
const route = useRoute()
const router = useRouter()
const { t } = useI18n()

/** Collection, préfixe, libellés de thème et format de date — cf. le composable. */
const { collection, libelleTheme, dateLisible } = useConseils()

const { data: articles } = await useAsyncData(
  () => `conseils-${collection.value}`,
  () => queryCollection(collection.value).order('publishedAt', 'DESC').all(),
  { watch: [collection] },
)

// ── Filtres par thème ───────────────────────────────────────────────────────

/**
 * Le thème en URL est un slug ; la catégorie de l'article est une clé de
 * données, en français dans les deux langues. La table tient les deux, dans
 * l'ordre d'affichage, et `libelleTheme` la traduit au rendu.
 */
const THEMES = THEMES_CONSEILS

/** Effectif par thème, compté ; un thème sans article ne s'affiche pas. */
const effectifs = computed(() => effectifsPar(articles.value ?? [], a => a.category))

const filtres = computed(() =>
  THEMES
    .map(theme => ({
      ...theme,
      libelle: libelleTheme(theme.category),
      count: effectifs.value[theme.category] ?? 0,
    }))
    .filter(theme => theme.count > 0),
)

const themeActif = computed(() => {
  const brut = route.query.theme
  const valeur = Array.isArray(brut) ? brut[0] : brut
  return filtres.value.find(t => t.slug === valeur) ?? null
})

function setTheme(slug: string | null) {
  const query = { ...route.query }
  if (slug) query.theme = slug
  else delete query.theme
  router.replace({ query })
}

const visibles = computed(() =>
  themeActif.value
    ? (articles.value ?? []).filter(a => a.category === themeActif.value!.category)
    : (articles.value ?? []),
)

const aLaUne = computed(() => visibles.value.find(article => article.featured))
const autres = computed(() => visibles.value.filter(article => article.path !== aLaUne.value?.path))

const sizesHalf = SIZES_HALF_MD
const sizesThird = SIZES_THIRD_MD
const info = useSiteInfo()

usePageSeo({
  title: t('advice.seoTitle'),
  description: t('advice.seoDescription'),
  path: '/conseils',
})

useBreadcrumbSchema([{ name: t('advice.eyebrow'), path: '/conseils' }])
</script>

<template>
  <div>
    <UiPageHero
      :eyebrow="$t('advice.eyebrow')"
      :title="$t('advice.title')"
      :accent="$t('advice.accent')"
      :lead="$t('advice.lead')"
      image="/images/galerie-seminaire.jpg"
      :height="340"
    >
      <!-- Les thèmes, avec leurs effectifs. Sous `md`, une ligne défilante. -->
      <div class="flex gap-2 max-md:-mx-[var(--spacing-gutter)] max-md:snap-x max-md:overflow-x-auto max-md:px-[var(--spacing-gutter)] max-md:pb-1 md:flex-wrap">
        <button
          type="button"
          :aria-pressed="!themeActif"
          class="inline-flex min-h-11 shrink-0 snap-start items-center gap-1.5 whitespace-nowrap rounded-full border px-[1.125rem] py-2.5 text-[0.6875rem] uppercase tracking-[0.16em] transition-colors duration-400 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
          :class="!themeActif ? 'border-white bg-white text-ink' : 'border-white/40 text-white hover:border-white'"
          @click="setTheme(null)"
        >
          {{ $t('advice.all') }} <span class="font-normal opacity-60">{{ (articles ?? []).length }}</span>
        </button>
        <button
          v-for="filtre in filtres"
          :key="filtre.slug"
          type="button"
          :aria-pressed="themeActif?.slug === filtre.slug"
          class="inline-flex min-h-11 shrink-0 snap-start items-center gap-1.5 whitespace-nowrap rounded-full border px-[1.125rem] py-2.5 text-[0.6875rem] uppercase tracking-[0.16em] transition-colors duration-400 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
          :class="themeActif?.slug === filtre.slug ? 'border-white bg-white text-ink' : 'border-white/40 text-white hover:border-white'"
          @click="setTheme(filtre.slug)"
        >
          {{ filtre.libelle }} <span class="font-normal opacity-60">{{ filtre.count }}</span>
        </button>
      </div>
    </UiPageHero>

    <section class="u-gutter bg-sand pb-[clamp(3rem,6vw,4.5rem)] pt-14">
      <!-- ── Article phare ─────────────────────────────────────────────── -->
      <article
        v-if="aLaUne"
        v-reveal
        class="grid items-center gap-x-11 gap-y-6 border border-ink/12 bg-white lg:grid-cols-[1.15fr_1fr]"
      >
        <NuxtLink :to="aLaUne.path" class="group block overflow-hidden bg-shell max-lg:aspect-video lg:h-full">
          <NuxtImg
            :src="aLaUne.image"
            :alt="aLaUne.imageAlt"
            preset="card"
            :sizes="sizesHalf"
            width="1400"
            height="875"
            class="size-full object-cover transition-transform duration-[1.4s] ease-[var(--ease-out-expo)] group-hover:scale-[1.03] lg:aspect-[16/10]"
          />
        </NuxtLink>

        <div class="px-6 pb-8 lg:py-[2.375rem] lg:pl-0 lg:pr-10">
          <!-- Le badge suit la donnée, pas la place à la une. -->
          <span
            v-if="aLaUne.calculator"
            class="mb-3.5 inline-block bg-ink px-2.5 py-1.5 text-[0.625rem] uppercase tracking-[0.18em] text-white max-lg:text-xs max-lg:tracking-[0.14em]"
          >
            {{ $t('advice.withCalculator') }}
          </span>
          <p class="text-[0.65625rem] uppercase tracking-[0.18em] text-ink-mute max-lg:text-xs max-lg:tracking-[0.14em]">
            {{ libelleTheme(aLaUne.category) }} · <time :datetime="aLaUne.publishedAt">{{ dateLisible(aLaUne.publishedAt) }}</time>
            · {{ $t('advice.readingTime', { n: aLaUne.readingTime }) }}
          </p>
          <h2 class="mt-2.5 max-w-[22ch] font-display text-[clamp(1.75rem,3vw,2.375rem)] leading-[1.15] text-ink">
            <NuxtLink :to="aLaUne.path" class="transition-colors duration-500 hover:text-gold">{{ aLaUne.title }}</NuxtLink>
          </h2>
          <p class="mb-[1.125rem] mt-3.5 max-w-[54ch] text-[0.9375rem] leading-[1.7] text-ink-soft">
            {{ aLaUne.description }}
          </p>
          <UiButton :to="aLaUne.path">{{ aLaUne.calculator ? $t('advice.readAndCalculate') : $t('advice.read') }}</UiButton>
        </div>
      </article>

      <!-- ── Les autres, en cartes de même hauteur ─────────────────────── -->
      <ul v-if="autres.length" class="mt-10 grid gap-x-7 gap-y-9 md:grid-cols-2 lg:grid-cols-3">
        <li v-for="(article, i) in autres" :key="article.path" v-reveal="i * 60" class="flex">
          <article class="group flex w-full flex-col">
            <NuxtLink :to="article.path" class="block overflow-hidden bg-shell">
              <NuxtImg
                :src="article.image"
                :alt="article.imageAlt"
                preset="card"
                loading="lazy"
                :sizes="sizesThird"
                width="1400"
                height="1050"
                class="aspect-4/3 w-full object-cover transition-transform duration-[1.4s] ease-[var(--ease-out-expo)] group-hover:scale-[1.03]"
              />
            </NuxtLink>
            <p class="mb-1.5 mt-3.5 flex flex-wrap justify-between gap-x-3 text-[0.625rem] uppercase tracking-[0.18em] text-ink-mute max-lg:text-xs max-lg:tracking-[0.14em]">
              <span class="text-gold">{{ libelleTheme(article.category) }}</span>
              <span><time :datetime="article.publishedAt">{{ dateLisible(article.publishedAt) }}</time> · {{ $t('advice.readingTimeShort', { n: article.readingTime }) }}</span>
            </p>
            <h3 class="font-display text-[1.4375rem] leading-[1.2] text-ink">
              <NuxtLink :to="article.path" class="inline-block transition-colors duration-500 group-hover:text-gold max-lg:py-2.5">
                {{ article.shortTitle ?? article.title }}
              </NuxtLink>
            </h3>
            <p class="mb-3 mt-2 flex-1 text-[0.84375rem] leading-[1.6] text-ink-soft">{{ article.description }}</p>
            <NuxtLink :to="article.path" class="u-link-underline self-start">
              {{ $t('advice.read') }}<span class="sr-only"> — {{ article.shortTitle ?? article.title }}</span>
            </NuxtLink>
          </article>
        </li>
      </ul>

      <p v-else-if="!aLaUne" class="mt-10 text-[0.9375rem] text-ink-soft">
        {{ $t('advice.empty') }}
      </p>

      <!-- ── Une porte d'entrée vers la question ───────────────────────── -->
      <div
        v-reveal
        class="mt-14 flex flex-wrap items-center justify-between gap-5 border border-ink/12 bg-sand px-[1.625rem] py-[1.625rem]"
      >
        <div class="min-w-0">
          <h2 class="font-display text-[1.625rem] leading-[1.2] text-ink">{{ $t('advice.askTitle') }}</h2>
          <p class="mt-1.5 text-sm text-ink-soft">{{ $t('advice.askText') }}</p>
        </div>
        <div class="flex flex-wrap gap-3">
          <a
            :href="info.whatsappUrl"
            target="_blank"
            rel="noopener"
            class="inline-flex min-h-11 items-center gap-2.5 bg-[#25d366] px-[1.375rem] py-3.5 text-[0.6875rem] uppercase tracking-[0.18em] text-white transition-opacity duration-400 hover:opacity-90"
          >
            {{ $t('common.whatsapp') }}
          </a>
          <UiButton to="/contact" variant="ghost">{{ $t('common.writeUs') }}</UiButton>
        </div>
      </div>
    </section>

    <SharedCtaBanner />
  </div>
</template>
