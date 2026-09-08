<script setup lang="ts">
import type { Branch } from '#shared/types'

/**
 * Les quatre branches, en cartes.
 *
 * Écart avec la maquette : le filet coloré est passé de `border-top` fixe à
 * un trait qui s'épaissit au survol, et la carte entière est cliquable
 * (lien étendu). L'utilisateur n'a plus à viser le petit « Voir la branche ».
 */
defineProps<{ branches: Branch[] }>()

const sizesHalfMd = SIZES_HALF_MD
</script>

<template>
  <section class="u-gutter u-section bg-white">
    <UiSectionHead
      :eyebrow="$t('home.branches.eyebrow')"
      :title="$t('home.branches.title')"
      :accent="$t('home.branches.accent')"
    >
      <template #aside>
        <p class="text-[0.9375rem] leading-[1.72]">
          TBS Distribution S.A.R.L structure son activité en quatre branches
          complémentaires. Chacune a ses équipes et ses fournisseurs ; toutes
          partagent la même logistique et la même exigence de délai.
        </p>
      </template>
    </UiSectionHead>

    <div class="grid gap-[clamp(1.125rem,2.4vw,2.125rem)] md:grid-cols-2">
      <article
        v-for="(branch, i) in branches"
        :key="branch.slug"
        v-reveal="i * 80"
        class="group relative flex flex-col"
      >
        <!-- Filet de branche : 2px au repos, 4px au survol. -->
        <span
          class="h-0.5 w-full transition-[height] duration-500 ease-[var(--ease-out-expo)] group-hover:h-1"
          :style="{ background: brandColor(branch.color) }"
        />

        <div class="relative aspect-16/10 overflow-hidden bg-shell">
          <NuxtImg
            :src="branch.image"
            :alt="branch.imageAlt"
            preset="card"
            loading="lazy"
            :sizes="sizesHalfMd"
            width="1200"
            height="750"
            class="size-full object-cover transition-transform duration-[1.1s] ease-[var(--ease-out-expo)] group-hover:scale-[1.04]"
          />
        </div>

        <div class="flex flex-1 flex-col pt-[clamp(1.25rem,2.4vw,1.875rem)]">
          <span class="u-eyebrow">
            <span class="size-[7px] rounded-full" :style="{ background: brandColor(branch.color) }" />
            Branche {{ String(branch.index).padStart(2, '0') }}
          </span>

          <h3 class="mb-1.5 mt-3 text-h3">{{ branch.name }}</h3>

          <!-- La couleur de branche sert de pastille au-dessus ; en texte, elle
               passe par sa variante lisible (WCAG 1.4.3). -->
          <p
            class="mb-3.5 text-xs uppercase tracking-[0.1em]"
            :style="{ color: brandTextColor(branch.color) }"
          >
            {{ branch.tagline }}
          </p>

          <p class="mb-5 max-w-[46ch] text-[0.9375rem] leading-[1.72]">
            {{ branch.description }}
          </p>

          <UiTag :items="branch.tags" class="mb-6" />

          <NuxtLinkLocale
            :to="{ path: '/services', query: { branche: branch.slug } }"
            class="u-link-underline mt-auto self-start after:bg-current"
            :style="{ '--tw-text-opacity': 1 }"
          >
            <!-- Le lien couvre toute la carte : cible tactile généreuse,
                 tout en gardant un intitulé explicite pour les lecteurs
                 d'écran. -->
            <span class="absolute inset-0" aria-hidden="true" />
            Voir la branche<span class="sr-only"> {{ branch.name }}</span>
          </NuxtLinkLocale>
        </div>
      </article>
    </div>
  </section>
</template>
