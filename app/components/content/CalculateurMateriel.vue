<script setup lang="ts">
import type { FormatReception } from '~/utils/materielReception'

/**
 * Calculateur de matériel de réception.
 *
 * L'issue #24 le désigne comme le meilleur investissement de la rubrique, et
 * pour une raison simple : c'est le seul contenu du site qui rend un service
 * avant la vente. On saisit un nombre d'invités, on obtient une liste
 * chiffrée, et un bouton transforme cette liste en demande de devis
 * pré-remplie — sans rien recopier.
 *
 * Le composant vit dans `app/components/content/` : il est ainsi utilisable
 * directement depuis un article Markdown, en `:calculateur-materiel`.
 */
const invites = ref(200)
const format = ref<FormatReception>('assis')
const soiree = ref(true)

const FORMATS: { valeur: FormatReception, libelle: string, detail: string }[] = [
  { valeur: 'assis', libelle: 'Dîner assis', detail: 'Tables rondes, service à l’assiette' },
  { valeur: 'mixte', libelle: 'Mixte', detail: 'Une partie assise, une partie debout' },
  { valeur: 'cocktail', libelle: 'Cocktail', detail: 'Debout, mange-debout et lounge' },
]

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

const lignes = computed(() => calculerMateriel(options.value))

/**
 * Lien vers le formulaire de devis, inventaire compris. Le formulaire lit ces
 * paramètres au montage — cf. `app/components/Contact/Form.vue`.
 */
// Chaîne plutôt qu'objet de route : `UiButton.to` est typé `string`, et
// `NuxtLink` lit la chaîne de requête d'une URL relative sans difficulté.
const lienDevis = computed(() => {
  const query = new URLSearchParams({
    branche: 'events',
    invites: String(invitesValides.value),
    message: messageDevis(options.value, lignes.value),
  })
  return `/contact?${query}`
})

const CHAMP
  = 'w-full border-0 border-b border-ink/20 bg-transparent pb-3 pt-2 text-[0.9375rem] text-ink transition-colors duration-400 outline-none focus:border-gold'
</script>

<template>
  <section class="my-10 border border-ink/12 bg-sand p-[clamp(1.25rem,3vw,2.25rem)]">
    <h2 class="text-h3">Combien de matériel pour votre réception ?</h2>
    <p class="mt-3 max-w-[60ch] text-[0.9375rem] leading-[1.75] text-ink-soft">
      Une estimation de départ, calculée sur les ratios que nous appliquons au
      quotidien. Le plan de salle définitif dépend du lieu et du déroulé : c'est
      le devis qui le tranche.
    </p>

    <div class="mt-8 grid gap-7 sm:grid-cols-2">
      <div>
        <label class="text-[0.6875rem] uppercase tracking-[0.18em] text-ink-mute" for="calc-invites">
          Nombre d'invités
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
          En dessous de {{ MIN }} invités, un simple appel ira plus vite.
        </p>
        <p v-else-if="trop" class="mt-2 text-xs text-ink-mute">
          Au-delà de {{ MAX }} invités, le calcul ne suffit plus : appelez-nous,
          nous montons le plan avec vous.
        </p>
      </div>

      <div>
        <span class="text-[0.6875rem] uppercase tracking-[0.18em] text-ink-mute">Format</span>
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
      La réception se prolonge en soirée
    </label>

    <!-- `aria-live` : le tableau change à chaque frappe, l'annonce doit suivre
         sans interrompre la saisie. -->
    <div class="mt-9" aria-live="polite">
      <table v-if="lignes.length" class="w-full border-collapse text-left">
        <caption class="sr-only">
          Matériel estimé pour {{ invitesValides }} invités
        </caption>
        <thead>
          <tr class="border-b border-ink/15 text-[0.6875rem] uppercase tracking-[0.16em] text-ink-mute">
            <th scope="col" class="py-3 font-normal">Matériel</th>
            <th scope="col" class="py-3 text-right font-normal">Quantité</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="ligne in lignes" :key="ligne.cle" class="border-b border-ink/10 align-top">
            <th scope="row" class="py-4 pr-4 font-normal">
              <span class="text-[0.9375rem] text-ink">{{ ligne.libelle }}</span>
              <span class="mt-1 block max-w-[52ch] text-xs leading-[1.6] text-ink-mute">
                {{ ligne.regle }}
              </span>
            </th>
            <td class="whitespace-nowrap py-4 text-right">
              <span class="font-display text-[1.375rem] text-ink">{{ ligne.quantite }}</span>
              <span class="ml-1.5 text-xs text-ink-mute">{{ ligne.unite }}</span>
            </td>
          </tr>
        </tbody>
      </table>

      <p v-else class="text-[0.9375rem] text-ink-mute">
        Indiquez un nombre d'invités pour obtenir l'estimation.
      </p>
    </div>

    <div v-if="lignes.length" class="mt-9 flex flex-wrap items-center gap-5">
      <UiButton :to="lienDevis" size="lg">Transformer en demande de devis</UiButton>
      <p class="max-w-[38ch] text-xs leading-[1.6] text-ink-mute">
        Le formulaire s'ouvre avec cet inventaire déjà rempli. Vous n'avez plus
        qu'à donner la date et vos coordonnées.
      </p>
    </div>
  </section>
</template>
