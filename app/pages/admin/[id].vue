<script setup lang="ts">
/**
 * Détail d'une demande de devis.
 *
 * Trois gestes, ceux qu'on fait vraiment en décrochant : rappeler, écrire sur
 * WhatsApp avec le contexte déjà en place, et noter ce qui s'est dit.
 */
import type { QuoteStatus } from '#shared/utils/adminQuotes'

definePageMeta({ layout: 'admin' })
useSeoMeta({ title: 'Demande de devis', robots: 'noindex, nofollow' })

interface QuoteDetail {
  id: string
  name: string
  phone: string
  email: string | null
  branch: string
  requestType: string
  eventDate: string | null
  guestCount: number | null
  location: string | null
  message: string
  status: QuoteStatus
  internalNote: string | null
  userAgent: string | null
  createdAt: string
  handledAt: string | null
}

const route = useRoute()
const id = computed(() => String(route.params.id))

const { data, error, refresh } = await useFetch<QuoteDetail>(() => `/api/admin/quotes/${id.value}`, {
  server: false,
})

const unauthorized = computed(
  () => (error.value as { statusCode?: number } | null)?.statusCode === 401,
)

const note = ref('')
const saving = ref(false)
const saved = ref(false)
const saveError = ref('')

watch(data, (quote) => {
  if (quote) note.value = quote.internalNote ?? ''
}, { immediate: true })

async function save(changes: { status?: QuoteStatus, internalNote?: string | null }) {
  saving.value = true
  saved.value = false
  saveError.value = ''
  try {
    await $fetch(`/api/admin/quotes/${id.value}`, { method: 'PATCH', body: changes })
    await refresh()
    saved.value = true
  }
  catch (err) {
    const e = err as { data?: { statusMessage?: string } }
    saveError.value = e.data?.statusMessage ?? 'Enregistrement impossible.'
  }
  finally {
    saving.value = false
  }
}

const rows = computed(() => {
  const q = data.value
  if (!q) return []
  return [
    ['Téléphone', q.phone],
    ['E-mail', q.email ?? '—'],
    ['Branche', q.branch],
    ['Type de demande', q.requestType],
    ['Date de l’événement', q.eventDate ?? '—'],
    ['Invités', q.guestCount === null ? '—' : String(q.guestCount)],
    ['Lieu', q.location ?? '—'],
    ['Reçue le', formatAdminDate(q.createdAt)],
    ['Traitée le', formatAdminDate(q.handledAt)],
  ] as const
})
</script>

<template>
  <div class="u-gutter py-10">
    <p v-if="unauthorized" class="mx-auto max-w-sm text-[0.9375rem]">
      Session expirée. <NuxtLink to="/admin" class="underline">
        Revenir à la liste
      </NuxtLink>.
    </p>

    <p v-else-if="error" class="mx-auto max-w-xl border-l-2 border-red-500 bg-red-50 px-4 py-3 text-[0.9375rem] text-red-800">
      Demande introuvable.
    </p>

    <article v-else-if="data" class="mx-auto max-w-3xl">
      <NuxtLink to="/admin" class="text-[0.6875rem] uppercase tracking-[0.16em] text-ink-mute hover:text-ink">
        ← Toutes les demandes
      </NuxtLink>

      <div class="mt-5 flex flex-wrap items-center justify-between gap-4">
        <h1 class="text-h3">
          {{ data.name }}
        </h1>
        <AdminStatusBadge :status="data.status" />
      </div>

      <!-- Rappeler d'abord : c'est ce que le site promet en 24 heures. -->
      <div class="mt-6 flex flex-wrap gap-3">
        <UiButton :href="`tel:${data.phone.replace(/[^\d+]/g, '')}`">
          Appeler
        </UiButton>
        <UiButton
          variant="ghost"
          :href="whatsappReplyLink(data.phone, data.name, data.branch)"
        >
          WhatsApp
        </UiButton>
        <UiButton v-if="data.email" variant="ghost" :href="`mailto:${data.email}`">
          Écrire
        </UiButton>
      </div>

      <dl class="mt-10 grid gap-x-8 gap-y-3 border-t border-ink/10 pt-6 sm:grid-cols-[minmax(9rem,13rem)_1fr]">
        <template v-for="[label, value] in rows" :key="label">
          <dt class="text-[0.6875rem] uppercase tracking-[0.16em] text-ink-mute sm:pt-0.5">
            {{ label }}
          </dt>
          <dd class="text-[0.9375rem] leading-[1.7] text-ink-soft">
            {{ value }}
          </dd>
        </template>
      </dl>

      <h2 class="mt-10 text-[0.6875rem] uppercase tracking-[0.16em] text-ink-mute">
        Besoin exprimé
      </h2>
      <p class="mt-3 max-w-[72ch] whitespace-pre-wrap text-[0.9375rem] leading-[1.75] text-ink-soft">
        {{ data.message }}
      </p>

      <h2 class="mt-10 text-[0.6875rem] uppercase tracking-[0.16em] text-ink-mute">
        Statut
      </h2>
      <div class="mt-3 flex flex-wrap gap-2">
        <button
          v-for="s in QUOTE_STATUS_LABELS"
          :key="s.value"
          type="button"
          :disabled="saving"
          class="border px-4 py-2 text-[0.6875rem] uppercase tracking-[0.14em] transition-colors"
          :class="data.status === s.value
            ? 'border-ink bg-ink text-white'
            : 'border-ink/20 text-ink-soft hover:border-gold hover:text-gold'"
          @click="save({ status: s.value })"
        >
          {{ s.label }}
        </button>
      </div>

      <label
        for="note-interne"
        class="mt-10 block text-[0.6875rem] uppercase tracking-[0.16em] text-ink-mute"
      >
        Note interne
      </label>
      <p id="note-interne-aide" class="mt-2 text-xs text-ink-mute">
        Jamais montrée au client. Effacée avec le reste passé le délai de conservation.
      </p>
      <textarea
        id="note-interne"
        v-model="note"
        aria-describedby="note-interne-aide"
        rows="4"
        class="mt-3 w-full border border-ink/20 bg-white p-3 text-[0.9375rem] leading-[1.7] outline-none focus:border-gold"
      />
      <div class="mt-3 flex flex-wrap items-center gap-4">
        <UiButton :disabled="saving" @click="save({ internalNote: note })">
          {{ saving ? 'Enregistrement…' : 'Enregistrer la note' }}
        </UiButton>
        <span v-if="saved" class="text-sm text-ink-soft">Enregistré.</span>
        <span v-if="saveError" class="text-sm text-red-700" role="alert">{{ saveError }}</span>
      </div>

      <p v-if="data.userAgent" class="mt-10 border-t border-ink/10 pt-4 text-xs text-ink-mute">
        Navigateur déclaré à l'envoi : {{ data.userAgent }}
      </p>
    </article>
  </div>
</template>
