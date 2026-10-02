<script setup lang="ts">
import type { Branch, BranchSlug, FaqItem } from '#shared/types'

/**
 * Questions fréquentes — `proposition-faq.png`.
 *
 * Trois choses que la liste d'avant ne faisait pas :
 *
 *  - **chercher.** Un champ dans le bandeau filtre au fil de la frappe, dans
 *    la question et la réponse, accents et casse ignorés — « delai » trouve
 *    « délai ». Sans résultat, on le dit et on propose de poser la question ;
 *  - **compter par branche.** La colonne de gauche liste les quatre branches
 *    avec leur nombre de questions, calculé ; « — » quand il n'y en a pas.
 *    Cliquer filtre. Sur téléphone, la colonne devient une ligne défilante ;
 *  - **dire ce qui manque.** Études & Conseils et Agro Business n'ont pas
 *    encore de question publiée : un encart le dit, avec « Poser une
 *    question », plutôt qu'une section vide ou une question inventée.
 *
 * Les huit questions sont celles du site, mot pour mot, groupées par
 * branche ; la première est ouverte pour que la page ne s'ouvre pas sur un
 * mur de titres.
 */
const props = defineProps<{
  items: FaqItem[]
  branches: Branch[]
  /** Le texte du champ de recherche, qui vit dans le bandeau de la page. */
  search?: string
}>()

const { t } = useI18n()
const info = useSiteInfo()

const recherche = computed(() => props.search ?? '')
const brancheActive = ref<BranchSlug | null>(null)

/** Effectifs par branche, comptés sur toutes les questions — pas sur les filtrées. */
const effectifs = computed(() => effectifsPar(props.items, q => q.branch))

const filtrees = computed(() => props.items.filter(q =>
  (!brancheActive.value || q.branch === brancheActive.value)
  && (!recherche.value.trim()
    || contientTexte(q.question, recherche.value)
    || contientTexte(q.answer, recherche.value)),
))

/** Les groupes, dans l'ordre des branches ; seuls ceux qui ont des questions. */
const groupes = computed(() =>
  props.branches
    .map(b => ({ branche: b, items: filtrees.value.filter(q => q.branch === b.slug) }))
    .filter(g => g.items.length > 0),
)

/** Les branches sans aucune question publiée — l'encart les nomme. */
const sansQuestion = computed(() =>
  props.branches.filter(b => !(effectifs.value[b.slug] ?? 0)),
)

// Premier item ouvert par défaut : la page ne s'ouvre pas sur un mur de titres.
const open = ref<string | null>(props.items[0]?.id ?? null)

function toggle(id: string) {
  open.value = open.value === id ? null : id
}

/** Sous-titre d'un groupe : une ligne qui dit ce qu'il couvre. */
function sousTitre(slug: BranchSlug) {
  return t(`faq.groupSub.${slug}`)
}
</script>

