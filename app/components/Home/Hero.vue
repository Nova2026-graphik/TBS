<script setup lang="ts">
/**
 * Hero d'accueil : photo pleine hauteur, dégradé de lisibilité, titre
 * sérif et deux appels à l'action.
 *
 * L'image est marquée `preload` et servie en pleine largeur : c'est le LCP
 * de la page, il ne doit pas attendre le chargement du CSS pour démarrer.
 */

const sizesFull = SIZES_FULL
const densitiesFull = DENSITIES_FULL
</script>

<template>
  <section class="relative min-h-[31.25rem] overflow-hidden bg-ink" style="height: min(88svh, 58.75rem)">
    <div class="absolute inset-0 animate-ken-burns">
      <NuxtImg
        src="/images/hero-reception.jpg"
        alt="Salle de réception dressée par TBS Events, plan large"
        preset="hero"
        preload
        :sizes="sizesFull"
        :densities="densitiesFull"
        width="1920"
        height="1280"
        class="size-full object-cover"
      />
    </div>

    <!-- Dégradé : contraste garanti sur le texte, quel que soit le cliché. -->
    <div
      class="pointer-events-none absolute inset-0"
      style="background: linear-gradient(180deg, rgb(62 53 36 / 0.55) 0%, rgb(62 53 36 / 0.24) 40%, rgb(62 53 36 / 0.88) 100%)"
    />

    <div class="u-gutter pointer-events-none absolute inset-0 flex flex-col justify-end gap-[clamp(1.125rem,2.6vw,2.125rem)] pb-[clamp(2.125rem,5vw,4.5rem)] pt-[clamp(2.25rem,6vw,5.75rem)]">
      <div class="flex items-center gap-3.5 text-white/80">
        <span class="u-rule" />
        <span class="text-[0.6875rem] uppercase tracking-[0.28em]">Lomé — Togo</span>
      </div>

      <h1 class="max-w-[17em] text-display text-white">
        Équiper vos réceptions,<br >
        <span class="italic text-cream">fournir vos projets</span>
      </h1>

      <p class="max-w-[48ch] text-[clamp(0.9375rem,1.45vw,1.125rem)] leading-[1.75] text-white/85">
        TBS Distribution réunit quatre branches : Équipements, Events,
        Études &amp; Conseils et Agro. Fournir, équiper, conseiller et
        cultiver — un seul interlocuteur, à Lomé et partout au Togo.
      </p>

      <div class="pointer-events-auto flex flex-wrap gap-3">
        <UiButton to="/services" variant="light" size="lg">Découvrir nos services</UiButton>
        <UiButton to="/contact" variant="outline" size="lg">Demander un devis</UiButton>
      </div>
    </div>
  </section>
</template>
