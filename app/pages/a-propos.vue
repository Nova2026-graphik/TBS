<script setup lang="ts">
const { data } = await useSiteContent()

const stats = ABOUT_STATS
const sizesFull = SIZES_FULL
const sizesHalfLg = SIZES_HALF_LG

/** Détail par branche, affiché en quatre panneaux sous l'histoire. */
const branchDetails: Record<string, { label: string; value: string }[]> = {
  equipements: [
    { label: 'Fourniture', value: 'Bureau, informatique, santé & laboratoire, matériel roulant' },
    { label: 'Installation', value: 'Livraison, montage, mise en service et réception sur site' },
    { label: 'Suivi', value: 'Garantie constructeur, pièces, maintenance, consommables' },
    { label: 'Clients', value: 'Entreprises, administrations, cliniques, ONG et projets' },
  ],
  events: [
    { label: 'Location', value: 'Mobilier, art de la table, nappage, décor, son et lumière' },
    { label: 'Installation', value: 'Livraison, montage, mise en place, démontage' },
    { label: 'Organisation', value: 'Scénographie, coordination et présence le jour J' },
    { label: 'Clients', value: 'Familles, traiteurs, hôtels, entreprises, institutions' },
  ],
  etudes: [
    { label: 'Études', value: 'Diagnostics, faisabilité, dimensionnement et chiffrage' },
    { label: 'Conseil', value: 'Organisation, procédures, outils de gestion, formation' },
    { label: 'AMO', value: "Suivi de projet et montage de dossiers d'appels d'offres" },
    { label: 'Clients', value: 'Institutions, bailleurs, ONG, PME et groupements' },
  ],
  agro: [
    { label: 'Intrants', value: 'Semences, engrais, produits de traitement, outillage' },
    { label: 'Agro-industrie', value: 'Transformation, conditionnement, stockage, séchage' },
    { label: 'Appui', value: 'Coopératives, projets agricoles, formation technique' },
    { label: 'Clients', value: 'Exploitations, coopératives, projets et bailleurs' },
  ],
}

const values = [
  { n: '01', title: 'Exigence', text: 'Matériel lavé, vérifié et compté avant chaque départ' },
  { n: '02', title: 'Ponctualité', text: "Montage terminé avant l'arrivée du premier invité" },
  { n: '03', title: 'Discrétion', text: 'Une équipe présente, jamais dans le cadre' },
]

usePageSeo({
  title: 'À propos — TBS Distribution S.A.R.L',
  description:
    "Née à Agôè-Démakpoè, TBS équipe les grands moments de la vie togolaise depuis plus de dix ans. Quatre branches, un parc de plus de 900 références, 18 personnes sur le terrain.",
  path: '/a-propos',
  image: '/images/apropos-equipe.jpg',
})

useBreadcrumbSchema([{ name: 'À propos', path: '/a-propos' }])
</script>

