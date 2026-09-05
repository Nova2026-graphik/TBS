<script setup lang="ts">
import type { NuxtError } from '#app'

const props = defineProps<{ error: NuxtError }>()

const is404 = computed(() => props.error?.statusCode === 404)

useHead({ title: is404.value ? 'Page introuvable' : 'Une erreur est survenue' })
</script>

<template>
  <div class="flex min-h-dvh flex-col bg-white">
    <AppHeader />

    <main class="u-gutter flex flex-1 items-center py-[clamp(4rem,10vw,9rem)]">
      <div class="max-w-[46ch]">
        <span class="u-eyebrow">
          <span class="u-rule" />
          Erreur {{ error?.statusCode ?? 500 }}
        </span>

        <h1 class="mt-5 text-h1">
          {{ is404 ? 'Cette page' : 'Quelque chose' }}
          <span class="italic">{{ is404 ? "n'existe pas" : "s'est mal passé" }}</span>
        </h1>

        <p class="mt-6 text-[0.9375rem] leading-[1.72]">
          {{
            is404
              ? "Le lien est peut-être obsolète. Reprenez depuis l'accueil, ou dites-nous ce que vous cherchez — un conseiller répond dans la journée."
              : "Nos équipes sont prévenues. Réessayez dans un instant ou appelez-nous directement."
          }}
        </p>

        <div class="mt-9 flex flex-wrap gap-3">
          <UiButton to="/" size="lg" @click="clearError({ redirect: '/' })">
            Retour à l'accueil
          </UiButton>
          <UiButton to="/contact" variant="ghost" size="lg">Nous contacter</UiButton>
        </div>
      </div>
    </main>

    <AppFooter />
  </div>
</template>
