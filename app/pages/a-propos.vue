<script setup lang="ts">
const { t, tm, rt } = useI18n()
const { data } = await useSiteContent()

const { aboutStats: stats } = useSiteData()
const sizesFull = SIZES_FULL
const densitiesFull = DENSITIES_FULL
const sizesHalfLg = SIZES_HALF_LG

/**
 * Détail par branche et valeurs, affichés sous l'histoire. La structure — les
 * quatre branches, l'ordre, la numérotation — reste ici ; les libellés
 * viennent des fichiers de langue.
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
    <!-- En-tête photo pleine largeur -->
    <section class="relative min-h-[24rem] overflow-hidden bg-ink" style="height: min(62svh, 40rem)">
      <NuxtImg
        src="/images/apropos-equipe.jpg"
        :alt="$t('about.heroAlt')"
        preset="hero"
        preload
        :sizes="sizesFull"
        :densities="densitiesFull"
        width="1920"
        height="1280"
        class="absolute inset-0 size-full object-cover"
      />
      <div class="u-scrim-page absolute inset-0" />

      <div class="u-gutter absolute inset-0 flex flex-col justify-end gap-6 pb-[clamp(2rem,5vw,4rem)]">
        <span class="u-eyebrow text-cream/75">
          <span class="u-rule" />
          {{ $t('about.eyebrowAbout') }}
        </span>
        <h1 class="text-h1 text-white">
          TBS Distribution <span class="italic text-cream">{{ $t('about.legalName') }}</span>
        </h1>
        <ul class="flex flex-wrap gap-x-6 gap-y-2">
          <li
            v-for="branch in data.branches"
            :key="branch.slug"
            class="flex items-center gap-2.5 text-[0.6875rem] uppercase tracking-[0.16em] text-white/70"
          >
            <!-- Études & Conseils est couleur d'encre : sur ce fond d'encre,
                 la pastille prend la crème pour rester visible. -->
            <span
              class="size-1.5 rounded-full"
              :style="{ background: branch.color.toLowerCase() === '#3e3524' ? 'var(--color-cream)' : brandColor(branch.color) }"
            />
            {{ branch.name }}
          </li>
        </ul>
      </div>
    </section>

    <!-- Notre histoire -->
    <section class="u-gutter u-section grid gap-[clamp(1.75rem,4vw,4.5rem)] bg-white lg:grid-cols-[18rem_1fr]">
      <div v-reveal>
        <span class="u-eyebrow">
          <span class="u-rule" />
          {{ $t('about.historyEyebrow') }}
        </span>
      </div>

      <div v-reveal="90" class="max-w-[68ch] space-y-6">
        <p class="font-display text-[clamp(1.375rem,2.6vw,2rem)] leading-[1.35] text-ink">
          {{ $t('about.lead') }}
        </p>
        <p class="text-[0.9375rem] leading-[1.8]">
          {{ $t('about.p1') }}
        </p>
        <p class="text-[0.9375rem] leading-[1.8]">
          {{ $t('about.p2Intro') }}
          <strong class="font-normal text-ink">TBS {{ $t('topbar.branches.equipements') }}</strong> {{ $t('about.p2Equipements') }}
          <strong class="font-normal text-ink">TBS {{ $t('topbar.branches.events') }}</strong> {{ $t('about.p2Events') }}
          <strong class="font-normal text-ink">TBS {{ $t('topbar.branches.etudes') }}</strong> {{ $t('about.p2Etudes') }}
          <strong class="font-normal text-ink">TBS {{ $t('topbar.branches.agro') }}</strong> {{ $t('about.p2Agro') }}
        </p>
        <p class="text-[0.9375rem] leading-[1.8]">
          {{ $t('about.p3') }}
        </p>
      </div>
    </section>

    <!-- Détail des quatre branches -->
    <section class="u-gutter u-section bg-sand">
      <UiSectionHead
        :eyebrow="$t('about.eyebrow')"
        :title="$t('about.title')"
        :accent="$t('about.accent')"
        align="start"
      />

      <div class="grid gap-px bg-ink/10 md:grid-cols-2">
        <article
          v-for="(branch, i) in data.branches"
          :key="branch.slug"
          v-reveal="(i % 2) * 70"
          class="flex flex-col bg-white p-[clamp(1.5rem,3vw,2.5rem)]"
        >
          <span class="u-eyebrow">
            <span class="size-[7px] rounded-full" :style="{ background: brandColor(branch.color) }" />
            Branche {{ String(branch.index).padStart(2, '0') }}
          </span>

          <h3 class="mt-3 text-h3">{{ branch.name }}</h3>
          <p class="mt-1.5 text-xs uppercase tracking-[0.1em] text-gold">{{ branch.tagline }}</p>

          <dl class="mt-7 flex-1 divide-y divide-ink/8 border-t border-ink/8">
            <div
              v-for="row in branchDetails[branch.slug]"
              :key="row.label"
              class="grid gap-1 py-3.5 sm:grid-cols-[8rem_1fr] sm:gap-4"
            >
              <dt class="text-[0.6875rem] uppercase tracking-[0.16em] text-ink-mute">
                {{ row.label }}
              </dt>
              <dd class="text-sm leading-[1.65]">{{ row.value }}</dd>
            </div>
          </dl>

          <NuxtLinkLocale :to="`/services?branche=${branch.slug}`" class="u-link-underline mt-8 self-start">
            Voir les prestations<span class="sr-only"> de {{ branch.name }}</span>
          </NuxtLinkLocale>
        </article>
      </div>
    </section>

    <!-- Valeurs -->
    <section class="u-gutter u-section grid items-center gap-[clamp(1.75rem,4vw,4.5rem)] bg-white lg:grid-cols-2">
      <div v-reveal class="relative aspect-4/5 overflow-hidden bg-shell">
        <NuxtImg
          src="/images/apropos-entrepot.jpg"
          :alt="$t('about.warehouseAlt')"
          preset="card"
          loading="lazy"
          :sizes="sizesHalfLg"
          width="1000"
          height="1250"
          class="size-full object-cover"
        />
      </div>

      <div v-reveal="110">
        <span class="u-eyebrow">
          <span class="u-rule" />
          {{ $t('about.valuesEyebrow') }}
        </span>
        <!-- Titre en deux clés plutôt qu'une : l'italique porte sur la fin de
             la phrase, et une concaténation casserait à la première langue
             dont l'ordre des mots diffère. -->
        <h2 class="mt-4 max-w-[16ch] text-h2">
          {{ $t('about.valuesTitle') }} <span class="italic">{{ $t('about.valuesAccent') }}</span>
        </h2>

        <ul class="mt-10 divide-y divide-ink/10 border-y border-ink/10">
          <li v-for="value in values" :key="value.n" class="flex gap-6 py-6">
            <span class="font-display text-2xl text-gold">{{ value.n }}</span>
            <div>
              <h3 class="font-sans text-base font-normal tracking-wide text-ink">
                {{ value.title }}
              </h3>
              <p class="mt-1.5 max-w-[42ch] text-sm leading-[1.7]">{{ value.text }}</p>
            </div>
          </li>
        </ul>
      </div>
    </section>

    <UiStatRow :items="stats" />

    <SharedCtaBanner />
  </div>
</template>
