<script setup lang="ts">
/**
 * Article de la rubrique Conseils.
 *
 * Le corps est rendu par `<ContentRenderer>`, qui accepte les composants Vue
 * inscrits dans `app/components/content/` — c'est ainsi que le calculateur de
 * matériel s'insère au milieu du texte plutôt que sur une page à part, là où
 * personne ne l'aurait cherché.
 */
const route = useRoute()

const { data: article } = await useAsyncData(`conseil-${route.params.slug}`, () =>
  queryCollection('conseils').path(`/conseils/${route.params.slug}`).first(),
)

if (!article.value) {
  throw createError({ statusCode: 404, statusMessage: 'Article introuvable', fatal: true })
}

const { data: voisins } = await useAsyncData(`conseils-voisins-${route.params.slug}`, () =>
  queryCollection('conseils').order('publishedAt', 'DESC').limit(4).all(),
)

const suite = computed(() =>
  (voisins.value ?? []).filter(item => item.path !== article.value?.path).slice(0, 2),
)

const sizesFull = SIZES_FULL
const sizesHalf = SIZES_HALF_MD

usePageSeo({
  title: article.value!.title,
  description: article.value!.description,
  path: `/conseils/${route.params.slug}`,
})

useBreadcrumbSchema([
  { name: 'Conseils', path: '/conseils' },
  { name: article.value!.shortTitle ?? article.value!.title, path: `/conseils/${route.params.slug}` },
])

/**
 * JSON-LD `Article`. `dateModified` compte autant que `datePublished` : c'est
 * ce qui permet à un moteur de savoir qu'un contenu a été tenu à jour plutôt
 * que laissé en l'état.
 */
const { public: cfg } = useRuntimeConfig()

useHead({
  script: [{
    type: 'application/ld+json',
    innerHTML: JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'Article',
      'headline': article.value!.title,
      'description': article.value!.description,
      'image': `${cfg.siteUrl}${article.value!.image}`,
      'datePublished': article.value!.publishedAt,
      'dateModified': article.value!.updatedAt ?? article.value!.publishedAt,
      'inLanguage': 'fr',
      'author': { '@type': 'Organization', 'name': cfg.siteName, 'url': cfg.siteUrl },
      'publisher': {
        '@type': 'Organization',
        'name': cfg.siteName,
        'logo': { '@type': 'ImageObject', 'url': `${cfg.siteUrl}/images/logo-tbs.png` },
      },
      'mainEntityOfPage': `${cfg.siteUrl}/conseils/${route.params.slug}`,
    }),
    tagPriority: 'low',
  }],
})

function dateLisible(valeur: string) {
  return new Date(valeur).toLocaleDateString('fr-FR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}
</script>

<template>
  <article v-if="article">
    <!-- En-tête photo, dans la continuité des autres pages du site. -->
    <section class="relative min-h-[22rem] overflow-hidden bg-ink" style="height: min(52svh, 34rem)">
      <NuxtImg
        :src="article.image"
        :alt="article.imageAlt"
        preset="hero"
        preload
        :sizes="sizesFull"
        width="1400"
        height="933"
        class="absolute inset-0 size-full object-cover"
      />
      <div
        class="absolute inset-0"
        style="background: linear-gradient(180deg, rgb(62 53 36 / 0.5) 0%, rgb(62 53 36 / 0.4) 45%, rgb(62 53 36 / 0.92) 100%)"
      />

      <div class="u-gutter absolute inset-0 flex flex-col justify-end gap-5 pb-[clamp(2rem,5vw,4rem)]">
        <nav class="flex items-center gap-2.5 text-[0.6875rem] uppercase tracking-[0.16em] text-white/60" aria-label="Fil d'Ariane">
          <NuxtLink to="/conseils" class="transition-colors hover:text-white">Conseils</NuxtLink>
          <span aria-hidden="true">/</span>
          <span class="text-cream">{{ article.category }}</span>
        </nav>

        <h1 class="max-w-[24ch] text-h1 text-white">{{ article.title }}</h1>

        <p class="text-[0.6875rem] uppercase tracking-[0.16em] text-white/60">
          <time :datetime="article.publishedAt">{{ dateLisible(article.publishedAt) }}</time>
          · {{ article.readingTime }} min de lecture
        </p>
      </div>
    </section>

    <!-- `u-prose` porte la typographie de l'article — définie une fois dans
         main.css plutôt que répétée à chaque balise. -->
    <section class="u-gutter u-section bg-white">
      <div class="u-prose mx-auto max-w-[68ch]">
        <p class="lead">{{ article.description }}</p>
        <ContentRenderer :value="article" />
      </div>
    </section>

    <section v-if="suite.length" class="u-gutter u-section bg-sand">
      <UiSectionHead eyebrow="À lire ensuite" title="D'autres repères" accent="utiles" />

      <ul class="mt-[clamp(2rem,4vw,3.5rem)] grid gap-[clamp(1.75rem,3.5vw,3rem)] md:grid-cols-2">
        <li v-for="item in suite" :key="item.path">
          <NuxtLink :to="item.path" class="group flex h-full flex-col">
            <div class="relative aspect-4/3 overflow-hidden bg-shell">
              <NuxtImg
                :src="item.image"
                :alt="item.imageAlt"
                preset="card"
                loading="lazy"
                :sizes="sizesHalf"
                width="1400"
                height="1050"
                class="size-full object-cover transition-transform duration-[1.4s] ease-[var(--ease-out-expo)] group-hover:scale-[1.03]"
              />
            </div>
            <h3 class="mt-5 text-h3 transition-colors duration-500 group-hover:text-gold">
              {{ item.shortTitle ?? item.title }}
            </h3>
            <p class="mt-3 max-w-[46ch] text-[0.9375rem] leading-[1.75] text-ink-soft">
              {{ item.description }}
            </p>
          </NuxtLink>
        </li>
      </ul>
    </section>

    <SharedCtaBanner />
  </article>
</template>
