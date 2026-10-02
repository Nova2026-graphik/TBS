<script setup lang="ts">
import type { FormatReception, LigneLibre } from '~/utils/materielReception'

/**
 * Calculateur de matériel de réception.
 *
 * L'issue #24 le désigne comme le meilleur investissement de la rubrique, et
 * pour une raison simple : c'est le seul contenu du site qui rend un service
 * avant la vente. On saisit un nombre d'invités, on obtient une liste
 * chiffrée, et un bouton transforme cette liste en demande de devis
 * pré-remplie — sans rien recopier.
 *
 * **La liste est modifiable.** Le barème donne un point de départ, pas un
 * verdict : le lieu impose parfois des tables de huit, la famille apporte sa
 * vaisselle, un client sait qu'il lui faut deux groupes et pas un. Chaque
 * quantité s'ajuste, chaque ligne se retire, et ce que le barème ignore
 * s'ajoute. Rien n'est perdu pour autant — une ligne modifiée garde sa valeur
 * calculée et y revient d'un clic.
 *
 * Le composant vit dans `app/components/content/` : il est ainsi utilisable
 * directement depuis un article Markdown, en `:calculateur-materiel`.
 */
const { t } = useI18n()

const invites = ref(200)
const format = ref<FormatReception>('assis')
const soiree = ref(true)

const FORMATS = computed<{ valeur: FormatReception, libelle: string, detail: string }[]>(() => [
  { valeur: 'assis', libelle: t('calculator.formats.assis'), detail: t('calculator.formats.assisDetail') },
  { valeur: 'mixte', libelle: t('calculator.formats.mixte'), detail: t('calculator.formats.mixteDetail') },
  { valeur: 'cocktail', libelle: t('calculator.formats.cocktail'), detail: t('calculator.formats.cocktailDetail') },
])

/** Bornes de saisie : en deçà on n'a pas besoin de nous, au-delà on appelle. */
const MIN = 10
const MAX = 2000

const invitesValides = computed(() => Math.min(Math.max(invites.value || 0, 0), MAX))
const trop = computed(() => (invites.value || 0) > MAX)
const peu = computed(() => (invites.value || 0) > 0 && (invites.value || 0) < MIN)

const options = computed(() => ({
  invites: invitesValides.value,
  format: format.value,
  soiree: soiree.value,
}))

/**
 * Ce que le barème calcule, avant toute intervention du visiteur — puis
 * résolu dans la langue de la page : le barème ne rend que des clés.
 */
const bareme = computed(() => resoudreLignes(calculerMateriel(options.value), t))

/* ── Ajustements ─────────────────────────────────────────────────────────── */

const quantites = ref<Record<string, number>>({})
const retirees = ref<string[]>([])
const libres = ref<LigneLibre[]>([])

const ajustements = computed(() => ({
  quantites: quantites.value,
  retirees: retirees.value,
}))

/**
 * Les ajustements survivent au changement du nombre d'invités : si le
 * visiteur a écrit « 12 tables », c'est qu'il en veut douze, et les recalculer
 * en douce effacerait sa décision. L'écart avec le barème reste visible sur la
 * ligne, et « Rétablir » le referme.
 */
const lignes = computed(() =>
  appliquerAjustements(bareme.value, ajustements.value, libres.value, t('calculator.rules.libre')),
)

const modifie = computed(() => aDesAjustements(ajustements.value, libres.value))

function ajuster(cle: string, valeur: unknown) {
  quantites.value = { ...quantites.value, [cle]: normaliserQuantite(valeur) }
}

/** Incrément proportionnel : au-delà de la centaine, l'unité ne sert plus. */
function pas(quantite: number): number {
  if (quantite >= 500) return 25
  if (quantite >= 100) return 10
  return 1
}

function decaler(cle: string, quantite: number, sens: 1 | -1) {
  ajuster(cle, quantite + sens * pas(quantite))
}

function retablir(cle: string) {
  const { [cle]: _, ...reste } = quantites.value
  quantites.value = reste
}

