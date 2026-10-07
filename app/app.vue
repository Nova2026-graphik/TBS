<script setup lang="ts">
/**
 * TBS Distribution S.A.R.L — site vitrine
 * Conception et développement : Samuel by Novagraphik Visu
 *
 * Racine de l'application. Deux responsabilités, toutes deux liées au thème
 * de couleurs (`app/composables/useTheme.ts`).
 *
 * 1. Le script anti-clignotement. Les pages sont pré-rendues : leur HTML est
 *    identique pour tous les visiteurs, le serveur ne peut donc pas y écrire
 *    le thème choisi. Sans ce script, un visiteur ayant retenu la charte bleue
 *    verrait la page s'afficher en sable puis virer au bleu à l'hydratation.
 *    Placé en tête de <head>, il pose l'attribut avant le premier rendu.
 *
 *    Il est volontairement minuscule et sans dépendance : il s'exécute avant
 *    tout le reste, et une exception y bloquerait l'affichage. C'est un script
 *    en ligne, donc soumis à la CSP : relever son empreinte avec
 *    `npm run security:csp-hashes` avant de passer la politique en `enforce`
 *    (README, section « Sécurité »).
 *
 * 2. La couleur de la barre du navigateur, qui suit le thème. Déclarée ici et
 *    non dans `nuxt.config.ts` : unhead dédoublonne les `meta` par leur `name`
 *    et garde la dernière déclaration, celle-ci, qui est réactive.
 */
const { definition, syncThemeFromDocument } = useTheme()

const themeBootScript = `(function(){try{var t=localStorage.getItem('tbs-theme');if(t==='logo'||t==='principal')document.documentElement.dataset.theme=t}catch(e){}})()`

useHead({
  script: [{ innerHTML: themeBootScript, tagPosition: 'head', tagPriority: 'critical' }],
  meta: [{ name: 'theme-color', content: () => definition.value.browserTheme }],
})

// L'attribut est déjà posé ; on aligne l'état Vue dessus dès l'hydratation.
onMounted(syncThemeFromDocument)
</script>

<template>
  <!--
    Barre de progression pendant le passage d'une page à l'autre. Les pages
    sont pré-rendues, mais la navigation charge quand même leurs données et
    leur code : sur un réseau mobile lent, sans signe de vie, un clic semble
    ne rien faire, et l'on clique encore. Couleur d'accent de la charte, qui
    suit le thème choisi.
  -->
  <NuxtLoadingIndicator color="var(--color-gold)" :height="2" />
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>
