<script setup lang="ts">
/**
 * Téléchargement d'un document légal en PDF.
 *
 * Le bouton ouvre la boîte d'impression du navigateur, dont l'entrée
 * « Enregistrer au format PDF » produit le fichier. Les styles d'impression
 * de `main.css` retirent au passage la navigation, le pied de page et le
 * bandeau d'appel final : ne reste que le document.
 *
 * **Pourquoi pas un PDF pré-fabriqué et versionné ?** Il aurait donné un
 * téléchargement en un clic, mais il se périme en silence : le jour où une
 * clause change, le site dit une chose et le fichier joint au dossier en dit
 * une autre. Sur un document qui engage la société, un PDF dormant vaut moins
 * que pas de PDF du tout. Ce qui s'imprime ici est toujours ce qui est en
 * ligne.
 *
 * Rendu seulement côté client : sans JavaScript, un bouton qui appelle
 * `window.print()` ne ferait rien, et un bouton mort vaut moins qu'un bouton
 * absent — la page reste imprimable par le menu du navigateur de toute façon.
 */
const monte = ref(false)
onMounted(() => {
  monte.value = true
})

function imprimer() {
  window.print()
}
</script>

<template>
  <button
    v-if="monte"
    type="button"
    data-hors-impression
    class="inline-flex min-h-11 items-center gap-2.5 border border-ink/20 px-5 py-2.5 text-[0.6875rem] uppercase tracking-[0.16em] text-ink-soft transition-colors duration-400 hover:border-gold hover:text-gold focus-visible:border-gold"
    @click="imprimer"
  >
    <svg viewBox="0 0 24 24" class="size-3.5" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true">
      <path d="M12 3v12m0 0l-4-4m4 4l4-4M4 19h16" stroke-linecap="round" stroke-linejoin="round" />
    </svg>
    {{ $t('legal.download') }}
  </button>
</template>
