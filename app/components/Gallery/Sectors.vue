<script setup lang="ts">
import type { Branch, Domain, Equipment } from '#shared/types'

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
 * L'accordéon ne vaut qu'en largeur : en dessous de `md`, les quatre panneaux
 * s'empilent et montrent tous leurs domaines. Le dépliement reposait sur le
 * survol et le focus, deux gestes qu'un écran tactile n'a pas — trois secteurs
 * sur quatre gardaient donc leurs domaines invisibles au doigt, et les toucher
 * quittait la page. Supprimer le geste vaut mieux que le corriger.
 *
 * Trois écarts avec l'accordéon d'origine, tous pour les mêmes raisons que le
 * reste du site :
 *
 *  - **le panneau n'est plus une seule surface cliquable.** Il l'a été, pour
 *    n'offrir qu'un arrêt de tabulation par secteur ; mais un lien ne peut pas
 *    en contenir d'autres, et les domaines mènent désormais chacun à la
 *    galerie filtrée. Le survol et le focus qui déplient vivent donc sur le
 *    `<li>`, et les liens sont dans le contenu. L'original empilait `onMouseEnter` et `onClick` sur un `<div>` :
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
const props = defineProps<{
  branches: Branch[]
  domains: Domain[]
  /** Le catalogue entier : les compteurs s'en déduisent, rien n'est écrit en dur. */
  equipment: Equipment[]
}>()

/**
 * Voile du panneau ouvert : dégradé **horizontal**, opaque à gauche où se
 * pose le texte, ouvert à droite pour laisser respirer la photographie. Le
 * voile vertical d'avant couvrait toute la largeur et éteignait l'image.
 *
 * `color-mix` sur `--color-ink` plutôt qu'une couleur écrite : l'encre change
 * d'une charte à l'autre — brun en « Sable & Or », bleu nuit en « Bleu &
 * Rouge » — et le dégradé doit suivre.
 */
const VOILE_OUVERT = [
  'linear-gradient(90deg',
  'color-mix(in srgb, var(--color-ink) 97%, transparent) 0%',
  'color-mix(in srgb, var(--color-ink) 92%, transparent) 58%',
  'color-mix(in srgb, var(--color-ink) 62%, transparent) 100%)',
].join(', ')

