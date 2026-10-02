<script setup lang="ts">
/**
 * Coquille commune : bandeau, header, contenu, footer, dock de contact.
 * Le JSON-LD LocalBusiness est posé ici pour être présent sur chaque page.
 */
useOrganizationSchema()

/**
 * `lang`, `dir` et les liens `hreflang` réciproques — y compris `x-default` —
 * posés par le module pour toutes les pages. Sans eux, un moteur voit deux
 * sites sans rapport plutôt que deux versions d'un même site.
 */
useHead(useLocaleHead({ seo: true }))

/**
 * Retour en arrière, sur toutes les pages **sauf l'accueil** — où il n'y a
 * rien derrière, et où un lien de remontée ne désignerait que la page qu'on
 * regarde. Posé ici plutôt que dans chaque page : une page ajoutée demain
 * l'obtient sans y penser, et aucune ne peut l'oublier.
 */
const route = useRoute()
const estAccueil = computed(() => route.path.replace(/^\/en(?=\/|$)/, '').replace(/\/$/, '') === '')
</script>

<template>
  <div class="flex min-h-dvh flex-col bg-white">
    <!-- Lien d'évitement : première tabulation sur toutes les pages. -->
    <a
      href="#contenu"
      class="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-200 focus:bg-ink focus:px-5 focus:py-3 focus:text-[0.6875rem] focus:uppercase focus:tracking-[0.18em] focus:text-white"
    >
      {{ $t('common.skipToContent') }}
    </a>

    <AppTopBar />
    <AppHeader />

    <main id="contenu" class="flex-1">
      <UiRetour v-if="!estAccueil" class="pt-3" />
      <slot />
    </main>

    <AppFooter />
    <AppContactDock />

    <!-- Compense la barre d'action mobile pour que le footer reste lisible. -->
    <div class="h-16 md:hidden" aria-hidden="true" />
  </div>
</template>
