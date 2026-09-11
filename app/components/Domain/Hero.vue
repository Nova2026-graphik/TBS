<script setup lang="ts">
import type { Branch, Domain } from '#shared/types'

/**
 * Bannière d'une page domaine.
 *
 * La photographie passe sous un voile `ink` : le titre en Cormorant clair a
 * besoin d'un fond tenu, et les dix photographies de domaine n'ont ni cadrage
 * ni luminosité communs. Le voile les ramène toutes au même contraste.
 *
 * Sept domaines sur dix-sept n'ont pas de photographie — aucune image libre
 * de droits ne montre honnêtement ce qu'ils recouvrent. La bannière tient
 * alors sur le seul aplat `ink`, sans trou et sans image empruntée.
 */
const props = defineProps<{
  domain: Domain
  branch: Branch
  /** Nombre de références du domaine. */
  total: number
  /** Rang du domaine dans sa branche, et effectif de la branche. */
  rank: number
  siblings: number
}>()

const lignes = computed(() => splitDomainTitle(props.domain.title))

const sizesFull = SIZES_FULL
const densitesFull = DENSITIES_FULL
</script>

<template>
  <section class="relative isolate overflow-hidden bg-ink">
    <NuxtImg
      v-if="domain.image"
      :src="domain.image"
      :alt="domain.imageAlt ?? ''"
      preset="hero"
      preload
      :sizes="sizesFull"
      :densities="densitesFull"
      width="1400"
      height="933"
      class="absolute inset-0 size-full object-cover"
    />
    <!-- Voile : le titre doit tenir sur dix photographies différentes. -->
    <div aria-hidden="true" class="absolute inset-0 bg-ink/72" />

    <div class="u-gutter relative py-[clamp(2.5rem,6vw,5rem)]">
      <!--
        Fil d'Ariane : la page domaine est à deux niveaux sous la galerie, et
        c'est la seule indication de remontée sur un écran étroit.
      -->
      <nav :aria-label="$t('common.breadcrumb')">
        <ol class="flex flex-wrap items-center gap-x-2.5 gap-y-1 text-[0.625rem] uppercase tracking-[0.16em] text-cream/60">
          <li>
            <NuxtLinkLocale to="/" class="transition-colors duration-400 hover:text-cream">
              {{ $t('nav.home') }}
            </NuxtLinkLocale>
          </li>
          <li aria-hidden="true">/</li>
          <li>
            <NuxtLinkLocale to="/galerie" class="transition-colors duration-400 hover:text-cream">
              {{ $t('nav.gallery') }}
            </NuxtLinkLocale>
          </li>
          <li aria-hidden="true">/</li>
          <li>
            <NuxtLinkLocale
              :to="{ path: '/galerie', query: { branche: branch.slug } }"
              class="transition-colors duration-400 hover:text-cream"
            >
              {{ branch.name }}
            </NuxtLinkLocale>
          </li>
          <li aria-hidden="true">/</li>
          <li class="text-cream" aria-current="page">{{ domain.title }}</li>
        </ol>
      </nav>

      <div class="mt-7 flex items-end justify-between gap-8">
        <div class="min-w-0">
          <h1 class="font-display text-[clamp(2.25rem,6vw,4rem)] leading-[1.04] text-cream">
            {{ lignes[0] }}
            <template v-if="lignes[1]">
              <br><em class="italic">{{ lignes[1] }}</em>
            </template>
          </h1>

          <p class="mt-5 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[0.8125rem] text-cream/70">
            <span class="text-gold">{{ $t('domain.hero.references', { n: total }, total) }}</span>
            <span>{{ $t('domain.hero.rank', { i: String(rank).padStart(2, '0'), n: siblings }) }}</span>
            <span v-if="domain.meta">{{ domain.meta }}</span>
          </p>
        </div>

        <!--
          L'objet détouré du domaine, en vis-à-vis du titre. Masqué sous `md` :
          il y perdrait sa lisibilité et volerait la place au titre.
        -->
        <NuxtImg
          v-if="domain.thumbnail"
          :src="domain.thumbnail"
          alt=""
          preset="hero"
          :sizes="sizesFull"
          width="420"
          height="420"
          class="hidden size-[clamp(6rem,12vw,10rem)] shrink-0 object-contain drop-shadow-[0_12px_28px_rgba(0,0,0,0.5)] md:block"
        />
      </div>
    </div>
  </section>
</template>
