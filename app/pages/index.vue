<script setup lang="ts">
const { t } = useI18n()
const { data } = await useSiteContent()

// La branche Events porte le processus « louez en quatre étapes » affiché en
// page d'accueil ; les autres branches ont le leur sur /services.
const { process, homeStats, inspirations } = useSiteData()
const eventsProcess = computed(() => process.value.events!)
const stats = homeStats

usePageSeo({
  title: t('seo.home.title'),
  description: t('seo.home.description'),
  path: '/',
})
</script>

<!--
  Accueil « Mosaïque », validé par TBS en novembre 2026 : mosaïque d'entrée
  (diaporama + quatre tuiles de branche), chiffres clés sur fond encre,
  branches en fiches, catégories en bandeau défilant, domaines rangés par
  branche, étapes en cartes, ambiances, témoignages en colonnes, et un appel
  final propre à l'accueil — coordonnées comprises.
-->
<template>
  <div>
    <HomeHero :branches="data.branches" />

    <UiStatRow :items="stats" tone="dark" />

    <HomeBranches :branches="data.branches" />

    <HomeCategories :categories="data.categories" />

    <HomeDomains :domains="data.domains" :branches="data.branches" />

    <SharedProcessSteps
      :eyebrow="eventsProcess.eyebrow"
      dot="var(--color-peach)"
      :title="eventsProcess.title"
      :accent="eventsProcess.titleAccent"
      :steps="eventsProcess.steps"
      tone="sand"
      variant="cards"
    />

    <HomeInspirations :inspirations="inspirations" />

    <HomeTestimonials :testimonials="data.testimonials" />

    <HomeCta />
  </div>
</template>
