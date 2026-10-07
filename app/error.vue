<script setup lang="ts">
import type { NuxtError } from '#app'

/**
 * Page d'erreur, dans la langue de la page.
 *
 * Trois cas, parce qu'ils n'appellent pas la même phrase :
 *
 *  - **404** — le lien est mort, rien n'est cassé ;
 *  - **autres 4xx** — 401, 403, 429 : la requête a été refusée, à dessein. Ce
 *    n'est pas une panne, et personne n'est alerté ;
 *  - **5xx** — une vraie panne. C'est le seul cas où l'équipe reçoit une alerte
 *    (`server/plugins/error-reporting.ts`), donc le seul où la page peut dire
 *    qu'elle est prévenue. Elle le disait pour une simple 401 : c'était faux.
 */
const props = defineProps<{ error: NuxtError }>()
const { t } = useI18n()
const localePath = useLocalePath()

const code = computed(() => props.error?.statusCode ?? 500)
const cas = computed<'notFound' | 'forbidden' | 'server'>(() => {
  if (code.value === 404) return 'notFound'
  return code.value >= 400 && code.value < 500 ? 'forbidden' : 'server'
})

useHead({ title: computed(() => t(cas.value === 'notFound' ? 'error.titleNotFound' : 'error.titleOther')) })
</script>

<template>
  <div class="flex min-h-dvh flex-col bg-white">
    <AppHeader />

    <main class="u-gutter flex flex-1 items-center py-[clamp(4rem,10vw,9rem)]">
      <div class="max-w-[46ch]">
        <span class="u-eyebrow">
          <span class="u-rule" />
          {{ $t('error.eyebrow', { code }) }}
        </span>

        <h1 class="mt-5 text-h1">
          {{ $t(`error.${cas}Title`) }}
          <span class="italic">{{ $t(`error.${cas}Accent`) }}</span>
        </h1>

        <p class="mt-6 text-[0.9375rem] leading-[1.72]">
          {{ $t(`error.${cas}Lead`) }}
        </p>

        <div class="mt-9 flex flex-wrap gap-3">
          <UiButton :to="localePath('/')" size="lg" @click="clearError({ redirect: localePath('/') })">
            {{ $t('error.home') }}
          </UiButton>
          <UiButton to="/contact" variant="ghost" size="lg">{{ $t('common.contactUs') }}</UiButton>
        </div>
      </div>
    </main>

    <AppFooter />
  </div>
</template>