/** Chaque secteur reçoit les domaines qui lui sont rattachés, et leurs comptes. */
const sectors = computed(() =>
  props.branches.map((branch) => {
    const domains = props.domains
      .filter(domain => domain.branch === branch.slug)
      .map(domain => ({
        ...domain,
        total: props.equipment.filter(e => e.domain === domain.slug).length,
      }))
    return {
      ...branch,
      domains,
      /** Total de la branche, somme de ses domaines — jamais un nombre écrit. */
      total: domains.reduce((somme, domain) => somme + domain.total, 0),
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
    <!--
      En dessous de `md`, ce n'est plus un accordéon : les quatre panneaux
      s'empilent et montrent tous leurs domaines. Le dépliement reposait sur le
      survol et la prise de focus — deux gestes qu'un écran tactile n'a pas.
      Trois secteurs sur quatre gardaient donc leurs domaines invisibles au
      doigt, et les toucher quittait la page. Supprimer le geste vaut mieux que
      le corriger : la contrainte de largeur qui justifiait l'accordéon
      n'existe pas sur une colonne.
    -->
    <ul v-reveal class="flex flex-col gap-1.5 xl:flex-row xl:gap-2.5">
      <!--
        `mouseenter` et `focusin` sur le `<li>` : ils ne font que déplier le
        panneau survolé, et le repli des autres dépend de l'état de la liste
        entière — ce qu'aucun sélecteur CSS ne sait exprimer entre frères. Rien
        n'est atteignable par ce seul geste : les liens du panneau restent
        dans l'ordre de tabulation, et sous `md` tout est déjà déplié. D'où la
        dérogation, qui ne masque aucune interaction réservée à la souris.
      -->
      <!-- eslint-disable-next-line vuejs-accessibility/no-static-element-interactions -->
      <li
        v-for="sector in sectors"
        :key="sector.slug"
        class="group relative overflow-hidden bg-shell transition-[flex] duration-[900ms] ease-[var(--ease-out-expo)] xl:min-h-0 xl:min-w-0"
        :class="active === sector.slug ? 'xl:flex-[4]' : 'xl:flex-[1]'"
        @mouseenter="chosen = sector.slug"
        @focusin="chosen = sector.slug"
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
          :class="active === sector.slug ? 'scale-100' : 'max-xl:scale-100 scale-[1.08]'"
        />

        <!-- Voile de mise en retrait, sur les panneaux repliés. -->
        <span
          class="absolute inset-0 bg-ink/65 transition-opacity duration-500"
          :class="active === sector.slug ? 'opacity-0' : 'max-xl:opacity-0 opacity-100'"
        />
        <!-- Dégradé de lisibilité, sur le panneau déplié : le texte se pose
             sur l'encre, pas sur la photo. Il est plus couvrant en mobile,
             où le texte occupe presque toute la hauteur du panneau et
             remonterait sinon sur la partie claire de la photo. -->
        <span
          class="absolute inset-0 bg-gradient-to-t from-ink via-ink/85 to-ink/45 transition-opacity duration-500 xl:hidden"
          :class="active === sector.slug ? 'opacity-100' : 'max-xl:opacity-100 opacity-0'"
        />
        <span
          class="absolute inset-0 hidden transition-opacity duration-500 xl:block"
          :style="{ background: VOILE_OUVERT }"
          :class="active === sector.slug ? 'opacity-100' : 'opacity-0'"
        />
        <!-- Filet de branche, comme sur les cartes de l'accueil. -->
        <span
          class="absolute inset-x-0 top-0 h-0.5 transition-[height] duration-500 ease-[var(--ease-out-expo)] xl:group-hover:h-1"
          :style="{ background: brandColor(sector.color) }"
        />

        <!--
          Le contenu était en `absolute inset-0` dans un panneau
          `overflow-hidden` : treize puces ne tenaient pas dans la hauteur
          fixe, et la première passait sous le bord supérieur — visible à
          moitié, plus cliquable en entier. Il est maintenant dans le flux, et
          c'est lui qui donne sa hauteur au panneau. La photographie et le
          voile restent en absolu derrière.
        -->
        <!--
          Sous `md`, chaque panneau est un accordéon : une barre de 64 px avec
          le nom à l'horizontale et une flèche, qui déplie le contenu en
          dessous. Quatre panneaux entièrement dépliés faisaient une colonne
          de plus de trois mille pixels sur un téléphone — l'étiquette
          verticale des grands écrans, elle, ne se lit pas au doigt.
        -->
        <button
          type="button"
          class="relative z-10 flex h-16 w-full items-center justify-between gap-4 px-5 text-left text-white md:hidden"
          :aria-expanded="active === sector.slug"
          :aria-controls="`secteur-${sector.slug}`"
          @click="chosen = sector.slug"
        >
          <span class="min-w-0">
            <span class="block text-[0.625rem] uppercase tracking-[0.2em] text-cream/70 max-lg:text-xs max-lg:tracking-[0.14em]">
              {{ $t('gallery.sectors.branch', { index: String(sector.index).padStart(2, '0') }) }}
            </span>
            <span class="block truncate font-display text-[1.25rem] leading-tight">{{ sector.name }}</span>
          </span>
          <svg
            viewBox="0 0 24 24"
            class="size-5 shrink-0 transition-transform duration-300 motion-reduce:transition-none"
            :class="active === sector.slug ? 'rotate-180' : ''"
            fill="none"
            stroke="currentColor"
            stroke-width="1.6"
            aria-hidden="true"
          >
            <path d="m6 9 6 6 6-6" stroke-linecap="round" stroke-linejoin="round" />
          </svg>
        </button>

        <div
          :id="`secteur-${sector.slug}`"
          class="@container relative z-10 flex min-h-full flex-col p-[clamp(1rem,2vw,2rem)] xl:min-h-[43.75rem] xl:p-[2.375rem_2.5rem_2.125rem]"
          :class="active === sector.slug ? '' : 'max-md:hidden'"
        >
          <!-- Contenu du panneau déplié. -->
          <div
            class="flex min-h-0 flex-1 flex-col items-start gap-3 transition-[opacity,transform] duration-500 ease-[var(--ease-out-expo)]"
            :class="
              active === sector.slug
                ? 'translate-y-0 opacity-100 delay-150'
                : 'max-xl:translate-y-0 max-xl:opacity-100 translate-y-8 opacity-0'
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

            <!--
              Ligne de section : ce que la branche couvre, chiffré. Les deux
              nombres sont comptés dans les données — les écrire aurait fait
              mentir la page au premier domaine ajouté. Le filet occupe la
              largeur restante plutôt qu'une longueur fixe.
            -->
            <div
              class="mt-[1.875rem] mb-[1.125rem] flex w-full items-center gap-3.5 text-[0.65625rem] uppercase tracking-[0.24em] text-cream/62 max-lg:text-xs max-lg:tracking-[0.14em]"
            >
              <span>
                {{ $t('gallery.sectors.domains') }} ·
                {{ $t('gallery.sectors.countDomains', { n: sector.domains.length }, sector.domains.length) }} ·
                {{ $t('gallery.sectors.countRefs', { n: sector.total }, sector.total) }}
              </span>
              <span aria-hidden="true" class="h-px flex-1 bg-white/16" />
            </div>

            <!--
              La grille est un composant partagé avec la page Services et
              l'accueil. Elle est masquée — `display:none`, pas `opacity:0` —
              sur les panneaux repliés au-delà de `md` : repliée, une colonne
              de treize tuiles mesurerait plus de mille pixels et étirerait la
              rangée entière. Le nombre de colonnes suit la largeur du panneau
              (`@container` sur le contenu), voir `DomainGrid`.
            -->
            <div
              v-if="sector.domains.length"
              class="w-full"
              :class="active === sector.slug ? 'xl:block' : 'xl:hidden'"
            >
              <DomainGrid
                :branch="branches.find(b => b.slug === sector.slug)!"
                :domains="domains"
                :equipment="equipment"
                tone="dark"
              />
            </div>

            <!--
              Le lien vers les prestations, désormais dans le flux plutôt qu'en
              surface : il ne pouvait pas contenir les liens de domaine, et un
              lien dans un lien n'est pas du HTML valide.
            -->
            <NuxtLinkLocale
              :to="{ path: '/services', query: { branche: versUrl(sector.slug) } }"
              class="mt-auto inline-flex min-h-11 items-center gap-2 pt-5 text-[0.6875rem] uppercase tracking-[0.2em] text-white transition-colors duration-400 hover:text-cream focus-visible:outline-offset-[-2px] max-lg:text-xs max-lg:tracking-[0.14em]"
            >
              <span class="sr-only">{{ $t('gallery.sectors.ctaLabel', { sector: sector.name }) }}</span>
              <span aria-hidden="true">{{ $t('gallery.sectors.cta') }}</span>
              <svg viewBox="0 0 24 24" class="size-3.5" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true">
                <path d="M7 17 17 7M9 7h8v8" stroke-linecap="round" stroke-linejoin="round" />
              </svg>
            </NuxtLinkLocale>
          </div>

          <!-- Étiquette du panneau replié : verticale au-delà de `md`, où la
               colonne est trop étroite pour le nom à l'horizontale. -->
          <span
            aria-hidden="true"
            class="pointer-events-none absolute inset-x-2 bottom-4 hidden justify-center transition-opacity duration-500 xl:bottom-8 xl:flex"
            :class="active === sector.slug ? 'opacity-0' : 'opacity-100 delay-300'"
          >
            <span class="hidden whitespace-nowrap text-base uppercase tracking-[0.2em] text-white [writing-mode:vertical-rl] xl:block">
              {{ sector.name }}
            </span>
            <span class="block truncate text-xs uppercase tracking-[0.16em] text-white xl:hidden">
              {{ sector.name }}
            </span>
          </span>
        </div>
      </li>
    </ul>
  </section>
</template>
