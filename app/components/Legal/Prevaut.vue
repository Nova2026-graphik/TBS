<script setup lang="ts">
/**
 * Avertissement affiché en tête des pages légales traduites.
 *
 * Les trois documents engagent TBS Distribution S.A.R.L au regard du droit
 * togolais, et c'est le texte français qui a été rédigé pour cela. La
 * traduction sert à comprendre ; elle ne remplace pas l'original, et le
 * visiteur doit pouvoir y accéder d'un clic plutôt que de deviner qu'elle
 * existe. D'où le lien, et non la seule mention.
 */
const switchLocalePath = useSwitchLocalePath()
const versFrancais = computed(() => switchLocalePath('fr'))
</script>

<template>
  <aside class="mx-auto mt-8 max-w-[68ch] border border-ink/15 bg-sand/40 p-5 text-[0.9375rem] leading-[1.7] text-ink-soft">
    <LegalTexte tag="p" :texte="$t('legal.prevails')" />
    <p class="mt-3">
      <NuxtLink :to="versFrancais" hreflang="fr" lang="fr">{{ $t('legal.readFrench') }}</NuxtLink>
    </p>
  </aside>
</template>
