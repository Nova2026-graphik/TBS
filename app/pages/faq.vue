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

/**
 * Planche-contact de l'en-tête : le matériel sur lequel portent la plupart des
 * questions — chapiteaux, chaises et tables, sonorisation. Les trois fichiers
 * sont ceux que `docs/reportage-photo.md` commande en 2:3 portrait, le format
 * qui souffre le moins du recadrage carré de la bande.
 */
const HERO_MEDIA = [
  { src: '/images/categorie-tentes.jpg', subject: 'Tentes et chapiteaux' },
  { src: '/images/categorie-mobilier.jpg', subject: 'Mobilier de réception' },
  { src: '/images/categorie-son-lumiere.jpg', subject: 'Son & lumière' },
]
</script>

<template>
  <div>
    <UiPageHero
      eyebrow="FAQ"
      :title="$t('faq.title')"
      :accent="$t('faq.accent')"
      :lead="$t('faq.lead')"
      :media="HERO_MEDIA"
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
