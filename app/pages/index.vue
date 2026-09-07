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

<template>
  <div>
    <HomeHero :branches="data.branches" />

    <UiStatRow :items="stats" />

    <HomeBranches :branches="data.branches" />

    <HomeCategories :categories="data.categories" />

    <HomeDomains :domains="data.domains" :branches="data.branches" />

    <SharedProcessSteps
      :eyebrow="eventsProcess.eyebrow"
      dot="#E8A07C"
      :title="eventsProcess.title"
      :accent="eventsProcess.titleAccent"
      :steps="eventsProcess.steps"
      tone="sand"
    />

    <HomeInspirations :inspirations="inspirations" />

    <HomeTestimonials :testimonials="data.testimonials" />

    <SharedCtaBanner />
  </div>
</template>
