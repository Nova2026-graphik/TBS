<script setup lang="ts">
import type { Branch, Domain, DomainSlug, Equipment } from '#shared/types'

/**
 * Navigation entre domaines — colonne collante en bureau, bandeau défilant
 * en mobile.
 *
 * Elle remplace le retour en arrière : depuis une page domaine, passer à un
 * autre domaine de la même branche demandait sinon de revenir à la galerie
 * et de rouvrir le panneau des secteurs. Les compteurs disent d'emblée ce
 * qu'on trouvera, ce que le panneau ne montrait pas.
 *
 * En mobile, le bandeau est collé sous l'en-tête plutôt qu'empilé : dix-sept
 * lignes avant la grille auraient repoussé les produits sous deux écrans de
 * défilement.
 */
const props = defineProps<{
  branches: Branch[]
  domains: Domain[]
  references: Equipment[]
  active: DomainSlug
  branch: Branch
}>()

/** Les domaines de la branche courante, avec ce qu'ils contiennent. */
const freres = computed(() =>
  props.domains
    .filter(d => d.branch === props.branch.slug)
    .map(d => ({
      ...d,
      total: props.references.filter(r => r.domain === d.slug).length,
    })),
)

/** Les trois autres branches, pour sortir de celle-ci sans repasser par la galerie. */
const autres = computed(() => props.branches.filter(b => b.slug !== props.branch.slug))

const info = useSiteInfo()
const sizesThumbnail = SIZES_THUMBNAIL
</script>

<template>
  <!--
    `min-w-0` n'est pas décoratif : cet élément est une cellule de grille, et
    une cellule vaut par défaut `min-width: auto` — elle refuse de devenir
    plus étroite que son contenu. Le bandeau de dix-sept domaines élargissait
    donc la colonne au lieu de défiler, et poussait la page à 1350 px de
    débordement latéral sur téléphone.
  -->
  <nav class="min-w-0" :aria-label="$t('domain.nav.label')">
    <!-- ── Bandeau mobile ─────────────────────────────────────────────── -->
    <div
      class="sticky top-[4.25rem] z-30 -mx-[var(--spacing-gutter)] border-b border-ink/10 bg-white/95 backdrop-blur lg:hidden"
    >
      <ul class="flex snap-x gap-2 overflow-x-auto px-[var(--spacing-gutter)] py-3">
        <li v-for="domaine in freres" :key="domaine.slug" class="snap-start">
          <NuxtLinkLocale
            :to="`/galerie/${versUrl(branch.slug)}/${domaine.slug}`"
            class="flex min-h-11 items-center gap-2 whitespace-nowrap border px-3 py-1.5 text-[0.8125rem] transition-colors duration-400"
            :class="domaine.slug === active
              ? 'border-ink bg-ink text-white'
              : 'border-ink/15 text-ink-soft hover:border-gold hover:text-gold'"
            :aria-current="domaine.slug === active ? 'page' : undefined"
          >
            {{ domaine.short ?? domaine.title }}
            <span class="text-[0.6875rem] opacity-70">{{ domaine.total }}</span>
          </NuxtLinkLocale>
        </li>
      </ul>
    </div>

    <!-- ── Colonne bureau ─────────────────────────────────────────────── -->
    <div class="sticky top-[5.75rem] hidden lg:block">
      <p class="text-[0.5625rem] uppercase tracking-[0.18em] text-ink-mute">
        {{ branch.name }} — {{ $t('domain.nav.count', { n: freres.length }, freres.length) }}
      </p>

      <ul class="mt-4 border-t border-ink/10">
        <li v-for="domaine in freres" :key="domaine.slug">
          <NuxtLinkLocale
            :to="`/galerie/${versUrl(branch.slug)}/${domaine.slug}`"
            class="flex items-center gap-3 border-b border-ink/10 py-3 pl-3 pr-2 transition-colors duration-400"
            :class="domaine.slug === active
              ? 'border-l-2 border-l-gold bg-shell/60 text-ink'
              : 'border-l-2 border-l-transparent text-ink-soft hover:text-gold'"
            :aria-current="domaine.slug === active ? 'page' : undefined"
          >
            <NuxtImg
              v-if="domaine.thumbnail"
              :src="domaine.thumbnail"
              alt=""
              preset="card"
              loading="lazy"
              :sizes="sizesThumbnail"
              width="84"
              height="84"
              class="size-[2.625rem] shrink-0 object-contain"
            />
            <span v-else aria-hidden="true" class="size-[2.625rem] shrink-0" />
            <span class="flex-1 text-[0.9375rem] leading-[1.35]">
              {{ domaine.short ?? domaine.title }}
            </span>
            <span class="text-[0.75rem] text-ink-mute">{{ domaine.total }}</span>
          </NuxtLinkLocale>
        </li>
      </ul>

      <ul class="mt-8">
        <li v-for="autre in autres" :key="autre.slug">
          <NuxtLinkLocale
            :to="{ path: '/galerie', query: { branche: versUrl(autre.slug) } }"
            class="flex min-h-11 items-center gap-2.5 border-b border-ink/10 text-[0.6875rem] uppercase tracking-[0.14em] text-ink-soft transition-colors duration-400 hover:text-gold"
          >
            <span
              aria-hidden="true"
              class="size-1.5 rounded-full"
              :style="{ background: brandColor(autre.color) }"
            />
            {{ autre.name }}
          </NuxtLinkLocale>
        </li>
      </ul>

      <!-- Le devis est à portée sans remonter : c'est la sortie de la page. -->
      <div class="mt-8 bg-sand p-6">
        <p class="font-display text-[1.25rem] leading-[1.25] text-ink">
          {{ $t('domain.nav.helpTitle') }}
        </p>
        <p class="mt-2.5 text-[0.8125rem] leading-[1.65] text-ink-soft">
          {{ $t('domain.nav.helpBody') }}
        </p>
        <a
          :href="`tel:${info.phonePrimary}`"
          class="mt-4 inline-flex min-h-11 items-center text-[0.9375rem] text-ink transition-colors duration-400 hover:text-gold"
        >
          {{ info.phoneDisplay }}
        </a>
        <a
          :href="info.whatsappUrl"
          target="_blank"
          rel="noopener"
          class="mt-1 flex min-h-11 items-center text-[0.6875rem] uppercase tracking-[0.16em] text-gold transition-colors duration-400 hover:text-gold-deep"
        >
          {{ $t('common.whatsapp') }} <span aria-hidden="true">&nbsp;↗</span>
        </a>
      </div>
    </div>
  </nav>
</template>