<template>
  <div>
    <div class="grid items-start gap-x-14 gap-y-8 lg:grid-cols-[15.625rem_1fr]">
      <!-- ── Par branche ─────────────────────────────────────────────── -->
      <aside class="lg:sticky lg:top-24">
        <p class="mb-2.5 text-[0.625rem] uppercase tracking-[0.2em] text-ink-mute max-lg:sr-only">{{ $t('faq.byBranch') }}</p>
        <!-- Sous `lg`, une ligne défilante de pastilles au-dessus des questions. -->
        <div
          class="flex gap-1.5 max-lg:-mx-[var(--spacing-gutter)] max-lg:snap-x max-lg:overflow-x-auto max-lg:px-[var(--spacing-gutter)] max-lg:pb-1 lg:flex-col lg:gap-0"
          role="group"
          :aria-label="$t('faq.byBranch')"
        >
          <button
            type="button"
            class="flex min-h-11 shrink-0 snap-start items-center justify-between gap-3 whitespace-nowrap border-l-2 px-3 py-3 text-left text-[0.84375rem] transition-colors duration-300 max-lg:border max-lg:border-ink/15"
            :class="brancheActive === null ? 'border-l-gold bg-sand text-ink max-lg:border-ink' : 'border-l-transparent text-ink-soft hover:text-ink'"
            :aria-pressed="brancheActive === null"
            @click="brancheActive = null"
          >
            <span>{{ $t('faq.all') }}</span>
            <span class="text-[0.6875rem] text-ink-mute">{{ items.length }}</span>
          </button>
          <button
            v-for="b in branches"
            :key="b.slug"
            type="button"
            class="flex min-h-11 shrink-0 snap-start items-center justify-between gap-3 whitespace-nowrap border-l-2 px-3 py-3 text-left text-[0.84375rem] transition-colors duration-300 max-lg:border max-lg:border-ink/15"
            :class="brancheActive === b.slug ? 'border-l-gold bg-sand text-ink max-lg:border-ink' : 'border-l-transparent text-ink-soft hover:text-ink'"
            :aria-pressed="brancheActive === b.slug"
            :disabled="!(effectifs[b.slug] ?? 0)"
            @click="brancheActive = b.slug"
          >
            <span class="flex items-center gap-2.5">
              <span aria-hidden="true" class="size-[7px] rounded-full" :style="{ background: brandColor(b.color) }" />
              {{ b.name }}
            </span>
            <span class="text-[0.6875rem] text-ink-mute">{{ effectifs[b.slug] || '—' }}</span>
          </button>
        </div>

        <div class="mt-5 bg-ink p-5 text-cream max-lg:hidden">
          <p class="font-display text-[1.375rem] leading-[1.15] text-white">{{ $t('faq.helpTitle') }}</p>
          <p class="mb-3.5 mt-1.5 text-[0.8125rem] text-cream/80">{{ $t('faq.helpBody') }}</p>
          <a
            :href="info.whatsappUrl"
            target="_blank"
            rel="noopener"
            class="inline-flex min-h-11 items-center bg-[#25d366] px-5 py-3 text-[0.6875rem] uppercase tracking-[0.18em] text-white transition-opacity hover:opacity-90"
          >
            {{ $t('common.whatsapp') }}
          </a>
        </div>
      </aside>

      <!-- ── Les questions ───────────────────────────────────────────── -->
      <div class="min-w-0">
        <section v-for="groupe in groupes" :key="groupe.branche.slug" class="mb-10">
          <h2 class="flex items-center gap-3 font-display text-[2rem] leading-tight text-ink">
            <span aria-hidden="true" class="size-2 rounded-full" :style="{ background: brandColor(groupe.branche.color) }" />
            {{ groupe.branche.name }}
          </h2>
          <p class="mb-[1.125rem] mt-1.5 text-[0.8125rem] text-ink-mute">{{ sousTitre(groupe.branche.slug) }}</p>

          <ul class="divide-y divide-ink/14 border-y border-ink/14">
            <li v-for="item in groupe.items" :key="item.id">
              <h3>
                <button
                  :id="`${item.id}-btn`"
                  type="button"
                  class="flex w-full items-center justify-between gap-6 py-[1.125rem] pl-1 text-left transition-colors duration-400 hover:text-gold"
                  :aria-expanded="open === item.id"
                  :aria-controls="`${item.id}-panel`"
                  @click="toggle(item.id)"
                >
                  <span class="text-base text-ink">{{ item.question }}</span>
                  <span aria-hidden="true" class="w-8 text-center text-[1.375rem] font-light text-ink-mute">
                    {{ open === item.id ? '−' : '+' }}
                  </span>
                </button>
              </h3>
              <div
                v-show="open === item.id"
                :id="`${item.id}-panel`"
                role="region"
                :aria-labelledby="`${item.id}-btn`"
                class="pb-5 pl-1"
              >
                <p class="max-w-[66ch] text-[0.90625rem] leading-[1.7] text-ink-soft">{{ item.answer }}</p>
              </div>
            </li>
          </ul>
        </section>

        <!-- Aucune question ne correspond à la recherche. -->
        <div v-if="!groupes.length" class="border border-dashed border-ink/30 px-6 py-[1.375rem]">
          <p class="font-display text-[1.375rem] text-ink">{{ $t('faq.noMatch') }}</p>
          <p class="mt-1 text-sm text-ink-soft">{{ $t('faq.noMatchBody') }}</p>
          <UiButton to="/contact" variant="ghost" class="mt-4">{{ $t('faq.ask') }}</UiButton>
        </div>

        <!--
          Les branches sans question. Un encart, pas une section vide ni une
          question inventée ; et le lien part avec la première branche
          préremplie.
        -->
        <section v-if="sansQuestion.length && !recherche.trim() && (!brancheActive || sansQuestion.some(b => b.slug === brancheActive))">
          <h2 class="flex flex-wrap items-center gap-3 font-display text-[2rem] leading-tight text-ink">
            <template v-for="(b, i) in sansQuestion" :key="b.slug">
              <span v-if="i" aria-hidden="true">·</span>
              <span class="flex items-center gap-3">
                <span aria-hidden="true" class="size-2 rounded-full" :style="{ background: brandColor(b.color) }" />
                {{ b.name.replace('TBS ', '') }}
              </span>
            </template>
          </h2>
          <p class="mb-[1.125rem] mt-1.5 text-[0.8125rem] text-ink-mute">{{ $t('faq.groupSub.empty') }}</p>
          <div class="flex flex-wrap items-center justify-between gap-5 border border-dashed border-ink/30 px-6 py-[1.375rem]">
            <div>
              <p class="font-display text-[1.375rem] text-ink">{{ $t('faq.emptyTitle') }}</p>
              <p class="mt-1 text-sm text-ink-soft">{{ $t('faq.emptyBody') }}</p>
            </div>
            <UiButton :to="{ path: '/contact', query: { branche: versUrl(sansQuestion[0]!.slug) } }" variant="ghost">
              {{ $t('faq.ask') }}
            </UiButton>
          </div>
        </section>
      </div>
    </div>
  </div>
</template>
