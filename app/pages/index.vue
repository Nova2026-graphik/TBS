<script setup lang="ts">
const { data } = await useSiteContent()

// La branche Events porte le processus « louez en quatre étapes » affiché en
// page d'accueil ; les autres branches ont le leur sur /services.
const eventsProcess = PROCESS_BY_BRANCH.events!
const stats = HOME_STATS
const inspirations = INSPIRATIONS

usePageSeo({
  title: 'Équipements, réception, études et agro à Lomé',
  description:
    "TBS Distribution S.A.R.L : fourniture de matériels et d'équipements, location de matériel de réception, études et conseils, agriculture et agro-industrie. Devis chiffré sous 24h à Lomé et partout au Togo.",
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
