<script setup lang="ts">
import type { Branch, Domain } from '#shared/types'

/**
 * Accordéon horizontal des quatre secteurs, chacun dépliant ses domaines.
 *
 * La galerie répond à « à quoi ça ressemble » ; il lui manquait « qui fait
 * quoi ». Les vignettes portent bien une branche (`GalleryItem.branch`), mais
 * elle n'est visible nulle part : un visiteur arrivé sur une photo de mariage
 * n'apprend pas que la même société équipe aussi un laboratoire. Cette section
 * comble le trou en reprenant les deux jeux de données déjà servis par
 * `/api/site-content` — les quatre branches et les huit domaines — sans en
 * inventer un troisième.
 *
 * Trois écarts avec l'accordéon d'origine, tous pour les mêmes raisons que le
 * reste du site :
 *
 *  - **un seul élément interactif par panneau**, un lien qui couvre toute la
 *    surface. L'original empilait `onMouseEnter` et `onClick` sur un `<div>` :
 *    rien au clavier, rien pour un lecteur d'écran. Ici le panneau se déplie
 *    au survol *et* à la prise de focus, et Entrée mène aux prestations du
 *    secteur (`/services?branche=…`, la route qui existe déjà) ;
 *  - **le texte reste hors du lien**. Un lien qui contiendrait le titre, la
 *    baseline et les quatre domaines s'annoncerait d'une traite, illisible ;
 *    le lien ne porte donc qu'un intitulé explicite en `sr-only`, et le
 *    contenu visible est lu comme du texte courant ;
 *  - **voile plutôt que `filter: brightness`**. La palette TBS est chaude :
 *    un simple assombrissement la vire au gris. Le voile est teinté à l'encre
 *    de la charte, et il coûte une couche de peinture au lieu d'un filtre sur
 *    toute la surface du panneau.
 *
 * Le repli des mouvements réduits est déjà global (`main.css`) : sous
 * `prefers-reduced-motion`, les panneaux basculent sans transition.
 */
const props = defineProps<{ branches: Branch[], domains: Domain[] }>()

/** Chaque secteur reçoit les domaines qui lui sont rattachés. */
const sectors = computed(() =>
  props.branches.map((branch) => {
    const domains = props.domains.filter(domain => domain.branch === branch.slug)
    return {
      ...branch,
      domains,
      /**
       * Études et Agro n'ont qu'un domaine, et son intitulé reprend mot pour
       * mot la baseline de la branche. Les afficher l'un sous l'autre passe
       * pour une erreur d'affichage ; on ne garde alors que l'étiquette de
       * domaine, qui est le propos de la section.
       */
      tagline: domains.some(domain => domain.title === branch.tagline) ? null : branch.tagline,
    }
  }),
)

/**
 * `null` tant que le visiteur n'a rien désigné : le premier secteur est alors
 * déplié. Garder la valeur nulle plutôt que d'initialiser avec un slug évite
 * de dépendre de l'ordre d'arrivée des données — le rendu serveur et
 * l'hydratation retombent sur le même panneau.
 */
const chosen = ref<string | null>(null)
const active = computed(() => chosen.value ?? props.branches[0]?.slug ?? null)

const sizesHalfMd = SIZES_HALF_MD
</script>

