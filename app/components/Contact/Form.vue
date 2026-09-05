<script setup lang="ts">
/**
 * Formulaire de demande de devis.
 *
 * Écarts avec la maquette, où le bouton basculait simplement un booléen :
 *  - vraie soumission vers POST /api/quotes, avec états chargement / erreur ;
 *  - validation côté client ET côté serveur, erreurs rendues sous le champ
 *    concerné et reliées par `aria-describedby` ;
 *  - champ e-mail ajouté (indispensable pour envoyer un devis écrit) ;
 *  - champ piège `company` + mesure du temps de remplissage contre les robots ;
 *  - les champs « invités » et « date » ne concernent pas les branches hors
 *    Events : ils se replient quand la demande n'est pas événementielle.
 */
const BRANCH_OPTIONS = [
  'TBS Équipements — fourniture de matériels & équipements',
  'TBS Events — location de matériel de réception',
  'TBS Études & Conseils — études & prestations intellectuelles',
  'TBS Agro — agriculture & agro-industrie',
  'Plusieurs branches',
]

const REQUEST_TYPES = [
  'Mariage',
  'Cérémonie / baptême',
  'Réception privée',
  "Événement d'entreprise",
  'Fourniture / marché public',
  'Autre',
]

const route = useRoute()

const form = reactive({
  name: '',
  phone: '',
  email: '',
  branch: BRANCH_OPTIONS[0]!,
  requestType: REQUEST_TYPES[0]!,
  eventDate: '',
  guestCount: '',
  location: '',
  message: '',
  company: '', // piège
})

const errors = ref<Record<string, string>>({})
const status = ref<'idle' | 'pending' | 'sent' | 'error'>('idle')
const serverError = ref('')
const mountedAt = ref(Date.now())

// Un lien « demander un devis » depuis une branche présélectionne celle-ci.
onMounted(() => {
  const branche = route.query.branche
  const match = BRANCH_OPTIONS.find((option) =>
    typeof branche === 'string' && option.toLowerCase().includes(branche.toLowerCase()),
  )
  if (match) form.branch = match
  mountedAt.value = Date.now()
})

/** Les champs date / invités n'ont de sens que pour une demande événementielle. */
const isEventRequest = computed(() =>
  ['Mariage', 'Cérémonie / baptême', 'Réception privée', "Événement d'entreprise"].includes(
    form.requestType,
  ),
)

function validate(): boolean {
  const next: Record<string, string> = {}
  if (form.name.trim().length < 2) next.name = 'Indiquez votre nom.'
  if (!/^[\d\s+().-]{6,}$/.test(form.phone.trim())) next.phone = 'Numéro de téléphone invalide.'
  if (form.email && !/^[^@\s]+@[^@\s]+\.[^@\s]{2,}$/.test(form.email.trim()))
    next.email = 'Adresse e-mail invalide.'
  if (form.message.trim().length < 5) next.message = 'Décrivez brièvement votre besoin.'

  errors.value = next
  return Object.keys(next).length === 0
}

async function submit() {
  if (!validate()) {
    // Ramène l'utilisateur sur le premier champ fautif.
    const first = Object.keys(errors.value)[0]
    document.getElementById(`field-${first}`)?.focus()
    return
  }

  status.value = 'pending'
  serverError.value = ''

  try {
    await $fetch('/api/quotes', {
      method: 'POST',
      body: {
        ...form,
        guestCount: form.guestCount ? Number(form.guestCount) : undefined,
        elapsedMs: Date.now() - mountedAt.value,
      },
    })
    status.value = 'sent'
  } catch (error: unknown) {
    const err = error as { data?: { data?: { errors?: Record<string, string> }; statusMessage?: string } }
    if (err.data?.data?.errors) {
      errors.value = err.data.data.errors
      status.value = 'idle'
      return
    }
    serverError.value =
      err.data?.statusMessage ??
      "Envoi impossible pour l'instant. Appelez-nous au (+228) 90 10 85 10."
    status.value = 'error'
  }
}

function reset() {
  Object.assign(form, {
    name: '', phone: '', email: '', branch: BRANCH_OPTIONS[0]!,
    requestType: REQUEST_TYPES[0]!, eventDate: '', guestCount: '',
    location: '', message: '', company: '',
  })
  errors.value = {}
  serverError.value = ''
  status.value = 'idle'
  mountedAt.value = Date.now()
}

const FIELD =
  'w-full border-0 border-b border-ink/20 bg-transparent pb-3 pt-2 text-[0.9375rem] text-ink transition-colors duration-400 outline-none placeholder:text-ink-mute/70 focus:border-gold'
const LABEL = 'text-[0.6875rem] uppercase tracking-[0.18em] text-ink-mute'
</script>

