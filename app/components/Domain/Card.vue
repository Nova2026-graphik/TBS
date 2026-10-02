<script setup lang="ts">
import type { Equipment } from '#shared/types'

/**
 * Carte d'une référence dans la grille d'un domaine.
 *
 * Sans cadre ni fond : l'objet détouré est posé sur le blanc de la page, et
 * c'est lui qui fait la composition. Une bordure autour de chaque vignette
 * aurait rendu la grille à un tableau de fiches ; la maquette s'en passe, et
 * l'alignement est tenu par une boîte 4:5 invisible plutôt que par un trait.
 *
 * Cinq rendus selon `kind`, et le cas le plus instructif est `ghost` : treize
 * références n'ont pas encore de visuel. Elles gardent leur carte, avec le
 * filigrane du domaine et « Visuel à venir » — dire qu'il manque une image
 * vaut mieux que combler avec une image empruntée, et mieux qu'un trou dans
 * la grille qui laisserait croire à un catalogue plus court qu'il n'est.
 *
 * La carte entière est un bouton : la fiche rapide s'ouvre au clic comme à
 * Entrée, sans qu'il faille viser un lien à l'intérieur.
 */
const props = defineProps<{
  reference: Equipment
  /** Vignette du domaine, filigrane des références sans visuel. */
  thumbnail?: string
  /** Rendu en médaillon rond — le domaine Agro n'a que des photographies. */
  medallion?: boolean
  /** Index dans la grille : au-delà du premier écran, le chargement attend. */
  index: number
}>()

defineEmits<{ open: [] }>()

const survol = ref(false)

/** Les quatre premières cartes sont au-dessus de la ligne de flottaison. */
const chargement = computed(() => (props.index < 4 ? 'eager' : 'lazy'))

const sizesCard = SIZES_QUARTER
</script>

