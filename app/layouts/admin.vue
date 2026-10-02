<script setup lang="ts">
/**
 * Mise en page de l'espace de suivi : sans en-tête public, sans pied de page,
 * sans dock de contact. C'est un outil interne, pas une page du site.
 */
</script>

<template>
  <div class="min-h-svh bg-white">
    <div class="border-b border-ink/10 bg-sand">
      <div class="u-gutter flex items-center justify-between gap-4 py-4">
        <NuxtLink to="/admin" class="text-[0.6875rem] uppercase tracking-[0.2em] text-ink">
          TBS · Suivi des devis
        </NuxtLink>
        <NuxtLink to="/" class="text-[0.6875rem] uppercase tracking-[0.16em] text-ink-mute hover:text-ink">
          Retour au site
        </NuxtLink>
      </div>
    </div>

    <main>
      <slot />
    </main>
  </div>
</template>
