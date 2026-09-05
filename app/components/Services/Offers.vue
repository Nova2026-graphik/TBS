<script setup lang="ts">
/**
 * Les trois formules TBS Events.
 *
 * Ajout par rapport à la maquette : la formule la plus demandée est
 * réellement mise en avant (fond sombre, badge) au lieu d'être une carte
 * identique aux autres avec un simple libellé différent.
 */
const offers = EVENT_OFFERS
</script>

<template>
  <section class="u-gutter u-section bg-sand">
    <UiSectionHead
      eyebrow="Formules"
      dot="#E8A07C"
      title="Trois niveaux"
      accent="d'accompagnement"
      align="start"
    />

    <div class="grid gap-[clamp(1rem,2vw,1.75rem)] md:grid-cols-3">
      <article
        v-for="(offer, i) in offers"
        :key="offer.title"
        v-reveal="i * 90"
        class="flex flex-col p-[clamp(1.5rem,3vw,2.5rem)] transition-transform duration-600 ease-[var(--ease-out-expo)] hover:-translate-y-1.5"
        :class="
          offer.featured
            ? 'bg-ink text-white/75 shadow-lift'
            : 'border border-ink/12 bg-white'
        "
      >
        <span
          class="text-[0.6875rem] uppercase tracking-[0.2em]"
          :class="offer.featured ? 'text-peach' : 'text-ink-mute'"
        >
          {{ offer.label }}
        </span>

        <h3 class="mt-3.5 text-[clamp(1.375rem,2.2vw,1.875rem)]" :class="offer.featured ? 'text-white' : ''">
          {{ offer.title }}
        </h3>

        <p class="mt-4 flex-1 text-[0.9375rem] leading-[1.72]">{{ offer.description }}</p>

        <p
          class="mt-7 border-t pt-5 text-[0.6875rem] uppercase tracking-[0.16em]"
          :class="offer.featured ? 'border-white/15 text-cream' : 'border-ink/10 text-gold'"
        >
          {{ offer.note }}
        </p>
      </article>
    </div>
  </section>
</template>
