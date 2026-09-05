<script setup lang="ts">
import type { FaqItem } from '#shared/types'

/**
 * Accordéon FAQ.
 *
 * Corrections d'accessibilité par rapport à la maquette, où les réponses
 * étaient masquées par l'attribut `hidden` sans lien avec leur bouton :
 *  - `aria-expanded` + `aria-controls` relient bouton et panneau ;
 *  - le panneau porte `role="region"` et `aria-labelledby` ;
 *  - l'ouverture/fermeture est animée par `grid-template-rows`, ce qui
 *    évite de coder en dur une hauteur maximale approximative.
 *
 * Les questions sont regroupées par branche, comme dans l'original.
 */
const props = defineProps<{ items: FaqItem[] }>()

// Premier item ouvert par défaut : la page ne s'ouvre pas sur un mur de titres.
const open = ref<string | null>(props.items[0]?.id ?? null)

function toggle(id: string) {
  open.value = open.value === id ? null : id
}

/** Regroupe en conservant l'ordre d'apparition des groupes. */
const groups = computed(() => {
  const map = new Map<string, FaqItem[]>()
  for (const item of props.items) {
    const bucket = map.get(item.group)
    if (bucket) bucket.push(item)
    else map.set(item.group, [item])
  }
  return [...map.entries()].map(([label, items]) => ({ label, items }))
})
</script>

<template>
  <!-- Colonne bornée : au-delà de ~64rem, la ligne question–bouton devient
       trop longue pour relier confortablement l'intitulé à son « + ». -->
  <div class="mx-auto flex max-w-4xl flex-col gap-[clamp(2rem,4vw,3.5rem)]">
    <section v-for="group in groups" :key="group.label">
      <h2 class="u-eyebrow mb-5">
        <span class="u-rule" />
        {{ group.label }}
      </h2>

      <ul class="divide-y divide-ink/10 border-y border-ink/10">
        <li v-for="item in group.items" :key="item.id">
          <h3>
            <button
              :id="`${item.id}-btn`"
              type="button"
              class="flex w-full items-start justify-between gap-6 py-6 text-left transition-colors duration-400 hover:text-gold"
              :aria-expanded="open === item.id"
              :aria-controls="`${item.id}-panel`"
              @click="toggle(item.id)"
            >
              <span class="max-w-[52ch] text-[clamp(1rem,1.6vw,1.1875rem)] text-ink">
                {{ item.question }}
              </span>
              <span
                class="mt-1 shrink-0 font-display text-2xl leading-none text-gold transition-transform duration-500 ease-[var(--ease-out-expo)]"
                :class="open === item.id ? 'rotate-45' : ''"
                aria-hidden="true"
              >+</span>
            </button>
          </h3>

          <div
            :id="`${item.id}-panel`"
            role="region"
            :aria-labelledby="`${item.id}-btn`"
            class="grid transition-[grid-template-rows] duration-500 ease-[var(--ease-out-expo)]"
            :style="{ gridTemplateRows: open === item.id ? '1fr' : '0fr' }"
          >
            <div class="overflow-hidden">
              <p class="max-w-[68ch] pb-7 text-[0.9375rem] leading-[1.8]">
                {{ item.answer }}
              </p>
            </div>
          </div>
        </li>
      </ul>
    </section>
  </div>
</template>