function retirer(cle: string) {
  if (cle.startsWith('libre-')) {
    libres.value = libres.value.filter(ligne => ligne.cle !== cle)
    return
  }
  retirees.value = [...retirees.value, cle]
  retablir(cle)
}

function toutRetablir() {
  quantites.value = {}
  retirees.value = []
  libres.value = []
}

/* ── Article ajouté par le visiteur ──────────────────────────────────────── */

const nouveauLibelle = ref('')
const nouvelleQuantite = ref<number | null>(null)
const nouvelleUnite = ref(t('calculator.units.pieces'))

const UNITES = computed(() =>
  (['pieces', 'tables', 'sqm', 'sets', 'lots'] as const).map(cle => t(`calculator.units.${cle}`)),
)

/** Un article sans nom ne se chiffre pas ; le reste a des valeurs par défaut. */
const peutAjouter = computed(() => nouveauLibelle.value.trim().length >= 2)

let compteur = 0

function ajouterArticle() {
  if (!peutAjouter.value) return

  compteur += 1
  libres.value = [...libres.value, {
    cle: `libre-${compteur}`,
    libelle: nouveauLibelle.value.trim().slice(0, 60),
    quantite: normaliserQuantite(nouvelleQuantite.value ?? 1) || 1,
    unite: nouvelleUnite.value,
  }]

  nouveauLibelle.value = ''
  nouvelleQuantite.value = null
}

/* ── Devis ───────────────────────────────────────────────────────────────── */

/**
 * Lien vers le formulaire de devis, inventaire compris. Le formulaire lit ces
 * paramètres au montage — cf. `app/components/Contact/Form.vue`.
 */
// Chaîne plutôt qu'objet de route : `UiButton.to` est typé `string`, et
// `NuxtLink` lit la chaîne de requête d'une URL relative sans difficulté.
const lienDevis = computed(() => {
  const query = new URLSearchParams({
    branche: versUrl('events'),
    invites: String(invitesValides.value),
    message: messageDevis(options.value, lignes.value, t),
  })
  return `/contact?${query}`
})

const CHAMP
  = 'w-full border-0 border-b border-ink/20 bg-transparent pb-3 pt-2 text-[0.9375rem] text-ink transition-colors duration-400 outline-none focus:border-gold'
const PASTILLE
  = 'flex size-9 shrink-0 items-center justify-center rounded-full border border-ink/18 text-ink-soft transition-colors duration-400 hover:border-gold hover:text-gold focus-visible:border-gold disabled:pointer-events-none disabled:opacity-35'
</script>

