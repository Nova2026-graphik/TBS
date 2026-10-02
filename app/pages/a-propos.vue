<script setup lang="ts">
/**
 * À propos — `proposition-a-propos.png`.
 *
 * Ce qui change, et pourquoi :
 *
 *  - **les quatre branches du bandeau deviennent des liens.** Elles étaient
 *    de simples libellés : on lisait « TBS Agro Business » sans pouvoir y
 *    aller. Chacune mène à ses prestations ;
 *  - **les chiffres remontent à côté du récit.** Le bandeau de chiffres
 *    fermait la page, quatre écrans sous l'histoire qu'ils illustrent. Ils la
 *    jouxtent maintenant, en 2 × 2, et une frise en quatre temps la résume.
 *    Le bandeau du bas est **déplacé**, pas dupliqué ;
 *  - **les quatre branches passent sur une rangée**, avec leur photo. Elles
 *    étaient en 2 × 2 sans image, quatre blocs de texte qu'on ne distinguait
 *    qu'à leur numéro.
 *
 * Le seul compteur de la page — « 17 domaines couverts » — est calculé.
 */
const { t, tm, rt } = useI18n()
const { data } = await useSiteContent()

const sizesThird = SIZES_THIRD
const sizesHalfLg = SIZES_HALF_LG

/**
 * Détail par branche, affiché sous la photo. La structure — les quatre
 * branches, l'ordre, la numérotation — reste ici ; les libellés viennent
 * des fichiers de langue.
 */
const branchDetails = computed<Record<string, { label: string, value: string }[]>>(() =>
  Object.fromEntries(
    ['equipements', 'events', 'etudes', 'agro'].map(slug => [
      slug,
      (tm(`data.branchDetails.${slug}`) as unknown[]).map((entree) => {
        const paire = entree as unknown[]
        return { label: rt(paire[0] as string), value: rt(paire[1] as string) }
      }),
    ]),
  ),
)

const values = computed(() =>
  (tm('about.values') as unknown[]).map((entree, i) => {
    const paire = entree as unknown[]
    return {
      n: String(i + 1).padStart(2, '0'),
      title: rt(paire[0] as string),
      text: rt(paire[1] as string),
    }
  }),
)

const timeline = computed(() =>
  (tm('about.timeline') as unknown[]).map((entree) => {
    const paire = entree as unknown[]
    return { year: rt(paire[0] as string), text: rt(paire[1] as string) }
  }),
)

/**
 * Les quatre chiffres. Les valeurs viennent de `ABOUT_STATS`, la seule
 * source ; le sous-titre de « Branches » porte le nombre de domaines, compté.
 */
const stats = computed(() =>
  ABOUT_STATS.map((stat, i) => {
    const cle = (['created', 'events', 'branches', 'people'] as const)[i]!
    return {
      ...stat,
      label: t(`about.stats.${cle}.label`),
      sub: t(`about.stats.${cle}.sub`, { n: data.value.domains.length }),
    }
  }),
)

usePageSeo({
  title: t('seo.about.title'),
  description: t('seo.about.description'),
  path: '/a-propos',
  image: '/og-a-propos.jpg',
})

useBreadcrumbSchema([{ name: 'À propos', path: '/a-propos' }])
</script>

