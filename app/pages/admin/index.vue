<script setup lang="ts">
/**
 * Espace de suivi des demandes de devis.
 *
 * La page sert deux états : le formulaire d'accès tant que la session n'est
 * pas ouverte, la liste ensuite. C'est l'API qui tranche — un 401 renvoie au
 * formulaire — plutôt qu'un état deviné côté client, qui se contourne.
 *
 * Rien n'est pré-rendu ni indexé : cf. `nuxt.config.ts`.
 */
import type { QuoteStatus } from '#shared/utils/adminQuotes'

definePageMeta({ layout: 'admin' })

useSeoMeta({ title: 'Suivi des devis', robots: 'noindex, nofollow' })

interface QuoteRow {
  id: string
  name: string
  phone: string
  email: string | null
  branch: string
  requestType: string
  eventDate: string | null
  guestCount: number | null
  location: string | null
  status: QuoteStatus
  createdAt: string
  handledAt: string | null
}

const password = ref('')
const loginError = ref('')
const signingIn = ref(false)

const statut = ref<QuoteStatus | ''>('')
const page = ref(1)

const {
  data,
  error,
  refresh,
  status: fetchStatus,
} = await useFetch<{ quotes: QuoteRow[], page: number, hasMore: boolean }>('/api/admin/quotes', {
  query: computed(() => ({ statut: statut.value || undefined, page: page.value })),
  // La page se charge toujours ; c'est le code de retour qui décide de l'écran.
  server: false,
})

const unauthorized = computed(() => (error.value as { statusCode?: number } | null)?.statusCode === 401)
const unavailable = computed(() => (error.value as { statusCode?: number } | null)?.statusCode === 503)

async function signIn() {
  signingIn.value = true
  loginError.value = ''
  try {
    await $fetch('/api/admin/session', { method: 'POST', body: { password: password.value } })
    password.value = ''
    await refresh()
  }
  catch (err) {
    const e = err as { data?: { statusMessage?: string } }
    loginError.value = e.data?.statusMessage ?? 'Connexion impossible.'
  }
  finally {
    signingIn.value = false
  }
}

async function signOut() {
  await $fetch('/api/admin/session', { method: 'DELETE' })
  await refresh()
}

watch(statut, () => {
  page.value = 1
})

/**
 * Espace interne, français uniquement : le doubler en anglais créerait des
 * URL à indexer pour des pages qui n'ont pas à l'être.
 */
defineI18nRoute({ locales: ['fr'] })
</script>

<template>
  <div class="u-gutter py-10">
    <!-- Écran d'accès -->
    <section v-if="unauthorized" class="mx-auto max-w-sm">
      <h1 class="text-h3">
        Suivi des devis
      </h1>
      <p class="mt-3 text-[0.9375rem] leading-[1.7] text-ink-soft">
        Espace réservé à l'équipe TBS.
      </p>

      <form class="mt-8 flex flex-col gap-4" @submit.prevent="signIn">
        <label class="text-[0.6875rem] uppercase tracking-[0.16em] text-ink-mute" for="admin-password">
          Mot de passe
        </label>
        <input
          id="admin-password"
          v-model="password"
          type="password"
          autocomplete="current-password"
          required
          class="w-full border-0 border-b border-ink/20 bg-transparent pb-3 pt-2 text-[0.9375rem] outline-none focus:border-gold"
        >
        <p v-if="loginError" class="text-sm text-red-700" role="alert">
          {{ loginError }}
        </p>
        <UiButton type="submit" :disabled="signingIn" class="mt-2 self-start">
          {{ signingIn ? 'Vérification…' : 'Entrer' }}
        </UiButton>
      </form>
    </section>

    <!-- Base absente : la liste n'a rien à montrer, et il faut le dire. -->
    <section v-else-if="unavailable" class="mx-auto max-w-xl">
      <h1 class="text-h3">
        Suivi des devis
      </h1>
      <p class="mt-4 border-l-2 border-red-500 bg-red-50 px-4 py-3 text-[0.9375rem] leading-[1.7] text-red-800">
        Aucune base de données n'est configurée : les demandes ne sont pas
        enregistrées, seulement notifiées par e-mail. Renseignez
        <code>DATABASE_URL</code> pour les retrouver ici.
      </p>
    </section>

    <!-- Liste -->
    <section v-else>
      <div class="flex flex-wrap items-end justify-between gap-4">
        <h1 class="text-h3">
          Suivi des devis
        </h1>
        <button
          type="button"
          class="u-link-underline after:bg-current"
          @click="signOut"
        >
          Se déconnecter
        </button>
      </div>

      <div class="mt-8 flex flex-wrap items-center gap-3">
        <label class="text-[0.6875rem] uppercase tracking-[0.16em] text-ink-mute" for="filtre-statut">
          Statut
        </label>
        <select
          id="filtre-statut"
          v-model="statut"
          class="border border-ink/20 bg-white px-3 py-2 text-[0.9375rem]"
        >
          <option value="">
            Tous
          </option>
          <option v-for="s in QUOTE_STATUS_LABELS" :key="s.value" :value="s.value">
            {{ s.label }}
          </option>
        </select>
        <span v-if="fetchStatus === 'pending'" class="text-sm text-ink-mute">Chargement…</span>
      </div>

      <p v-if="!data?.quotes.length" class="mt-10 border border-ink/12 bg-sand p-8 text-center text-[0.9375rem]">
        Aucune demande pour ce filtre.
      </p>

      <div v-else class="mt-8 overflow-x-auto">
        <table class="w-full min-w-[52rem] border-collapse text-[0.9375rem]">
          <thead>
            <tr class="border-b border-ink/15 text-left text-[0.6875rem] uppercase tracking-[0.16em] text-ink-mute">
              <th class="py-3 pr-4 font-normal">
                Reçue le
              </th>
              <th class="py-3 pr-4 font-normal">
                Demandeur
              </th>
              <th class="py-3 pr-4 font-normal">
                Branche
              </th>
              <th class="py-3 pr-4 font-normal">
                Type
              </th>
              <th class="py-3 pr-4 font-normal">
                Statut
              </th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="quote in data.quotes"
              :key="quote.id"
              class="border-b border-ink/8 transition-colors hover:bg-sand"
            >
              <td class="py-3 pr-4 whitespace-nowrap text-ink-soft">
                {{ formatAdminDate(quote.createdAt) }}
              </td>
              <td class="py-3 pr-4">
                <NuxtLink :to="`/admin/${quote.id}`" class="text-ink underline underline-offset-2">
                  {{ quote.name }}
                </NuxtLink>
                <span class="block text-xs text-ink-mute">{{ quote.phone }}</span>
              </td>
              <td class="py-3 pr-4 text-ink-soft">
                {{ shortBranchLabel(quote.branch) }}
              </td>
              <td class="py-3 pr-4 text-ink-soft">
                {{ quote.requestType }}
              </td>
              <td class="py-3 pr-4">
                <AdminStatusBadge :status="quote.status" />
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div v-if="data && (data.page > 1 || data.hasMore)" class="mt-8 flex items-center gap-4">
        <UiButton variant="ghost" :disabled="data.page <= 1" @click="page = Math.max(1, page - 1)">
          Précédentes
        </UiButton>
        <span class="text-sm text-ink-mute">Page {{ data.page }}</span>
        <UiButton variant="ghost" :disabled="!data.hasMore" @click="page = page + 1">
          Suivantes
        </UiButton>
      </div>
    </section>
  </div>
</template>
