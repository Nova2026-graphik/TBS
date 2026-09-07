<script setup lang="ts">
/**
 * Formulaire de demande de devis.
 *
 * Écarts avec la maquette, où le bouton basculait simplement un booléen :
 *  - vraie soumission vers POST /api/quotes, avec états chargement / erreur ;
 *  - validation côté client ET côté serveur, erreurs rendues sous le champ
 *    concerné et reliées par `aria-describedby`, plus un résumé focalisable
 *    en tête de formulaire qui annonce le bilan avant le détail ;
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
  'Événement d\'entreprise',
  'Fourniture / marché public',
  'Autre',
]

const route = useRoute()
const info = useSiteInfo()
const { t, tm, rt } = useI18n()
const { track } = useAnalytics()

/**
 * Les libellés des deux listes viennent des fichiers de langue, mais **la
 * valeur envoyée reste française**. Une demande arrivée en anglais doit
 * atterrir dans le même bac que les autres : l'équipe commerciale lit un seul
 * jeu d'intitulés, et le champ `branch` de `quote_requests` reste comparable
 * d'une ligne à l'autre.
 */
/** `tm` renvoie un type trop profond pour être inféré : on le ramène à plat. */
function libelles(cle: string): string[] {
  return (tm(cle) as unknown[]).map(entree => rt(entree as string))
}

const branchOptions = computed(() => {
  const labels = libelles('form.branches')
  return BRANCH_OPTIONS.map((value, i) => ({ value, label: labels[i] ?? value }))
})

const requestTypeOptions = computed(() => {
  const labels = libelles('form.requestTypes')
  return REQUEST_TYPES.map((value, i) => ({ value, label: labels[i] ?? value }))
})

/**
 * `devis_commence` ne part qu'une fois, au premier champ réellement rempli.
 * Rapporté à `devis_envoye`, il dit si le formulaire décourage — ce qu'aucune
 * autre mesure ne révèle.
 */
const started = ref(false)
function markStarted() {
  if (started.value) return
  started.value = true
  track(ANALYTICS_EVENTS.devisCommence)
}
const retentionMonths = QUOTE_RETENTION_MONTHS

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

/**
 * Intitulé de chaque champ pour le résumé d'erreurs. Le message seul —
 * « Numéro de téléphone invalide. » — se comprend sous le champ, mais pas en
 * tête de formulaire : le résumé doit nommer ce qu'il faut aller corriger.
 * Les clés couvrent aussi les champs que seul le serveur peut rejeter.
 */
const FIELD_KEYS = [
  'name', 'phone', 'email', 'branch',
  'requestType', 'eventDate', 'guestCount', 'location', 'message',
] as const

const FIELD_LABELS = computed<Record<string, string>>(() =>
  Object.fromEntries(FIELD_KEYS.map(key => [key, t(`form.fields.${key}`)])),
)

const errors = ref<Record<string, string>>({})
const status = ref<'idle' | 'pending' | 'sent' | 'error'>('idle')
const serverError = ref('')
const mountedAt = ref(Date.now())
const errorSummary = ref<HTMLElement | null>(null)

/**
 * Erreurs à plat, dans l'ordre des champs du formulaire — et non dans celui
 * où le serveur les a renvoyées. Une clé inconnue (champ ajouté au schéma
 * sans l'être ici) reste listée en fin : mieux vaut un intitulé brut qu'une
 * erreur invisible.
 */
const errorList = computed(() => {
  const known = Object.keys(FIELD_LABELS.value)
  const fields = [
    ...known.filter(field => errors.value[field]),
    ...Object.keys(errors.value).filter(field => !known.includes(field)),
  ]
  return fields.map(field => ({
    field,
    label: FIELD_LABELS.value[field] ?? field,
    message: errors.value[field]!,
  }))
})

/**
 * Pré-remplissage depuis un lien.
 *
 *  - `?branche=events` — un lien « demander un devis » depuis une branche ;
 *  - `?invites=` et `?message=` — le calculateur de matériel de la rubrique
 *    Conseils, qui envoie ici son inventaire chiffré. Sans cela, il faudrait
 *    recopier vingt lignes à la main, et personne ne le ferait.
 *
 * Le message est tronqué à la limite du schéma serveur : une URL trafiquée ne
 * doit pas produire une 422 incompréhensible pour le visiteur.
 */
const MESSAGE_MAX = 4000

function texteDeRequete(valeur: unknown): string {
  return typeof valeur === 'string' ? valeur : ''
}