<template>
  <!-- Confirmation -->
  <div
    v-if="status === 'sent'"
    class="border border-gold/30 bg-sand p-[clamp(1.75rem,4vw,3.5rem)]"
    role="status"
  >
    <span class="u-eyebrow">
      <span class="u-rule" />
      C'est envoyé
    </span>
    <h2 class="mt-4 text-h3">Demande envoyée</h2>
    <p class="mt-4 max-w-[48ch] text-[0.9375rem] leading-[1.75]">
      Merci. Un conseiller TBS vous rappelle dans les 24 heures avec une
      proposition chiffrée.
    </p>
    <UiButton variant="ghost" class="mt-8" @click="reset">Nouvelle demande</UiButton>
  </div>

  <!-- Formulaire -->
  <form v-else class="flex flex-col gap-7" novalidate @submit.prevent="submit">
    <!-- Piège à robots : hors flux, masqué aux lecteurs d'écran, jamais tabulable. -->
    <div aria-hidden="true" class="absolute left-[-9999px] h-0 w-0 overflow-hidden">
      <label>
        Société
        <input v-model="form.company" type="text" tabindex="-1" autocomplete="off">
      </label>
    </div>

    <div class="grid gap-7 sm:grid-cols-2">
      <div>
        <label :class="LABEL" for="field-name">Nom complet *</label>
        <input
          id="field-name"
          v-model="form.name"
          type="text"
          required
          autocomplete="name"
          placeholder="Ex. Akouvi Adjovi"
          :class="[FIELD, errors.name ? 'border-red-500' : '']"
          :aria-invalid="!!errors.name"
          :aria-describedby="errors.name ? 'err-name' : undefined"
        >
        <p v-if="errors.name" id="err-name" class="mt-2 text-xs text-red-600">{{ errors.name }}</p>
      </div>

      <div>
        <label :class="LABEL" for="field-phone">Téléphone *</label>
        <input
          id="field-phone"
          v-model="form.phone"
          type="tel"
          required
          autocomplete="tel"
          placeholder="(+228) 00 00 00 00"
          :class="[FIELD, errors.phone ? 'border-red-500' : '']"
          :aria-invalid="!!errors.phone"
          :aria-describedby="errors.phone ? 'err-phone' : undefined"
        >
        <p v-if="errors.phone" id="err-phone" class="mt-2 text-xs text-red-600">{{ errors.phone }}</p>
      </div>
    </div>

    <div>
      <label :class="LABEL" for="field-email">E-mail</label>
      <input
        id="field-email"
        v-model="form.email"
        type="email"
        autocomplete="email"
        placeholder="Pour recevoir le devis par écrit"
        :class="[FIELD, errors.email ? 'border-red-500' : '']"
        :aria-invalid="!!errors.email"
        :aria-describedby="errors.email ? 'err-email' : undefined"
      >
      <p v-if="errors.email" id="err-email" class="mt-2 text-xs text-red-600">{{ errors.email }}</p>
    </div>

    <div>
      <label :class="LABEL" for="field-branch">Branche concernée</label>
      <select id="field-branch" v-model="form.branch" :class="FIELD">
        <option v-for="option in BRANCH_OPTIONS" :key="option" :value="option">{{ option }}</option>
      </select>
    </div>

    <div class="grid gap-7 sm:grid-cols-2">
      <div>
        <label :class="LABEL" for="field-requestType">Type de demande</label>
        <select id="field-requestType" v-model="form.requestType" :class="FIELD">
          <option v-for="option in REQUEST_TYPES" :key="option" :value="option">{{ option }}</option>
        </select>
      </div>

      <div v-if="isEventRequest">
        <label :class="LABEL" for="field-eventDate">Date de l'événement</label>
        <input id="field-eventDate" v-model="form.eventDate" type="date" :class="FIELD">
      </div>
    </div>

    <div class="grid gap-7 sm:grid-cols-2">
      <div v-if="isEventRequest">
        <label :class="LABEL" for="field-guestCount">Nombre d'invités</label>
        <input
          id="field-guestCount"
          v-model="form.guestCount"
          type="number"
          min="0"
          inputmode="numeric"
          placeholder="Ex. 350"
          :class="FIELD"
        >
      </div>

      <div>
        <label :class="LABEL" for="field-location">Lieu</label>
        <input
          id="field-location"
          v-model="form.location"
          type="text"
          placeholder="Ex. Agôè, Lomé"
          :class="FIELD"
        >
      </div>
    </div>

    <div>
      <label :class="LABEL" for="field-message">Votre besoin *</label>
      <textarea
        id="field-message"
        v-model="form.message"
        rows="3"
        required
        placeholder="Mobilier, vaisselle, décoration, sonorisation…"
        :class="[FIELD, 'resize-y', errors.message ? 'border-red-500' : '']"
        :aria-invalid="!!errors.message"
        :aria-describedby="errors.message ? 'err-message' : undefined"
      />
      <p v-if="errors.message" id="err-message" class="mt-2 text-xs text-red-600">
        {{ errors.message }}
      </p>
    </div>

    <p
      v-if="serverError"
      class="border-l-2 border-red-500 bg-red-50 px-4 py-3 text-sm text-red-700"
      role="alert"
    >
      {{ serverError }}
    </p>

    <div class="flex flex-wrap items-center gap-5">
      <UiButton type="submit" size="lg" :disabled="status === 'pending'">
        {{ status === 'pending' ? 'Envoi…' : 'Envoyer ma demande' }}
      </UiButton>
      <p class="text-xs text-ink-mute">
        Réponse sous 24 h ouvrées. Champs marqués * obligatoires.
      </p>
    </div>
  </form>
</template>
