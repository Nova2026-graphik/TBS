<script setup lang="ts">
import type { BranchSlug } from '#shared/types'

/**
 * Page Services — les quatre branches en onglets.
 *
 * Amélioration clé : la branche active vit dans l'URL (`?branche=events`)
 * et non dans un state local. Un lien vers une branche précise est donc
 * partageable, indexable, et le bouton « précédent » du navigateur
 * fonctionne comme l'utilisateur s'y attend.
 */
const route = useRoute()
const router = useRouter()
const { data } = await useSiteContent()

const tabs = BRANCH_TABS
const VALID = tabs.map((t) => t.slug) as readonly string[]

const active = computed<BranchSlug>(() => {
  const raw = route.query.branche
  const value = Array.isArray(raw) ? raw[0] : raw
  return (typeof value === 'string' && VALID.includes(value) ? value : 'equipements') as BranchSlug
})

function select(slug: string) {
  router.replace({ query: { ...route.query, branche: slug } })
}

const activeBranch = computed(() => data.value.branches.find((b) => b.slug === active.value))
const activeBlocks = computed(() => data.value.services.filter((s) => s.branch === active.value))
const activeProcess = computed(() => PROCESS_BY_BRANCH[active.value]!)
const accent = computed(() => activeBranch.value?.color ?? '#827148')

/** Onglet : chip pleine quand actif, contour discret sinon. */
function chipClass(isActive: boolean) {
  return isActive
    ? 'bg-ink border-ink text-white'
    : 'bg-transparent border-ink/18 text-ink-soft hover:border-gold hover:text-gold'
}

usePageSeo({
  title: 'Nos services — équipements, réception, études, agro',
  description:
    'TBS Équipements fournit et installe. TBS Events loue et organise. TBS Études & Conseils accompagne. TBS Agro cultive et transforme. Quatre branches, un seul interlocuteur à Lomé.',
  path: '/services',
  image: '/og-services.jpg',
})

useBreadcrumbSchema([{ name: 'Nos services', path: '/services' }])
</script>

<template>
  <div>
    <UiPageHero
      eyebrow="Nos services"
      title="Quatre branches,"
      accent="un seul interlocuteur"
      lead="TBS Équipements fournit et installe. TBS Events loue et organise. TBS Études & Conseils accompagne. TBS Agro cultive et transforme. Choisissez la branche qui vous concerne."
    >
      <!-- Onglets de branche : rôle tablist explicite, navigation clavier
           assurée par les liens natifs. -->
      <div class="mt-[clamp(1.75rem,4vw,3rem)] flex flex-wrap gap-2.5" role="tablist" aria-label="Branches d'activité">
        <button
          v-for="tab in tabs"
          :key="tab.slug"
          type="button"
          role="tab"
          :aria-selected="active === tab.slug"
          class="flex items-center gap-2.5 rounded-full border px-5 py-2.5 text-[0.6875rem] uppercase tracking-[0.16em] transition-colors duration-400"
          :class="chipClass(active === tab.slug)"
          @click="select(tab.slug)"
        >
          <span
            class="size-1.5 rounded-full"
            :style="{ background: active === tab.slug ? '#fff' : tab.color }"
          />
          {{ tab.label }}
        </button>
      </div>
    </UiPageHero>

    <!-- Le contenu change de clé avec la branche : Vue remonte le bloc et
         la transition rejoue, ce qui signale visuellement le changement. -->
    <Transition
      mode="out-in"
      enter-active-class="transition-[opacity,transform] duration-400 ease-[var(--ease-out-expo)]"
      enter-from-class="opacity-0 translate-y-2"
      leave-active-class="transition-opacity duration-200"
      leave-to-class="opacity-0"
    >
      <div :key="active">
        <section class="u-gutter u-section flex flex-col gap-[clamp(3rem,7vw,7rem)] bg-white">
          <ServicesBlock
            v-for="(block, i) in activeBlocks"
            :key="block.title"
            :block="block"
            :reversed="i % 2 === 1"
            :accent="accent"
          />
        </section>

        <SharedProcessSteps
          :eyebrow="activeProcess.eyebrow"
          :dot="accent"
          :title="activeProcess.title"
          :accent="activeProcess.titleAccent"
          :steps="activeProcess.steps"
          :footnote="activeProcess.footnote"
          :tone="active === 'events' ? 'light' : 'sand'"
        />

        <ServicesOffers v-if="active === 'events'" />
      </div>
    </Transition>

    <SharedCtaBanner />
  </div>
</template>