onMounted(() => {
  const branche = route.query.branche
  const match = BRANCH_OPTIONS.find(option =>
    typeof branche === 'string' && option.toLowerCase().includes(branche.toLowerCase()),
  )
  if (match) form.branch = match

  const invites = Number(texteDeRequete(route.query.invites))
  if (Number.isInteger(invites) && invites > 0 && invites <= 100_000) {
    form.guestCount = String(invites)
  }

  const message = texteDeRequete(route.query.message).slice(0, MESSAGE_MAX)
  if (message) form.message = message

  mountedAt.value = Date.now()
})

/** Les champs date / invités n'ont de sens que pour une demande événementielle. */
const isEventRequest = computed(() =>
  ['Mariage', 'Cérémonie / baptême', 'Réception privée', 'Événement d\'entreprise'].includes(
    form.requestType,
  ),
)

function validate(): boolean {
  const next: Record<string, string> = {}
  if (form.name.trim().length < 2) next.name = t('form.errors.name')
  if (!/^[\d\s+().-]{6,}$/.test(form.phone.trim())) next.phone = t('form.errors.phone')
  if (form.email && !/^[^@\s]+@[^@\s]+\.[^@\s]{2,}$/.test(form.email.trim()))
    next.email = t('form.errors.email')
  if (form.message.trim().length < 5) next.message = t('form.errors.message')

  errors.value = next
  return Object.keys(next).length === 0
}

/**
 * Donne le focus au résumé plutôt qu'au premier champ fautif : l'utilisateur
 * entend d'abord combien de champs sont à reprendre, puis choisit par où
 * commencer. `role="alert"` fait annoncer le résumé dès son insertion ; le
 * focus rend ensuite la liste atteignable au clavier.
 */
async function focusErrorSummary() {
  await nextTick()
  errorSummary.value?.focus()
}

/** Depuis le résumé, saute au champ concerné et l'ouvre au clavier. */
function goToField(field: string) {
  document.getElementById(`field-${field}`)?.focus()
}