<template>
  <button
    type="button"
    class="group block w-full text-left"
    @click="$emit('open')"
    @mouseenter="survol = true"
    @mouseleave="survol = false"
    @focusin="survol = true"
    @focusout="survol = false"
  >
    <!--
      La boîte porte le rapport, jamais l'image : un objet détouré n'a pas de
      proportion commune avec ses voisins, et c'est la boîte qui les aligne.
    -->
    <div
      class="relative overflow-hidden"
      :class="medallion ? 'aspect-square' : 'aspect-4/5'"
    >
      <!-- Objet détouré : posé sur le blanc, avec son ombre au sol. -->
      <template v-if="reference.kind === 'cut' || reference.kind === 'png'">
        <div
          class="absolute inset-0 flex items-center justify-center p-[8%] transition-transform duration-500 ease-out group-hover:-translate-y-1 group-hover:scale-[1.04]"
        >
          <NuxtImg
            v-if="reference.image"
            :src="reference.image"
            alt=""
            preset="card"
            :loading="chargement"
            :sizes="sizesCard"
            width="600"
            height="750"
            class="max-h-full w-auto max-w-full object-contain transition-opacity duration-500"
            :class="survol && reference.imageHover ? 'opacity-0' : 'opacity-100'"
          />
          <!--
            Le second visuel est superposé et révélé par fondu : vingt et une
            références en ont un — l'objet vu sous un autre angle, ou ouvert.
          -->
          <NuxtImg
            v-if="reference.imageHover"
            :src="reference.imageHover"
            alt=""
            preset="card"
            loading="lazy"
            :sizes="sizesCard"
            width="600"
            height="750"
            class="absolute inset-0 m-auto max-h-full w-auto max-w-full object-contain p-[8%] transition-opacity duration-500"
            :class="survol ? 'opacity-100' : 'opacity-0'"
          />
        </div>
        <!--
          Ombre au sol : une ellipse floue, pas une ombre portée. Un objet
          détouré sans appui flotte ; celle-ci le pose sans dessiner de cadre.
        -->
        <div
          aria-hidden="true"
          class="pointer-events-none absolute inset-x-[18%] bottom-[9%] h-2.5 rounded-[50%] bg-ink/18 blur-[7px] transition-all duration-500 group-hover:inset-x-[22%] group-hover:bg-ink/12"
        />
      </template>

      <!-- Médaillon rond : les photographies Agro ne se détourent pas. -->
      <template v-else-if="reference.kind === 'med'">
        <div class="absolute inset-0 flex items-center justify-center p-[6%]">
          <div class="size-full overflow-hidden rounded-full shadow-[0_10px_26px_-12px_rgba(0,0,0,0.45)]">
            <NuxtImg
              v-if="reference.image"
              :src="reference.image"
              alt=""
              preset="card"
              :loading="chargement"
              :sizes="sizesCard"
              width="600"
              height="600"
              class="size-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.06]"
            />
          </div>
        </div>
      </template>

      <!-- Photographie non détourée : sur fond `shell`, et signalée telle. -->
      <template v-else-if="reference.kind === 'photo'">
        <div class="absolute inset-0 bg-shell">
          <NuxtImg
            v-if="reference.image"
            :src="reference.image"
            alt=""
            preset="card"
            :loading="chargement"
            :sizes="sizesCard"
            width="600"
            height="750"
            class="size-full object-contain transition-transform duration-500 ease-out group-hover:scale-[1.03]"
          />
        </div>
        <span
          class="absolute left-0 top-0 bg-ink/80 px-2 py-1 text-[0.5625rem] uppercase tracking-[0.14em] text-cream"
        >
          {{ $t('domain.card.toCutOut') }}
        </span>
      </template>

      <!--
        Visuel à venir. Le filigrane reprend la vignette du domaine : la carte
        reste lisible comme appartenant à cette famille, sans emprunter l'image
        d'un autre produit.
      -->
      <template v-else>
        <div class="absolute inset-0 flex flex-col items-center justify-center gap-3">
          <div
            v-if="medallion"
            aria-hidden="true"
            class="size-[62%] rounded-full border border-dashed border-ink/25"
          />
          <NuxtImg
            v-else-if="thumbnail"
            :src="thumbnail"
            alt=""
            preset="card"
            loading="lazy"
            :sizes="sizesCard"
            width="400"
            height="400"
            class="size-[58%] object-contain opacity-[0.14]"
          />
          <span class="text-[0.5625rem] uppercase tracking-[0.16em] text-ink-mute">
            {{ $t('domain.card.comingSoon') }}
          </span>
        </div>
      </template>

      <!--
        Le visuel montre un modèle équivalent, pas l'article livré. Le dire ici
        coûte une étiquette ; ne pas le dire coûte une réclamation.
      -->
      <span
        v-if="reference.nonContractual"
        class="absolute left-0 top-0 bg-sand/94 px-2 py-1 text-[0.5625rem] uppercase tracking-[0.14em] text-ink-mute"
      >
        {{ $t('domain.card.nonContractual') }}
      </span>

      <!--
        Barre « Aperçu ». Elle monte du bas au survol sur grand écran ; sur
        tactile, où il n'y a pas de survol, elle reste visible — sans quoi rien
        n'indiquerait que la carte s'ouvre.
      -->
      <span
        class="absolute inset-x-0 bottom-0 bg-sand/94 py-2 text-center text-[0.5625rem] uppercase tracking-[0.2em] text-ink transition-transform duration-400 ease-out md:translate-y-full md:group-hover:translate-y-0 md:group-focus-visible:translate-y-0"
      >
        {{ $t('domain.card.preview') }} <span aria-hidden="true">↗</span>
      </span>
    </div>

    <p
      v-if="reference.family"
      class="mt-3.5 text-[0.5625rem] uppercase tracking-[0.18em] text-ink-mute"
    >
      {{ reference.family }}
    </p>
    <p class="mt-1 font-display text-[1.09375rem] leading-[1.3] text-ink">
      {{ reference.name }}
    </p>

    <!-- Les caractéristiques ne se filtrent pas : elles se lisent. -->
    <span v-if="reference.specs.length" class="mt-2 flex flex-wrap gap-1.5">
      <span
        v-for="spec in reference.specs"
        :key="spec"
        class="border border-ink/15 px-2 py-0.5 text-[0.6875rem] leading-[1.5] tracking-[0.04em] text-ink-mute"
      >
        {{ spec }}
      </span>
    </span>
  </button>
</template>
