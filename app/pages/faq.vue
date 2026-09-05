<script setup lang="ts">
const { data } = await useSiteContent()

usePageSeo({
  title: 'Questions fréquentes',
  description:
    "Délais de réservation, livraison et montage, casse, appels d'offres, délais de fourniture : les réponses de TBS Distribution aux questions les plus posées.",
  path: '/faq',
})

useBreadcrumbSchema([{ name: 'FAQ', path: '/faq' }])
// Résultats enrichis Google : la FAQ remonte directement dans la SERP.
useFaqSchema(() => data.value.faq)
</script>

<template>
  <div>
    <UiPageHero
      eyebrow="FAQ"
      title="Questions"
      accent="fréquentes"
      lead="Vous ne trouvez pas votre réponse ? Appelez-nous, on répond vite."
    >
      <div class="mt-8">
        <UiButton to="/contact" variant="ghost">Nous écrire</UiButton>
      </div>
    </UiPageHero>

    <section class="u-gutter u-section bg-white">
      <FaqAccordion :items="data.faq" />
    </section>

    <SharedCtaBanner />
  </div>
</template>