async function submit() {
  if (!validate()) {
    await focusErrorSummary()
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
    track(ANALYTICS_EVENTS.devisEnvoye, { branche: form.branch.split('—')[0]!.trim() })
  }
  catch (error: unknown) {
    const err = error as { data?: { data?: { errors?: Record<string, string> }, statusMessage?: string } }
    if (err.data?.data?.errors) {
      errors.value = err.data.data.errors
      status.value = 'idle'
      await focusErrorSummary()
      return
    }
    serverError.value = err.data?.statusMessage ?? t('form.errors.server')
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

const FIELD
  = 'w-full border-0 border-b border-ink/20 bg-transparent pb-3 pt-2 text-[0.9375rem] text-ink transition-colors duration-400 outline-none placeholder:text-ink-mute/70 focus:border-gold'
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
      {{ $t('form.sentEyebrow') }}
    </span>
    <h2 class="mt-4 text-h3">{{ $t('form.sentTitle') }}</h2>
    <p class="mt-4 max-w-[48ch] text-[0.9375rem] leading-[1.75]">
      {{ $t('form.sentBody') }}
    </p>
    <UiButton variant="ghost" class="mt-8" @click="reset">{{ $t('form.newRequest') }}</UiButton>
  </div>

  <!-- Formulaire -->
  <!-- `@input` en délégation : un seul écouteur pour les neuf champs. -->
  <form
    v-else
    class="flex flex-col gap-7"
    novalidate
    @input="markStarted"
    @submit.prevent="submit"
  >
    <!-- Piège à robots : hors flux, masqué aux lecteurs d'écran, jamais tabulable. -->
    <div aria-hidden="true" class="absolute left-[-9999px] h-0 w-0 overflow-hidden">
      <label>
        {{ $t('form.company') }}
        <input v-model="form.company" type="text" tabindex="-1" autocomplete="off">
      </label>
    </div>

    <!-- Résumé d'erreurs : le bilan avant le détail, atteignable au clavier. -->
    <div
      v-if="errorList.length"
      ref="errorSummary"
      role="alert"
      tabindex="-1"
      class="border-l-2 border-red-500 bg-red-50 px-4 py-4 outline-none focus-visible:ring-2 focus-visible:ring-red-500"
    >
      <p class="text-sm font-medium text-red-700">
        {{ $t('form.summary', { n: errorList.length }, errorList.length) }}
      </p>
      <ul class="mt-2 flex flex-col gap-1 text-sm text-red-700">
        <li v-for="item in errorList" :key="item.field">
          <a
            :href="`#field-${item.field}`"
            class="underline underline-offset-2 hover:no-underline"
            @click.prevent="goToField(item.field)"
          >
            {{ item.label }} — {{ item.message }}
          </a>
        </li>
      </ul>
    </div>

    <div class="grid gap-7 sm:grid-cols-2">
      <div>
        <label :class="LABEL" for="field-name">{{ $t('form.fields.name') }} *</label>
        <input
          id="field-name"
          v-model="form.name"
          type="text"
          required
          autocomplete="name"
          :placeholder="$t('form.placeholders.name')"
          :class="[FIELD, errors.name ? 'border-red-500' : '']"
          :aria-invalid="!!errors.name"
          :aria-describedby="errors.name ? 'err-name' : undefined"
        >
        <p v-if="errors.name" id="err-name" class="mt-2 text-xs text-red-600">{{ errors.name }}</p>
      </div>

      <div>
        <label :class="LABEL" for="field-phone">{{ $t('form.fields.phone') }} *</label>
        <input
          id="field-phone"
          v-model="form.phone"
          type="tel"
          required
          autocomplete="tel"
          :placeholder="$t('form.placeholders.phone')"
          :class="[FIELD, errors.phone ? 'border-red-500' : '']"
          :aria-invalid="!!errors.phone"
          :aria-describedby="errors.phone ? 'err-phone' : undefined"
        >
        <p v-if="errors.phone" id="err-phone" class="mt-2 text-xs text-red-600">{{ errors.phone }}</p>
      </div>
    </div>

    <div>
      <label :class="LABEL" for="field-email">{{ $t('form.fields.email') }}</label>
      <input
        id="field-email"
        v-model="form.email"
        type="email"
        autocomplete="email"
        :placeholder="$t('form.placeholders.email')"
        :class="[FIELD, errors.email ? 'border-red-500' : '']"
        :aria-invalid="!!errors.email"
        :aria-describedby="errors.email ? 'err-email' : undefined"
      >
      <p v-if="errors.email" id="err-email" class="mt-2 text-xs text-red-600">{{ errors.email }}</p>
    </div>

    <div>
      <label :class="LABEL" for="field-branch">{{ $t('form.fields.branch') }}</label>
      <select id="field-branch" v-model="form.branch" :class="FIELD">
        <option v-for="option in branchOptions" :key="option.value" :value="option.value">
          {{ option.label }}
        </option>
      </select>
    </div>

    <div class="grid gap-7 sm:grid-cols-2">
      <div>
        <label :class="LABEL" for="field-requestType">{{ $t('form.fields.requestType') }}</label>
        <select id="field-requestType" v-model="form.requestType" :class="FIELD">
          <option v-for="option in requestTypeOptions" :key="option.value" :value="option.value">
            {{ option.label }}
          </option>
        </select>
      </div>

      <div v-if="isEventRequest">
        <label :class="LABEL" for="field-eventDate">{{ $t('form.fields.eventDate') }}</label>
        <input id="field-eventDate" v-model="form.eventDate" type="date" :class="FIELD">
      </div>
    </div>

    <div class="grid gap-7 sm:grid-cols-2">
      <div v-if="isEventRequest">
        <label :class="LABEL" for="field-guestCount">{{ $t('form.fields.guestCount') }}</label>
        <input
          id="field-guestCount"
          v-model="form.guestCount"
          type="number"
          min="0"
          inputmode="numeric"
          :placeholder="$t('form.placeholders.guestCount')"
          :class="FIELD"
        >
      </div>

      <div>
        <label :class="LABEL" for="field-location">{{ $t('form.fields.location') }}</label>
        <input
          id="field-location"
          v-model="form.location"
          type="text"
          autocomplete="address-level2"
          :placeholder="$t('form.placeholders.location')"
          :class="FIELD"
        >
      </div>
    </div>

    <div>
      <label :class="LABEL" for="field-message">{{ $t('form.fields.message') }} *</label>
      <textarea
        id="field-message"
        v-model="form.message"
        rows="3"
        required
        :placeholder="$t('form.placeholders.message')"
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
        {{ status === 'pending' ? $t('form.submitting') : $t('form.submit') }}
      </UiButton>
      <p class="text-xs text-ink-mute">{{ $t('form.notice') }}</p>
    </div>

    <!-- Information sur le traitement des données. Elle appartient au
         formulaire, pas à une page annexe : c'est ici que la personne décide
         de transmettre ses coordonnées. -->
    <p class="max-w-[68ch] border-t border-ink/10 pt-5 text-xs leading-[1.7] text-ink-mute">
      {{ $t('form.privacy', { months: retentionMonths }) }}
      <a :href="`mailto:${info.email}`" class="underline underline-offset-2 hover:text-ink">{{ info.email }}</a>.
      <NuxtLinkLocale to="/confidentialite" class="underline underline-offset-2 hover:text-ink">
        {{ $t('form.privacyLink') }}
      </NuxtLinkLocale>.
    </p>
  </form>
</template>
