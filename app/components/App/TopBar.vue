<script setup lang="ts">
/**
 * Bandeau supérieur sombre : rappel des quatre branches à gauche,
 * coordonnées à droite. Masqué sous 768px où il pousserait le header
 * trop bas ; l'information reste accessible dans le footer et sur /contact.
 */
const info = useSiteInfo()

const { t, locale, locales } = useI18n()
const switchLocalePath = useSwitchLocalePath()

/** Les langues autres que celle affichée — une seule, ici. */
const autresLangues = computed(() =>
  (locales.value as { code: string, name?: string, language?: string }[])
    .filter(l => l.code !== locale.value)
    .map(l => ({
      code: l.code,
      name: l.name ?? l.code,
      language: l.language ?? l.code,
      chemin: switchLocalePath(l.code as 'fr' | 'en'),
    })),
)

/**
 * Pastilles des quatre branches. Les couleurs passent par les jetons de thème
 * plutôt que par leur valeur hexadécimale : le bandeau suit ainsi le thème
 * choisi. Études & Conseils prend la crème et non l'encre — la branche est
 * couleur d'encre dans la charte, et une pastille encre sur un fond d'encre
 * ne se verrait pas.
 */
const branchDots = computed(() => [
  { key: 'equipements', color: 'var(--color-gold)' },
  { key: 'events', color: 'var(--color-peach)' },
  { key: 'etudes', color: 'var(--color-cream)' },
  { key: 'agro', color: 'var(--color-olive)' },
].map(dot => ({ ...dot, label: t(`topbar.branches.${dot.key}`) })))
</script>

<template>
  <div class="hidden bg-ink md:block">
    <div class="u-gutter flex flex-wrap items-center justify-between gap-x-6 gap-y-2 py-2.5">
      <ul class="flex flex-wrap items-center gap-x-3 gap-y-1">
        <li
          v-for="(branch, i) in branchDots"
          :key="branch.key"
          class="flex items-center gap-3 text-[0.6875rem] tracking-[0.12em] text-white/60"
        >
          <span class="flex items-center gap-[7px]">
            <span class="size-1.5 rounded-full" :style="{ background: branch.color }" />
            {{ branch.label }}
          </span>
          <span v-if="i < branchDots.length - 1" aria-hidden="true" class="text-white/30">·</span>
        </li>
      </ul>

      <div class="flex flex-wrap items-center gap-x-6 gap-y-1 text-[0.6875rem] tracking-[0.12em]">
        <!--
          Sélecteur de charte. Il a sa place ici, aux côtés de la langue :
          l'un et l'autre sont des préférences d'affichage, valables pour tout
          le site et non pour la page en cours.
        -->
        <UiThemeSwitch />

        <!--
          Sélecteur de langue. Deux langues seulement : un lien vaut mieux
          qu'une liste déroulante — une cible, un clic, et l'état courant se
          lit sans l'ouvrir. `useSwitchLocalePath` conserve la page en cours,
          plutôt que de renvoyer à l'accueil comme le font tant de sites.
        -->
        <NuxtLink
          v-for="autre in autresLangues"
          :key="autre.code"
          :to="autre.chemin"
          class="inline-flex min-h-6 items-center gap-1.5 text-white/60 transition-colors hover:text-white"
          :hreflang="autre.language"
          :lang="autre.code"
        >
          <svg viewBox="0 0 24 24" class="size-3.5" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true">
            <circle cx="12" cy="12" r="9" />
            <path d="M3 12h18M12 3c2.5 2.7 2.5 15.3 0 18M12 3c-2.5 2.7-2.5 15.3 0 18" />
          </svg>
          {{ autre.name }}
        </NuxtLink>
        <a
          :href="`tel:${info.phonePrimary}`"
          class="inline-flex min-h-6 items-center text-white/60 transition-colors hover:text-white"
        >
          {{ info.phoneDisplay }}
        </a>
        <a
          :href="`mailto:${info.email}`"
          class="inline-flex min-h-6 items-center text-white/60 transition-colors hover:text-white"
        >
          {{ info.email }}
        </a>
        <span class="text-white/60">{{ $t('common.addressShort') }}</span>
      </div>
    </div>
  </div>
</template>
