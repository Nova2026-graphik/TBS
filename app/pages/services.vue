<script setup lang="ts">
import type { BranchSlug } from '#shared/types'

const { t } = useI18n()

/**
 * Page Services — les quatre branches en onglets.
 *
 * Amélioration clé : la branche active vit dans l'URL (`?branche=events`)
 * et non dans un state local. Un lien vers une branche précise est donc
 * partageable, indexable, et le bouton « précédent » du navigateur
 * fonctionne comme l'utilisateur s'y attend.
 */
const route = useRoute()
const router = useRouter()
const { data } = await useSiteContent()

const { process, branchTabs: tabs } = useSiteData()

/**
 * L'URL porte le nom public de la branche, l'état garde l'identifiant
 * interne : `?branche=evenementiel` désigne la branche `events`. Une valeur
 * inconnue retombe sur Équipements plutôt que de vider la page.
 */
const active = computed<BranchSlug>(() => depuisUrl(route.query.branche) ?? 'equipements')

function select(slug: BranchSlug) {
  router.replace({ query: { ...route.query, branche: versUrl(slug) } })
}

const activeBranch = computed(() => data.value.branches.find(b => b.slug === active.value)!)
const activeBlocks = computed(() => data.value.services.filter(s => s.branch === active.value))
const activeProcess = computed(() => process.value[active.value]!)
const accent = computed(() => activeBranch.value?.color ?? '#827148')

/** Le domaine décrit par un bloc, pour ses liens. */
function domaineDe(slug?: string) {
  return slug ? data.value.domains.find(d => d.slug === slug) : undefined
}

/** Effectifs de la branche active, comptés — jamais écrits. */
const nbDomaines = computed(() => domainesDeLaBranche(data.value.domains, active.value).length)
const nbReferences = computed(() =>
  referencesDeLaBranche(data.value.equipment ?? [], data.value.domains, active.value),
)

usePageSeo({
  title: t('seo.services.title'),
  description: t('seo.services.description'),
  path: '/services',
  image: '/og-services.jpg',
})

useBreadcrumbSchema([{ name: 'Nos services', path: '/services' }])
</script>

<template>
  <div>
    <UiPageHero
      :eyebrow="$t('services.eyebrow')"
      :title="$t('services.title')"
      :accent="$t('services.accent')"
      :lead="$t('services.lead')"
      image="/images/branche-equipements.jpg"
      :height="360"
    >
      <!-- Onglets de branche : rôle tablist explicite, navigation clavier
           assurée par les liens natifs. -->
      <!--
        Sous `md`, la ligne défile de bord à bord et l'onglet suivant dépasse :
        c'est ce qui dit qu'il y en a d'autres.
      -->
      <div
        class="flex gap-2 max-md:-mx-[var(--spacing-gutter)] max-md:snap-x max-md:overflow-x-auto max-md:px-[var(--spacing-gutter)] max-md:pb-1 md:flex-wrap"
        role="tablist"
        :aria-label="$t('services.tablist')"
      >
        <button
          v-for="tab in tabs"
          :key="tab.slug"
          type="button"
          role="tab"
          :aria-selected="active === tab.slug"
          class="flex min-h-11 shrink-0 snap-start items-center gap-2.5 whitespace-nowrap border px-[1.125rem] py-3 text-[0.6875rem] uppercase tracking-[0.16em] transition-colors duration-400 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
          :class="active === tab.slug
            ? 'border-white bg-white text-ink'
            : 'border-white/35 text-white hover:border-white hover:bg-white/10'"
          @click="select(tab.slug)"
        >
          <span class="size-[7px] rounded-full" :style="{ background: brandColor(tab.color) }" />
          {{ tab.label }}
        </button>
      </div>
    </UiPageHero>

    <!-- Le contenu change de clé avec la branche : Vue remonte le bloc et
         la transition rejoue, ce qui signale visuellement le changement. -->
    <Transition
      mode="out-in"
      enter-active-class="transition-[opacity,transform] duration-400 ease-[var(--ease-out-expo)]"
      enter-from-class="opacity-0 translate-y-2"
      leave-active-class="transition-opacity duration-200"
      leave-to-class="opacity-0"
    >
      <div :key="active">
        <!--
          Tout ce que la branche fournit : ses domaines en tuiles, comptés.
          La page décrivait quatre domaines sur treize, et rien n'y était
          cliquable. La grille est celle du panneau de la galerie.
        -->
        <section class="u-gutter bg-sand pb-[clamp(2.5rem,5vw,4.5rem)] pt-14">
          <div class="mb-[1.625rem] flex flex-wrap items-end justify-between gap-x-8 gap-y-4">
            <div>
              <span class="u-eyebrow">
                <span class="size-[7px] rounded-full" :style="{ background: brandColor(accent) }" />
                {{ activeBranch.name }} — {{ $t('gallery.sectors.countDomains', { n: nbDomaines }, nbDomaines) }}
                · {{ $t('gallery.sectors.countRefs', { n: nbReferences }, nbReferences) }}
              </span>
              <h2 class="mt-3 text-h2">
                {{ $t('services.supplyTitle') }} <span class="italic">{{ $t('services.supplyAccent') }}</span>
              </h2>
            </div>
            <NuxtLinkLocale
              :to="{ path: '/galerie', query: { branche: versUrl(active) } }"
              class="u-link-underline"
            >
              {{ $t('services.supplyLink') }}
            </NuxtLinkLocale>
          </div>
          <div class="@container">
            <DomainGrid
              :branch="activeBranch"
              :domains="data.domains"
              :equipment="data.equipment ?? []"
              tone="light"
            />
          </div>
        </section>

        <section class="u-gutter bg-white pb-[clamp(2.5rem,5vw,4.5rem)] pt-[3.75rem]">
          <div class="flex flex-wrap items-end justify-between gap-x-8 gap-y-4">
            <div>
              <span class="u-eyebrow"><span class="u-rule" />{{ $t('services.detailEyebrow', { n: activeBlocks.length }, activeBlocks.length) }}</span>
              <h2 class="mt-3 text-h2">
                {{ $t('services.detailTitle') }} <span class="italic">{{ $t('services.detailAccent') }}</span>
              </h2>
            </div>
            <a href="#top" class="u-link-underline">{{ $t('services.detailLink') }} <span aria-hidden="true">↑</span></a>
          </div>
          <div class="mt-7 grid gap-x-8 gap-y-7 lg:grid-cols-2">
            <ServicesBlock
              v-for="block in activeBlocks"
              :key="block.title"
              :block="block"
              :domain="domaineDe(block.domain)"
            />
          </div>
        </section>

        <SharedProcessSteps
          :eyebrow="activeProcess.eyebrow"
          :dot="brandColor(accent)"
          :title="activeProcess.title"
          :accent="activeProcess.titleAccent"
          :steps="activeProcess.steps"
          :footnote="activeProcess.footnote"
          :footnote-cta="activeProcess.footnote
            ? { label: $t('services.consultUs'), to: { path: '/contact', query: { branche: versUrl(active) } } }
            : undefined"
          :tone="active === 'events' ? 'light' : 'sand'"
        />

        <ServicesOffers v-if="active === 'events'" />
      </div>
    </Transition>

    <SharedCtaBanner />
  </div>
</template>