<template>
  <section class="my-10 border border-ink/12 bg-sand p-[clamp(1.25rem,3vw,2.25rem)]">
    <h2 class="text-h3">{{ $t('calculator.title') }}</h2>
    <p class="mt-3 max-w-[60ch] text-[0.9375rem] leading-[1.75] text-ink-soft">
      {{ $t('calculator.intro') }}
      <strong class="font-normal text-ink">{{ $t('calculator.introStrong') }}</strong>{{ $t('calculator.introEnd') }}
    </p>

    <div class="mt-8 grid gap-7 sm:grid-cols-2">
      <div>
        <label class="text-[0.6875rem] uppercase tracking-[0.18em] text-ink-mute" for="calc-invites">
          {{ $t('calculator.guests') }}
        </label>
        <input
          id="calc-invites"
          v-model.number="invites"
          type="number"
          :min="MIN"
          :max="MAX"
          inputmode="numeric"
          :class="CHAMP"
        >
        <p v-if="peu" class="mt-2 text-xs text-ink-mute">
          {{ $t('calculator.tooFew', { n: MIN }) }}
        </p>
        <p v-else-if="trop" class="mt-2 text-xs text-ink-mute">
          {{ $t('calculator.tooMany', { n: MAX }) }}
        </p>
      </div>

      <div>
        <span class="text-[0.6875rem] uppercase tracking-[0.18em] text-ink-mute">{{ $t('calculator.format') }}</span>
        <div class="mt-3 flex flex-wrap gap-2">
          <button
            v-for="option in FORMATS"
            :key="option.valeur"
            type="button"
            class="rounded-full border px-4 py-2.5 text-[0.6875rem] uppercase tracking-[0.14em] transition-colors duration-400"
            :class="format === option.valeur
              ? 'border-ink bg-ink text-white'
              : 'border-ink/18 text-ink-soft hover:border-gold hover:text-gold'"
            :aria-pressed="format === option.valeur"
            :title="option.detail"
            @click="format = option.valeur"
          >
            {{ option.libelle }}
          </button>
        </div>
      </div>
    </div>

    <label class="mt-6 flex items-center gap-3 text-[0.9375rem] text-ink-soft">
      <input v-model="soiree" type="checkbox" class="size-4 accent-gold">
      {{ $t('calculator.evening') }}
    </label>

    <!-- `aria-live` : la liste change à chaque frappe, l'annonce doit suivre
         sans interrompre la saisie. -->
    <div class="mt-9" aria-live="polite">
      <div
        v-if="lignes.length"
        class="flex items-baseline justify-between gap-4 border-b border-ink/15 pb-3 text-[0.6875rem] uppercase tracking-[0.16em] text-ink-mute"
      >
        <span>{{ $t('calculator.colItem') }}</span>
        <span>{{ $t('calculator.colQuantity') }}</span>
      </div>

      <ul v-if="lignes.length" class="mb-1">
        <li
          v-for="ligne in lignes"
          :key="ligne.cle"
          class="grid gap-x-6 gap-y-3 border-b border-ink/10 py-4 sm:grid-cols-[1fr_auto] sm:items-start"
        >
          <div>
            <span class="text-[0.9375rem] text-ink">{{ ligne.libelle }}</span>
            <span
              v-if="ligne.ajustee"
              class="ml-2 align-middle text-[0.625rem] uppercase tracking-[0.14em] text-gold"
            >{{ $t('calculator.modified') }}</span>
            <span
              v-else-if="ligne.libre"
              class="ml-2 align-middle text-[0.625rem] uppercase tracking-[0.14em] text-gold"
            >{{ $t('calculator.added') }}</span>

            <span class="mt-1 block max-w-[52ch] text-xs leading-[1.6] text-ink-mute">
              {{ ligne.regle }}
            </span>

            <button
              v-if="ligne.ajustee"
              type="button"
              class="mt-1.5 text-xs text-ink-mute underline underline-offset-4 transition-colors hover:text-ink"
              @click="retablir(ligne.cle)"
            >
              {{ $t('calculator.restore', { n: ligne.quantiteCalculee }) }}
            </button>
          </div>

          <div class="flex items-center gap-2 sm:justify-end">
            <button
              type="button"
              :class="PASTILLE"
              :disabled="ligne.quantite <= 0"
              :aria-label="$t('calculator.decrease', { item: ligne.libelle })"
              @click="decaler(ligne.cle, ligne.quantite, -1)"
            >
              <span aria-hidden="true">−</span>
            </button>

            <input
              :value="ligne.quantite"
              type="number"
              min="0"
              :max="QUANTITE_MAX"
              inputmode="numeric"
              class="w-16 border-0 border-b border-ink/20 bg-transparent pb-1.5 text-center font-display text-[1.25rem] text-ink outline-none transition-colors duration-400 focus:border-gold"
              :aria-label="$t('calculator.quantityOf', { item: ligne.libelle })"
              @input="ajuster(ligne.cle, ($event.target as HTMLInputElement).value)"
            >

            <button
              type="button"
              :class="PASTILLE"
              :aria-label="$t('calculator.increase', { item: ligne.libelle })"
              @click="decaler(ligne.cle, ligne.quantite, 1)"
            >
              <span aria-hidden="true">+</span>
            </button>

            <span class="w-20 text-xs text-ink-mute">{{ ligne.unite }}</span>

            <button
              type="button"
              class="flex size-9 shrink-0 items-center justify-center text-ink-mute transition-colors duration-400 hover:text-ink focus-visible:text-ink"
              :aria-label="$t('calculator.remove', { item: ligne.libelle })"
              @click="retirer(ligne.cle)"
            >
              <svg viewBox="0 0 24 24" class="size-4" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true">
                <path d="M6 6l12 12M18 6L6 18" stroke-linecap="round" />
              </svg>
            </button>
          </div>
        </li>
      </ul>

      <p v-else class="text-[0.9375rem] text-ink-mute">
        {{ $t('calculator.empty') }}
      </p>
    </div>

    <!-- Ajout d'un article hors barème -->
    <div class="mt-7 border-t border-ink/12 pt-6">
      <h3 class="text-[0.6875rem] uppercase tracking-[0.18em] text-ink-mute">
        {{ $t('calculator.addTitle') }}
      </h3>
      <p class="mt-2 max-w-[56ch] text-xs leading-[1.6] text-ink-mute">
        {{ $t('calculator.addText') }}
      </p>

      <div class="mt-4 grid gap-4 sm:grid-cols-[2fr_auto_auto_auto] sm:items-end">
        <div>
          <label class="text-[0.6875rem] uppercase tracking-[0.18em] text-ink-mute" for="calc-libelle">
            {{ $t('calculator.label') }}
          </label>
          <input
            id="calc-libelle"
            v-model="nouveauLibelle"
            type="text"
            maxlength="60"
            :placeholder="$t('calculator.labelPlaceholder')"
            :class="CHAMP"
            @keydown.enter.prevent="ajouterArticle"
          >
        </div>

        <div>
          <label class="text-[0.6875rem] uppercase tracking-[0.18em] text-ink-mute" for="calc-quantite">
            {{ $t('calculator.colQuantity') }}
          </label>
          <input
            id="calc-quantite"
            v-model.number="nouvelleQuantite"
            type="number"
            min="1"
            :max="QUANTITE_MAX"
            inputmode="numeric"
            placeholder="1"
            class="w-full border-0 border-b border-ink/20 bg-transparent pb-3 pt-2 text-center text-[0.9375rem] text-ink outline-none transition-colors duration-400 focus:border-gold sm:w-20"
            @keydown.enter.prevent="ajouterArticle"
          >
        </div>

        <div>
          <label class="text-[0.6875rem] uppercase tracking-[0.18em] text-ink-mute" for="calc-unite">
            {{ $t('calculator.unit') }}
          </label>
          <select
            id="calc-unite"
            v-model="nouvelleUnite"
            class="w-full border-0 border-b border-ink/20 bg-transparent pb-3 pt-2 text-[0.9375rem] text-ink outline-none transition-colors duration-400 focus:border-gold sm:w-32"
          >
            <option v-for="unite in UNITES" :key="unite" :value="unite">{{ unite }}</option>
          </select>
        </div>

        <button
          type="button"
          class="h-11 rounded-full border border-ink px-6 text-[0.6875rem] uppercase tracking-[0.14em] text-ink transition-colors duration-400 hover:bg-ink hover:text-white disabled:pointer-events-none disabled:opacity-35"
          :disabled="!peutAjouter"
          @click="ajouterArticle"
        >
          {{ $t('calculator.add') }}
        </button>
      </div>
    </div>

    <div v-if="lignes.length" class="mt-9 flex flex-wrap items-center gap-5">
      <UiButton :to="lienDevis" size="lg">{{ $t('calculator.toQuote') }}</UiButton>

      <button
        v-if="modifie"
        type="button"
        class="text-xs text-ink-mute underline underline-offset-4 transition-colors hover:text-ink"
        @click="toutRetablir"
      >
        {{ $t('calculator.resetAll') }}
      </button>

      <p class="max-w-[38ch] text-xs leading-[1.6] text-ink-mute">
        {{ $t('calculator.quoteHint') }}
      </p>
    </div>
  </section>
</template>
