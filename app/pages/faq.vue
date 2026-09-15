<script setup lang="ts">
const { t } = useI18n()
const { data } = await useSiteContent()

/** La recherche vit ici : le champ est dans le bandeau, la liste en dessous. */
const recherche = ref('')

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
      image="/images/galerie-soiree-blanche.jpg"
      :height="330"
    >
      <!--
        La recherche filtre au fil de la frappe, dans la question et la
        réponse, accents ignorés. `role="search"` pour qu'elle soit trouvée
        comme telle ; l'étiquette est visible pour les lecteurs d'écran.
      -->
      <form role="search" class="flex max-w-[35rem] border border-white/45 bg-white/[0.08]" @submit.prevent>
        <label for="faq-recherche" class="sr-only">{{ $t('faq.searchLabel') }}</label>
        <input
          id="faq-recherche"
          v-model="recherche"
          type="search"
          :placeholder="$t('faq.searchPlaceholder')"
          autocomplete="off"
          class="min-h-12 min-w-0 flex-1 bg-transparent px-[1.125rem] py-3.5 text-[0.9375rem] text-white outline-none placeholder:text-white/70 focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-white"
        >
        <span aria-hidden="true" class="flex items-center border-l border-white/30 px-[1.125rem] text-white">⌕</span>
      </form>
    </UiPageHero>

    <section class="u-gutter bg-white pb-[clamp(3rem,6vw,4.5rem)] pt-14">
      <FaqAccordion :items="data.faq" :branches="data.branches" :search="recherche" />
    </section>

    <SharedCtaBanner />
  </div>
</template>