<template>
  <div>
    <!-- En-tête photo pleine largeur -->
    <section class="relative min-h-[24rem] overflow-hidden bg-ink" style="height: min(62svh, 40rem)">
      <NuxtImg
        src="/images/apropos-equipe.jpg"
        alt="L'équipe TBS en plein montage de salle"
        preset="hero"
        preload
        :sizes="sizesFull"
        width="1920"
        height="1280"
        class="absolute inset-0 size-full object-cover"
      />
      <div
        class="absolute inset-0"
        style="background: linear-gradient(180deg, rgb(62 53 36 / 0.5) 0%, rgb(62 53 36 / 0.35) 45%, rgb(62 53 36 / 0.9) 100%)"
      />

      <div class="u-gutter absolute inset-0 flex flex-col justify-end gap-6 pb-[clamp(2rem,5vw,4rem)]">
        <span class="u-eyebrow text-cream/75">
          <span class="u-rule" />
          À propos
        </span>
        <h1 class="text-h1 text-white">
          TBS Distribution <span class="italic text-cream">S.A.R.L</span>
        </h1>
        <ul class="flex flex-wrap gap-x-6 gap-y-2">
          <li
            v-for="branch in data.branches"
            :key="branch.slug"
            class="flex items-center gap-2.5 text-[0.6875rem] uppercase tracking-[0.16em] text-white/70"
          >
            <span class="size-1.5 rounded-full" :style="{ background: branch.color === '#3E3524' ? '#FFEED6' : branch.color }" />
            {{ branch.name }}
          </li>
        </ul>
      </div>
    </section>

    <!-- Notre histoire -->
    <section class="u-gutter u-section grid gap-[clamp(1.75rem,4vw,4.5rem)] bg-white lg:grid-cols-[18rem_1fr]">
      <div v-reveal>
        <span class="u-eyebrow">
          <span class="u-rule" />
          Notre histoire
        </span>
      </div>

      <div v-reveal="90" class="max-w-[68ch] space-y-6">
        <p class="font-display text-[clamp(1.375rem,2.6vw,2rem)] leading-[1.35] text-ink">
          Née à Agôè-Démakpoè, TBS équipe les grands moments de la vie togolaise
          depuis plus de dix ans.
        </p>
        <p class="text-[0.9375rem] leading-[1.8]">
          Ce qui a commencé par quelques lots de chaises et de vaisselle prêtés
          au quartier est devenu un parc de plus de 900 références, entretenu
          pièce par pièce dans nos entrepôts. Nous servons aujourd'hui les
          familles, les traiteurs, les hôtels, les institutions et les
          entreprises du Grand Lomé.
        </p>
        <p class="text-[0.9375rem] leading-[1.8]">
          L'entreprise est aujourd'hui organisée en quatre branches :
          <strong class="font-normal text-ink">TBS Équipements</strong> pour la
          fourniture de matériels et d'équipements,
          <strong class="font-normal text-ink">TBS Events</strong> pour la
          location de matériel de réception et l'événementiel,
          <strong class="font-normal text-ink">TBS Études &amp; Conseils</strong>
          pour les études et prestations intellectuelles, et
          <strong class="font-normal text-ink">TBS Agro</strong> pour
          l'agriculture et l'agro-industrie.
        </p>
        <p class="text-[0.9375rem] leading-[1.8]">
          Notre métier ne s'arrête pas à la livraison : nous conseillons sur les
          volumes et les spécifications, montons et mettons en service,
          coordonnons les prestataires et assurons le suivi après réception. Un
          interlocuteur unique, du premier appel au dernier carton chargé.
        </p>
      </div>
    </section>

    <!-- Détail des quatre branches -->
    <section class="u-gutter u-section bg-sand">
      <UiSectionHead
        eyebrow="Organisation"
        title="Ce que fait"
        accent="chaque branche"
        align="start"
      />

      <div class="grid gap-px bg-ink/10 md:grid-cols-2">
        <article
          v-for="(branch, i) in data.branches"
          :key="branch.slug"
          v-reveal="(i % 2) * 70"
          class="flex flex-col bg-white p-[clamp(1.5rem,3vw,2.5rem)]"
        >
          <span class="u-eyebrow">
            <span class="size-[7px] rounded-full" :style="{ background: branch.color }" />
            Branche {{ String(branch.index).padStart(2, '0') }}
          </span>

          <h3 class="mt-3 text-h3">{{ branch.name }}</h3>
          <p class="mt-1.5 text-xs uppercase tracking-[0.1em] text-gold">{{ branch.tagline }}</p>

          <dl class="mt-7 flex-1 divide-y divide-ink/8 border-t border-ink/8">
            <div
              v-for="row in branchDetails[branch.slug]"
              :key="row.label"
              class="grid gap-1 py-3.5 sm:grid-cols-[8rem_1fr] sm:gap-4"
            >
              <dt class="text-[0.6875rem] uppercase tracking-[0.16em] text-ink-mute">
                {{ row.label }}
              </dt>
              <dd class="text-sm leading-[1.65]">{{ row.value }}</dd>
            </div>
          </dl>

          <NuxtLink :to="`/services?branche=${branch.slug}`" class="u-link-underline mt-8 self-start">
            Voir les prestations<span class="sr-only"> de {{ branch.name }}</span>
          </NuxtLink>
        </article>
      </div>
    </section>

    <!-- Valeurs -->
    <section class="u-gutter u-section grid items-center gap-[clamp(1.75rem,4vw,4.5rem)] bg-white lg:grid-cols-2">
      <div v-reveal class="relative aspect-4/5 overflow-hidden bg-shell">
        <NuxtImg
          src="/images/apropos-entrepot.jpg"
          alt="Entrepôt TBS — matériel rangé et contrôlé"
          preset="card"
          loading="lazy"
          :sizes="sizesHalfLg"
          width="1000"
          height="1250"
          class="size-full object-cover"
        />
      </div>

      <div v-reveal="110">
        <span class="u-eyebrow">
          <span class="u-rule" />
          Nos valeurs
        </span>
        <h2 class="mt-4 max-w-[16ch] text-h2">
          Trois engagements <span class="italic">non négociables</span>
        </h2>

        <ul class="mt-10 divide-y divide-ink/10 border-y border-ink/10">
          <li v-for="value in values" :key="value.n" class="flex gap-6 py-6">
            <span class="font-display text-2xl text-gold">{{ value.n }}</span>
            <div>
              <h3 class="font-sans text-base font-normal tracking-wide text-ink">
                {{ value.title }}
              </h3>
              <p class="mt-1.5 max-w-[42ch] text-sm leading-[1.7]">{{ value.text }}</p>
            </div>
          </li>
        </ul>
      </div>
    </section>

    <UiStatRow :items="stats" />

    <SharedCtaBanner />
  </div>
</template>