<template>
  <section v-if="sectors.length" class="u-gutter u-section bg-ink">
    <UiSectionHead
      :eyebrow="$t('gallery.sectors.eyebrow')"
      :title="$t('gallery.sectors.title')"
      :accent="$t('gallery.sectors.accent')"
      class="[&_.u-eyebrow]:text-peach [&_h2]:text-cream"
    >
      <template #aside>
        <p class="text-[0.9375rem] leading-[1.72] text-white/70">
          {{ $t('gallery.sectors.lead') }}
        </p>
      </template>
    </UiSectionHead>

    <!-- Hauteur fixe : sans elle, le panneau déplié étirerait la section à
         chaque survol et ferait sauter le reste de la page. -->
    <ul v-reveal class="flex h-[40rem] flex-col gap-1.5 md:h-[37.5rem] md:flex-row md:gap-2.5">
      <li
        v-for="sector in sectors"
        :key="sector.slug"
        class="group relative min-h-0 overflow-hidden bg-shell transition-[flex] duration-[900ms] ease-[var(--ease-out-expo)]"
        :class="active === sector.slug ? 'flex-[6] md:flex-[4]' : 'flex-[1]'"
      >
        <NuxtImg
          :src="sector.image"
          :alt="sector.imageAlt"
          preset="card"
          loading="lazy"
          fetchpriority="low"
          :sizes="sizesHalfMd"
          width="1200"
          height="900"
          class="absolute inset-0 size-full object-cover transition-transform duration-[1.2s] ease-[var(--ease-out-expo)]"
          :class="active === sector.slug ? 'scale-100' : 'scale-[1.08]'"
        />

        <!-- Voile de mise en retrait, sur les panneaux repliés. -->
        <span
          class="absolute inset-0 bg-ink/65 transition-opacity duration-500"
          :class="active === sector.slug ? 'opacity-0' : 'opacity-100'"
        />
        <!-- Dégradé de lisibilité, sur le panneau déplié : le texte se pose
             sur l'encre, pas sur la photo. Il est plus couvrant en mobile,
             où le texte occupe presque toute la hauteur du panneau et
             remonterait sinon sur la partie claire de la photo. -->
        <span
          class="absolute inset-0 bg-gradient-to-t from-ink via-ink/85 to-ink/45 transition-opacity duration-500 md:via-ink/75 md:to-ink/25"
          :class="active === sector.slug ? 'opacity-100' : 'opacity-0'"
        />
        <!-- Filet de branche, comme sur les cartes de l'accueil. -->
        <span
          class="absolute inset-x-0 top-0 h-0.5 transition-[height] duration-500 ease-[var(--ease-out-expo)] md:group-hover:h-1"
          :style="{ background: brandColor(sector.color) }"
        />

        <div class="absolute inset-0 z-10 flex flex-col justify-end p-[clamp(1rem,2vw,2rem)]">
          <!-- Contenu du panneau déplié. -->
          <div
            class="flex flex-col items-start gap-3 transition-[opacity,transform] duration-500 ease-[var(--ease-out-expo)]"
            :class="
              active === sector.slug
                ? 'translate-y-0 opacity-100 delay-150'
                : 'translate-y-8 opacity-0'
            "
          >
            <span class="u-eyebrow text-white/80">
              <span class="size-[7px] shrink-0 rounded-full" :style="{ background: brandColor(sector.color) }" />
              {{ $t('gallery.sectors.branch', { index: String(sector.index).padStart(2, '0') }) }}
            </span>

            <h3 class="text-h3 text-cream">{{ sector.name }}</h3>

            <p v-if="sector.tagline" class="max-w-[38ch] text-[0.9375rem] leading-[1.7] text-white/80">
              {{ sector.tagline }}
            </p>

            <!-- Les domaines, raison d'être de la section : ils sont tous
                 nommés, y compris quand la branche n'en porte qu'un. -->
            <div v-if="sector.domains.length" class="max-w-[46ch]">
              <p class="text-[0.625rem] uppercase tracking-[0.22em] text-white/60">
                {{ $t('gallery.sectors.domains') }}
              </p>
              <ul class="mt-2 flex flex-wrap gap-1.5">
                <li
                  v-for="domain in sector.domains"
                  :key="domain.title"
                  class="border border-white/25 bg-white/10 px-2.5 py-1 text-[0.6875rem] leading-[1.4] tracking-[0.06em] text-white"
                >
                  {{ domain.title }}
                </li>
              </ul>
            </div>

            <!-- Reprise visuelle de l'intitulé porté par le lien : masquée aux
                 lecteurs d'écran pour ne pas l'annoncer deux fois. -->
            <span
              aria-hidden="true"
              class="mt-1 inline-flex items-center gap-2 text-[0.6875rem] uppercase tracking-[0.2em] text-white"
            >
              {{ $t('gallery.sectors.cta') }}
              <svg viewBox="0 0 24 24" class="size-3.5" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true">
                <path d="M7 17 17 7M9 7h8v8" stroke-linecap="round" stroke-linejoin="round" />
              </svg>
            </span>
          </div>

          <!-- Étiquette du panneau replié : verticale au-delà de `md`, où la
               colonne est trop étroite pour le nom à l'horizontale. -->
          <span
            aria-hidden="true"
            class="pointer-events-none absolute inset-x-2 bottom-4 flex justify-center transition-opacity duration-500 md:bottom-8"
            :class="active === sector.slug ? 'opacity-0' : 'opacity-100 delay-300'"
          >
            <span class="hidden whitespace-nowrap text-base uppercase tracking-[0.2em] text-white [writing-mode:vertical-rl] md:block">
              {{ sector.name }}
            </span>
            <span class="block truncate text-xs uppercase tracking-[0.16em] text-white md:hidden">
              {{ sector.name }}
            </span>
          </span>
        </div>

        <!-- Le lien couvre le panneau entier : cible tactile généreuse, un
             seul arrêt de tabulation par secteur, et — puisqu'il porte toute
             la surface — c'est lui qui reçoit le survol. Les gestionnaires
             vivent donc sur l'élément interactif, pas sur le `<li>`. -->
        <!-- Anneau de focus rentré de 4 px : le panneau est en `overflow-hidden`,
             et l'`outline-offset: 3px` du style de base tomberait hors cadre —
             donc invisible, exactement là où le clavier en a besoin. -->
        <NuxtLinkLocale
          :to="{ path: '/services', query: { branche: sector.slug } }"
          class="absolute inset-0 z-20 focus-visible:outline-offset-[-4px]"
          @mouseenter="chosen = sector.slug"
          @focus="chosen = sector.slug"
        >
          <span class="sr-only">
            {{ $t('gallery.sectors.ctaLabel', { sector: sector.name }) }}
          </span>
        </NuxtLinkLocale>
      </li>
    </ul>
  </section>
</template>
