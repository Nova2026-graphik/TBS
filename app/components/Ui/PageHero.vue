<script setup lang="ts">
/**
 * Bandeau des pages intérieures — À propos, Services, Conseils, Contact, FAQ
 * et les trois pages légales.
 *
 * Photographie sous un voile **dégradé horizontal** : opaque à gauche, où se
 * pose le texte, ouvert à droite pour laisser respirer l'image. Le voile
 * uniforme d'avant éteignait la photo ; celui-ci la montre. `color-mix` sur
 * l'encre de la charte plutôt qu'une couleur écrite : brun en « Sable & Or »,
 * bleu nuit en « Bleu & Rouge », et le dégradé suit.
 *
 * Deux choses ont disparu par rapport à la version précédente, et c'est
 * voulu :
 *
 *  - **la planche-contact** de trois ou quatre vignettes. Elle occupait la
 *    droite du bandeau sans rien dire que le texte ne disait ; la maquette y
 *    met à la place ce qui sert la page — onglets, filtres, recherche, liens
 *    de branche — via l'emplacement `aside` ;
 *  - **le fond sable**. Toutes les pages ouvrent désormais sur le même bandeau
 *    sombre que la galerie et l'accueil ; un visiteur sait d'un coup d'œil
 *    qu'il est encore sur le même site.
 *
 * Une seule balise `h1` par page : c'est ce composant qui la porte. Sans
 * photographie, le bandeau tient sur le seul aplat d'encre — c'est le cas des
 * pages légales, et il n'y a pas de trou.
 */
const props = defineProps<{
  eyebrow: string
  title: string
  /** Seconde partie du titre, en italique. */
  accent?: string
  lead?: string
  image?: string
  /**
   * Hauteur minimale sur ordinateur, prise dans la maquette de chaque page :
   * 300 pour Contact, 330 pour la FAQ, 340 pour Conseils, 360 pour Services,
   * 400 pour À propos. Sur téléphone, toutes plafonnent à 260.
   */
  height?: 300 | 330 | 340 | 360 | 400
}>()

const hauteur = computed(() => `${props.height ?? 360}px`)

/**
 * Le voile. `--color-ink` plutôt qu'une couleur écrite : la charte change
 * l'encre, et le dégradé doit changer avec elle.
 */
const VOILE = [
  'linear-gradient(90deg',
  'color-mix(in srgb, var(--color-ink) 96%, transparent) 0%',
  'color-mix(in srgb, var(--color-ink) 85%, transparent) 52%',
  'color-mix(in srgb, var(--color-ink) 45%, transparent) 100%)',
].join(', ')

const sizesFull = SIZES_FULL
const densitiesFull = DENSITIES_FULL
</script>

<template>
  <section
    class="relative isolate flex items-end overflow-hidden bg-ink text-cream max-md:min-h-0 max-md:py-2"
    :style="{ minHeight: hauteur }"
  >
    <NuxtImg
      v-if="image"
      :src="image"
      alt=""
      aria-hidden="true"
      preset="hero"
      preload
      fetchpriority="high"
      :sizes="sizesFull"
      :densities="densitiesFull"
      width="1400"
      height="933"
      class="absolute inset-0 size-full object-cover opacity-55"
    />
    <div aria-hidden="true" class="absolute inset-0" :style="{ background: VOILE }" />

    <div
      class="u-gutter relative grid w-full items-end gap-x-10 gap-y-7 pb-[clamp(1.75rem,3.5vw,2.75rem)] pt-[clamp(1.5rem,2.5vw,2.125rem)] lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)]"
    >
      <div v-reveal class="min-w-0">
        <nav
          :aria-label="$t('common.breadcrumb')"
          class="mb-[1.375rem] flex flex-wrap items-center gap-2.5 text-[0.6875rem] uppercase tracking-[0.2em] text-cream/70 max-lg:text-xs max-lg:tracking-[0.14em]"
        >
          <NuxtLinkLocale
            to="/"
            class="inline-flex min-h-12 items-center transition-colors duration-400 hover:text-white"
          >
            {{ $t('nav.home') }}
          </NuxtLinkLocale>
          <span aria-hidden="true">/</span>
          <span class="inline-flex min-h-12 items-center text-cream" aria-current="page">{{ eyebrow }}</span>
        </nav>

        <span class="block text-[0.6875rem] uppercase tracking-[0.22em] text-gold max-lg:text-xs max-lg:tracking-[0.14em]">{{ eyebrow }}</span>

        <h1 class="mt-3 max-w-[16ch] font-display text-[clamp(2.125rem,5vw,3.75rem)] leading-[1.06] text-white">
          {{ title }}
          <template v-if="accent">
            <br class="max-sm:hidden"><em class="italic">{{ accent }}</em>
          </template>
        </h1>

        <p v-if="lead" v-reveal="90" class="mt-[1.125rem] max-w-[52ch] text-[0.96875rem] leading-[1.72] text-cream/85">
          {{ lead }}
        </p>

        <!-- Ce qui suit l'introduction : boutons, onglets, filtres, recherche. -->
        <div v-if="$slots.default" v-reveal="140" class="mt-6">
          <slot />
        </div>
      </div>

      <!--
        L'emplacement de droite : les quatre liens de branche sur À propos,
        rien sur les pages légales. Aligné en bas de la grille, comme le titre.
      -->
      <div v-if="$slots.aside" v-reveal="120" class="min-w-0 lg:justify-self-end">
        <slot name="aside" />
      </div>
    </div>
  </section>
</template>
