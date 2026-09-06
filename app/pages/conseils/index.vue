<script setup lang="ts">
/**
 * Sommaire de la rubrique Conseils.
 *
 * Le site n'avait aucune surface d'entrée au-delà des requêtes de marque :
 * six pages statiques se positionnent sur « TBS Distribution » et guère plus.
 * Les requêtes qui rapportent sont longues et précises — « combien de chaises
 * pour 300 invités », « prix location vaisselle mariage Lomé » — et se
 * captent avec du contenu, pas avec une page de services.
 */
const { data: articles } = await useAsyncData('conseils', () =>
  queryCollection('conseils').order('publishedAt', 'DESC').all(),
)

const aLaUne = computed(() => articles.value?.find(article => article.featured))
const autres = computed(() =>
  (articles.value ?? []).filter(article => article.path !== aLaUne.value?.path),
)

const sizesHalf = SIZES_HALF_MD
const sizesThird = SIZES_THIRD_MD

usePageSeo({
  title: 'Conseils — organiser, équiper, chiffrer',
  description:
    'Combien de chaises pour 300 invités, quel rétroplanning pour un mariage à Lomé, comment répondre à un appel d’offres public au Togo : les repères de TBS Distribution, chiffrés et vérifiés sur le terrain.',
  path: '/conseils',
})

useBreadcrumbSchema([{ name: 'Conseils', path: '/conseils' }])

function dateLisible(valeur: string) {
  return new Date(valeur).toLocaleDateString('fr-FR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}
</script>

<template>
  <div>
    <UiPageHero
      eyebrow="Conseils"
      title="Ce que nous savons,"
      accent="mis à votre disposition"
      lead="Des repères chiffrés, tirés de dix ans de montages de salle et de livraisons : quantités, délais, pièces à réunir. De quoi préparer votre projet avant même de nous appeler."
    />

    <!-- Article à la une : c'est le calculateur, le contenu qui rend service
         avant la vente. -->
    <section v-if="aLaUne" class="u-gutter u-section bg-white">
      <NuxtLink :to="aLaUne.path" class="group grid gap-[clamp(1.5rem,4vw,3.5rem)] lg:grid-cols-2">
        <div class="relative aspect-4/3 overflow-hidden bg-shell">
          <NuxtImg
            :src="aLaUne.image"
            :alt="aLaUne.imageAlt"
            preset="card"
            :sizes="sizesHalf"
            width="1400"
            height="1050"
            class="size-full object-cover transition-transform duration-[1.4s] ease-[var(--ease-out-expo)] group-hover:scale-[1.03]"
          />
        </div>

        <div class="flex flex-col justify-center">
          <span class="u-eyebrow">
            <span class="u-rule" />
            {{ aLaUne.category }}
          </span>
          <h2 class="mt-4 max-w-[20ch] text-h2 transition-colors duration-500 group-hover:text-gold">
            {{ aLaUne.title }}
          </h2>
          <p class="mt-5 max-w-[54ch] text-[0.9375rem] leading-[1.8] text-ink-soft">
            {{ aLaUne.description }}
          </p>
          <p class="mt-6 text-xs uppercase tracking-[0.16em] text-ink-mute">
            <time :datetime="aLaUne.publishedAt">{{ dateLisible(aLaUne.publishedAt) }}</time>
            · {{ aLaUne.readingTime }} min de lecture
          </p>
        </div>
      </NuxtLink>
    </section>

    <section class="u-gutter u-section bg-sand">
      <ul class="grid gap-[clamp(1.75rem,3.5vw,3rem)] md:grid-cols-2 lg:grid-cols-3">
        <li v-for="(article, i) in autres" :key="article.path" v-reveal="i * 60">
          <NuxtLink :to="article.path" class="group flex h-full flex-col">
            <div class="relative aspect-4/3 overflow-hidden bg-shell">
              <NuxtImg
                :src="article.image"
                :alt="article.imageAlt"
                preset="card"
                loading="lazy"
                :sizes="sizesThird"
                width="1400"
                height="1050"
                class="size-full object-cover transition-transform duration-[1.4s] ease-[var(--ease-out-expo)] group-hover:scale-[1.03]"
              />
            </div>

            <span class="mt-5 text-[0.6875rem] uppercase tracking-[0.18em] text-gold">
              {{ article.category }}
            </span>
            <h3 class="mt-2.5 text-h3 transition-colors duration-500 group-hover:text-gold">
              {{ article.shortTitle ?? article.title }}
            </h3>
            <p class="mt-3 max-w-[46ch] flex-1 text-[0.9375rem] leading-[1.75] text-ink-soft">
              {{ article.description }}
            </p>
            <p class="mt-5 text-xs uppercase tracking-[0.16em] text-ink-mute">
              <time :datetime="article.publishedAt">{{ dateLisible(article.publishedAt) }}</time>
              · {{ article.readingTime }} min
            </p>
          </NuxtLink>
        </li>
      </ul>
    </section>

    <SharedCtaBanner />
  </div>
</template>
