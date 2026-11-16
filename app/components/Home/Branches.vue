<script setup lang="ts">
import type { Branch } from '#shared/types'

/**
 * Les quatre branches, en fiches texte.
 *
 * Accueil « Mosaïque » (novembre 2026) : les photos des branches sont déjà
 * dans la mosaïque du haut de page. Ici, quatre fiches côte à côte disent ce
 * que fait chaque branche — accroche, description, étiquettes — sans répéter
 * l'image. Le filet de couleur en tête de fiche relie chacune à sa tuile.
 *
 * La fiche entière est cliquable, et le filet s'épaissit au survol :
 * l'utilisateur n'a pas à viser le petit « Voir la branche ».
 */
defineProps<{ branches: Branch[] }>()
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
          {{ $t('home.branches.lead') }}
        </p>
      </template>
    </UiSectionHead>

    <!-- Filets de 1 px entre les fiches : fond coloré + `gap-px`. -->
    <div class="grid gap-px border border-ink/10 bg-ink/10 md:grid-cols-2 xl:grid-cols-4">
      <article
        v-for="(branch, i) in branches"
        :key="branch.slug"
        v-reveal="i * 80"
        class="group relative flex flex-col gap-3.5 bg-white p-[clamp(1.5rem,2.4vw,2.25rem)] transition-colors duration-500 ease-[var(--ease-out-expo)] hover:bg-sand"
      >
        <!-- Filet de branche : 3px au repos, 6px au survol. -->
        <span
          class="absolute inset-x-0 -top-px h-[3px] transition-[height] duration-500 ease-[var(--ease-out-expo)] group-hover:h-1.5"
          :style="{ background: brandColor(branch.color) }"
          aria-hidden="true"
        />

        <span class="u-eyebrow">
          <span class="size-[7px] rounded-full" :style="{ background: brandColor(branch.color) }" />
          {{ $t('home.branches.number', { n: String(branch.index).padStart(2, '0') }) }}
        </span>

        <h3 class="text-[clamp(1.5rem,2vw,1.875rem)] leading-[1.1]">{{ branch.name }}</h3>

        <!-- La couleur de branche sert de pastille au-dessus ; en texte, elle
             passe par sa variante lisible (WCAG 1.4.3). -->
        <p
          class="text-xs uppercase leading-normal tracking-[0.1em]"
          :style="{ color: brandTextColor(branch.color) }"
        >
          {{ branch.tagline }}
        </p>

        <p class="flex-1 text-sm leading-[1.7]">
          {{ branch.description }}
        </p>

        <UiTag :items="branch.tags" />

        <NuxtLinkLocale
          :to="{ path: '/services', query: { branche: versUrl(branch.slug) } }"
          class="u-link-underline mt-2 self-start"
        >
          {{ $t('home.branches.see') }}<span class="sr-only"> {{ branch.name }}</span>
        </NuxtLinkLocale>

        <!--
          Le même lien, étendu à toute la fiche : cible tactile généreuse. Il
          ne peut pas se loger dans le lien visible — `u-link-underline` est
          positionné, son calque n'en sortirait pas. Doublon pour la souris
          seulement : hors de l'ordre de tabulation et de l'arbre
          d'accessibilité, où le lien visible suffit.
        -->
        <NuxtLinkLocale
          :to="{ path: '/services', query: { branche: versUrl(branch.slug) } }"
          class="absolute inset-0 z-1"
          tabindex="-1"
          aria-hidden="true"
        />
      </article>
    </div>
  </section>
</template>
