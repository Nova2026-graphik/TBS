<script setup lang="ts">
/**
 * TBS Distribution S.A.R.L — site vitrine
 * Conception et développement : Samuel by Novagraphik Visu
 *
 * Racine de l'application.
 *
 * Elle portait le script anti-clignotement du sélecteur de charte et la
 * couleur de barre de navigateur qui suivait le thème choisi. Depuis le
 * retrait de la charte « Sable & Or » (novembre 2026), le site n'a plus
 * qu'une palette : la couleur de barre est une constante, déclarée avec les
 * autres `meta` dans `nuxt.config.ts`, et il n'y a plus aucun script en ligne
 * à faire figurer dans la CSP pour cette raison.
 */
</script>

<template>
  <!--
    Barre de progression pendant le passage d'une page à l'autre. Les pages
    sont pré-rendues, mais la navigation charge quand même leurs données et
    leur code : sur un réseau mobile lent, sans signe de vie, un clic semble
    ne rien faire, et l'on clique encore. Couleur d'accent de la charte.
  -->
  <NuxtLoadingIndicator color="var(--color-gold)" :height="2" />
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>