<template>
  <div>
    <UiPageHero
      :eyebrow="$t('about.eyebrowAbout')"
      :title="$t('about.titleLine')"
      :accent="$t('about.titleAccent')"
      :lead="$t('about.lead')"
      image="/images/apropos-equipe.jpg"
      :height="400"
    >
      <template #aside>
        <!--
          Les quatre branches, en liens. Elles étaient des libellés : on lisait
          « TBS Agro Business » sans pouvoir y aller.
        -->
        <ul class="flex flex-wrap gap-2.5 lg:justify-end">
          <li v-for="branch in data.branches" :key="branch.slug">
            <NuxtLinkLocale
              :to="`/services?branche=${versUrl(branch.slug)}`"
              class="flex min-h-12 items-center gap-2.5 border border-white/30 bg-white/[0.08] px-3.5 py-2.5 text-[0.6875rem] uppercase tracking-[0.16em] text-white transition-colors duration-400 hover:border-white hover:bg-white/20 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
            >
              <span
                aria-hidden="true"
                class="size-[7px] rounded-full"
                :style="{ background: branch.color.toLowerCase() === '#3e3524' ? 'var(--color-cream)' : brandColor(branch.color) }"
              />
              {{ branch.name }}
            </NuxtLinkLocale>
          </li>
        </ul>
      </template>
    </UiPageHero>

    <!-- ── Notre histoire + chiffres ──────────────────────────────────── -->
    <section class="u-gutter u-section bg-white">
      <div class="grid items-start gap-[clamp(2rem,4.5vw,3.75rem)] lg:grid-cols-[1.1fr_0.9fr]">
        <div v-reveal>
          <span class="u-eyebrow">
            <span class="u-rule" />
            {{ $t('about.historyEyebrow') }}
          </span>
          <h2 class="mb-[1.375rem] mt-3.5 text-h2">
            {{ $t('about.historyTitle') }}<br>
            <span class="italic">{{ $t('about.historyAccent') }}</span>
          </h2>
          <div class="max-w-[56ch] space-y-4 text-[0.96875rem] leading-[1.75] text-ink-soft">
            <p>{{ $t('about.p1') }}</p>
            <p>
              {{ $t('about.p2Intro') }}
              <strong class="font-normal text-ink">TBS {{ $t('topbar.branches.equipements') }}</strong> {{ $t('about.p2Equipements') }}
              <strong class="font-normal text-ink">TBS {{ $t('topbar.branches.events') }}</strong> {{ $t('about.p2Events') }}
              <strong class="font-normal text-ink">TBS {{ $t('topbar.branches.etudes') }}</strong> {{ $t('about.p2Etudes') }}
              <strong class="font-normal text-ink">TBS {{ $t('topbar.branches.agro') }}</strong> {{ $t('about.p2Agro') }}
            </p>
            <p>{{ $t('about.p3') }}</p>
          </div>
        </div>

        <!--
          Les quatre chiffres, en 2 × 2. Ils fermaient la page en bandeau,
          quatre écrans sous l'histoire qu'ils illustrent.
        -->
        <dl v-reveal="90" class="grid grid-cols-2 gap-px border border-ink/12 bg-ink/12">
          <div v-for="stat in stats" :key="stat.label" class="bg-white px-6 py-[1.625rem]">
            <dd class="font-display text-[2.5rem] leading-none text-ink">
              {{ stat.value }}<span v-if="stat.suffix" class="font-light text-peach-text">{{ stat.suffix }}</span>
            </dd>
            <dt class="mt-2.5 text-[0.65625rem] uppercase tracking-[0.2em] text-ink">{{ stat.label }}</dt>
            <p class="mt-1 text-[0.8125rem] text-ink-soft">{{ stat.sub }}</p>
          </div>
        </dl>
      </div>

      <!-- La frise : quatre temps, un filet accent à la tête de chacun. -->
      <ol class="mt-11 grid gap-6 border-t border-ink/15 sm:grid-cols-2 lg:grid-cols-4">
        <li v-for="(etape, i) in timeline" :key="etape.year" v-reveal="i * 70" class="relative pt-4 before:absolute before:-top-px before:left-0 before:h-0.5 before:w-11 before:bg-gold">
          <p class="font-display text-[1.375rem] text-ink">{{ etape.year }}</p>
          <p class="mt-1.5 text-[0.84375rem] leading-[1.55] text-ink-soft">{{ etape.text }}</p>
        </li>
      </ol>
    </section>

    <!-- ── Ce que fait chaque branche ─────────────────────────────────── -->
    <section class="u-gutter u-section bg-sand">
      <div class="mb-11 flex flex-wrap items-end justify-between gap-x-10 gap-y-4">
        <div>
          <span class="u-eyebrow"><span class="u-rule" />{{ $t('about.eyebrow') }}</span>
          <h2 class="mt-3.5 text-h2">
            {{ $t('about.title') }} <span class="italic">{{ $t('about.accent') }}</span>
          </h2>
        </div>
        <NuxtLinkLocale to="/services" class="u-link-underline">{{ $t('about.branchesLink') }}</NuxtLinkLocale>
      </div>

      <div class="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        <article
          v-for="(branch, i) in data.branches"
          :key="branch.slug"
          v-reveal="i * 70"
          class="flex flex-col border border-ink/12 bg-white pb-5"
        >
          <NuxtImg
            :src="branch.image"
            :alt="branch.imageAlt"
            preset="card"
            loading="lazy"
            :sizes="sizesThird"
            width="800"
            height="450"
            class="aspect-video w-full object-cover"
          />
          <div class="px-5 pt-[1.125rem]">
            <span class="u-eyebrow text-[0.625rem]">
              <span class="size-[7px] rounded-full" :style="{ background: brandColor(branch.color) }" />
              {{ $t('about.branchLabel', { index: String(branch.index).padStart(2, '0') }) }}
            </span>
            <h3 class="mt-1.5 font-display text-2xl text-ink">{{ branch.name }}</h3>
            <p class="mt-1 text-[0.625rem] uppercase tracking-[0.16em] text-gold max-lg:text-xs max-lg:tracking-[0.14em]">{{ branch.tagline }}</p>

            <dl class="mt-4 grid gap-[9px] text-[0.8125rem]">
              <div v-for="row in branchDetails[branch.slug]" :key="row.label">
                <dt class="text-[0.59375rem] uppercase tracking-[0.18em] text-ink-mute">{{ row.label }}</dt>
                <dd class="mt-0.5 leading-[1.5] text-ink-soft">{{ row.value }}</dd>
              </div>
            </dl>
          </div>

          <NuxtLinkLocale
            :to="`/services?branche=${versUrl(branch.slug)}`"
            class="u-link-underline mx-5 mt-auto self-start pt-[1.125rem]"
          >
            {{ $t('about.seePrestations') }}<span class="sr-only"> — {{ branch.name }}</span>
          </NuxtLinkLocale>
        </article>
      </div>
    </section>

    <!-- ── Trois engagements ──────────────────────────────────────────── -->
    <section class="u-gutter u-section grid items-center gap-[clamp(1.75rem,4vw,3.5rem)] bg-white lg:grid-cols-2">
      <div v-reveal class="relative aspect-4/3 overflow-hidden bg-shell">
        <NuxtImg
          src="/images/apropos-entrepot.jpg"
          :alt="$t('about.warehouseAlt')"
          preset="card"
          loading="lazy"
          :sizes="sizesHalfLg"
          width="1000"
          height="750"
          class="size-full object-cover"
        />
      </div>

      <div v-reveal="110">
        <span class="u-eyebrow">
          <span class="u-rule" />
          {{ $t('about.valuesEyebrow') }}
        </span>
        <h2 class="mt-4 max-w-[16ch] text-h2">
          {{ $t('about.valuesTitle') }} <span class="italic">{{ $t('about.valuesAccent') }}</span>
        </h2>

        <ol class="mt-7">
          <li v-for="value in values" :key="value.n" class="grid grid-cols-[3.5rem_1fr] gap-3 border-t border-ink/12 py-[1.125rem]">
            <span class="font-display text-[1.625rem] text-ink-mute">{{ value.n }}</span>
            <div>
              <h3 class="font-sans text-base font-normal text-ink">{{ value.title }}</h3>
              <p class="mt-1 max-w-[46ch] text-sm leading-[1.65] text-ink-soft">{{ value.text }}</p>
            </div>
          </li>
        </ol>
      </div>
    </section>

    <SharedCtaBanner />
  </div>
</template>
