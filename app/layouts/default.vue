<script setup lang="ts">
/**
 * Coquille commune : bandeau, header, contenu, footer, dock de contact.
 * Le JSON-LD LocalBusiness est posé ici pour être présent sur chaque page.
 */
useOrganizationSchema()
</script>

<template>
  <div class="flex min-h-dvh flex-col bg-white">
    <!-- Lien d'évitement : première tabulation sur toutes les pages. -->
    <a
      href="#contenu"
      class="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-200 focus:bg-ink focus:px-5 focus:py-3 focus:text-[0.6875rem] focus:uppercase focus:tracking-[0.18em] focus:text-white"
    >
      Aller au contenu
    </a>

    <AppTopBar />
    <AppHeader />

    <main id="contenu" class="flex-1">
      <slot />
    </main>

    <AppFooter />
    <AppContactDock />

    <!-- Compense la barre d'action mobile pour que le footer reste lisible. -->
    <div class="h-16 md:hidden" aria-hidden="true" />
  </div>
</template>
