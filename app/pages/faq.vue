<script setup lang="ts">
const { t } = useI18n()
const { data } = await useSiteContent()

usePageSeo({
  title: t('seo.faq.title'),
  description: t('seo.faq.description'),
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
      :title="$t('faq.title')"
      :accent="$t('faq.accent')"
      :lead="$t('faq.lead')"
    >
      <div class="mt-8">
        <UiButton to="/contact" variant="ghost">{{ $t('common.writeUs') }}</UiButton>
      </div>
    </UiPageHero>

    <section class="u-gutter u-section bg-white">
      <FaqAccordion :items="data.faq" />
    </section>

    <SharedCtaBanner />
  </div>
</template>
