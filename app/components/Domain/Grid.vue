<script setup lang="ts">
import type { Branch, Domain, Equipment } from '#shared/types'

/**
 * Grille des domaines d'une branche, avec sa tuile d'appel à l'action.
 *
 * Elle vivait dans le panneau des secteurs de la galerie. La page Services
 * et l'accueil ont besoin de la même chose — mêmes tuiles, même ordre, même
 * appel à l'action en fin de rangée — sur un fond clair. Trois copies
 * auraient divergé à la première retouche ; la grille est donc un composant,
 * et le panneau l'utilise comme les autres.
 *
 * Le nombre de colonnes suit la largeur **du conteneur**, pas celle de
 * l'écran — d'où `@container` : dans l'accordéon de la galerie, le panneau
 * ouvert ne fait que quatre septièmes de la rangée, et des seuils pris sur la
 * fenêtre donnaient trois colonnes dans 610 px, où le nom d'un domaine
 * s'écrivait une lettre par ligne.
 *
 * Les cases restantes de la dernière rangée deviennent l'appel à l'action au
 * lieu de laisser un trou : `span 2` la fait tenir dans ce qui reste, quel
 * que soit le nombre de domaines — treize pour Équipements, deux pour
 * Événementiel, un pour les deux autres.
 */
const props = defineProps<{
  branch: Branch
  domains: Domain[]
  equipment: Equipment[]
  tone?: 'dark' | 'light'
}>()

const { t } = useI18n()

const sombre = computed(() => (props.tone ?? 'dark') === 'dark')

/** Les domaines de la branche, chacun avec son effectif, dans l'ordre du site. */
const tuiles = computed(() =>
  domainesDeLaBranche(props.domains, props.branch.slug).map(d => ({
    domaine: d,
    total: referencesDuDomaine(props.equipment, d.slug),
  })),
)

const total = computed(() => referencesDeLaBranche(props.equipment, props.domains, props.branch.slug))

/** Texte propre à la branche ; Équipements y insère son nombre de références. */
const accroche = computed(() =>
  t(`gallery.sectors.blurb.${props.branch.slug}`, { n: total.value }),
)

/** Le conteneur de la grille, exposé pour `@container`. */
defineExpose({ total })
</script>

<template>
  <ul class="grid w-full grid-cols-1 gap-3 @lg:grid-cols-2 @4xl:grid-cols-3">
    <li v-for="({ domaine, total: n }, i) in tuiles" :key="domaine.slug">
      <DomainTile
        :domain="domaine"
        :index="i + 1"
        :total="n"
        :branch-url="versUrl(branch.slug)"
        :tone="tone"
      />
    </li>

    <li class="@lg:col-span-2">
      <NuxtLinkLocale
        :to="{ path: '/contact', query: { branche: versUrl(branch.slug) } }"
        class="flex h-[4.375rem] items-center justify-between gap-3 border border-dashed py-2 pl-4 pr-3.5 transition-colors duration-250 focus-visible:outline-2 focus-visible:outline-offset-2 max-md:h-auto max-md:flex-wrap max-md:py-3"
        :class="sombre
          ? 'border-white/20 bg-gold/18 text-white hover:border-white/60 focus-visible:outline-white'
          : 'border-ink/25 bg-gold/8 text-ink hover:border-gold focus-visible:outline-ink'"
      >
        <span class="min-w-0 text-[0.84375rem] leading-[1.25]">
          <span
            class="mb-[3px] block text-[0.625rem] uppercase tracking-[0.18em] max-lg:text-xs max-lg:tracking-[0.14em]"
            :class="sombre ? 'text-cream/60' : 'text-ink-mute'"
          >
            {{ $t('gallery.sectors.allBranch') }}
          </span>
          {{ accroche }}
        </span>
        <span
          class="inline-flex min-h-11 items-center whitespace-nowrap border px-[1.125rem] py-[0.6875rem] text-[0.6875rem] uppercase tracking-[0.2em] max-lg:text-xs max-lg:tracking-[0.14em]"
          :class="sombre ? 'border-white/75' : 'border-ink/28'"
        >
          {{ $t('common.quote') }}
        </span>
      </NuxtLinkLocale>
    </li>
  </ul>
</template>
