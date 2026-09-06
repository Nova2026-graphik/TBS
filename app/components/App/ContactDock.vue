<script setup lang="ts">
/**
 * Ajout par rapport à la maquette : un accès direct au contact, toujours
 * présent.
 *
 * Au Togo, WhatsApp et l'appel direct convertissent bien mieux qu'un
 * formulaire — les deux sont donc à portée de pouce en permanence.
 * Sur mobile, une barre pleine largeur ; sur bureau, un bouton WhatsApp
 * flottant discret.
 */
const info = useSiteInfo()
const route = useRoute()

// Inutile de doubler l'appel à l'action sur la page qui le porte déjà.
const hidden = computed(() => route.path === '/contact')
</script>

<template>
  <div v-if="!hidden">
    <!-- Bureau : bouton WhatsApp flottant -->
    <a
      :href="info.whatsappUrl"
      target="_blank"
      rel="noopener noreferrer"
      class="fixed bottom-7 right-7 z-90 hidden size-14 items-center justify-center rounded-full bg-[#25D366] shadow-lift transition-transform duration-500 ease-[var(--ease-out-expo)] hover:scale-110 md:flex"
      aria-label="Nous écrire sur WhatsApp"
    >
      <svg viewBox="0 0 24 24" class="size-7 fill-white" aria-hidden="true">
        <path d="M17.47 14.38c-.3-.15-1.76-.87-2.03-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.94 1.17-.17.2-.35.22-.65.07-.3-.15-1.26-.46-2.4-1.48-.89-.79-1.49-1.77-1.66-2.07-.17-.3-.02-.46.13-.61.13-.13.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.08-.15-.67-1.61-.92-2.21-.24-.58-.49-.5-.67-.51h-.57c-.2 0-.52.07-.79.37-.27.3-1.04 1.01-1.04 2.47s1.06 2.87 1.21 3.07c.15.2 2.1 3.2 5.08 4.49.71.3 1.26.49 1.69.63.71.22 1.36.19 1.87.12.57-.09 1.76-.72 2.01-1.41.25-.7.25-1.29.17-1.42-.07-.13-.27-.2-.57-.35Z" />
        <path d="M12.04 2C6.6 2 2.18 6.42 2.18 11.86c0 1.74.46 3.44 1.32 4.94L2.05 22l5.34-1.4a9.82 9.82 0 0 0 4.65 1.18h.01c5.43 0 9.85-4.42 9.85-9.86 0-2.63-1.03-5.11-2.89-6.97A9.79 9.79 0 0 0 12.04 2Zm0 18.02a8.2 8.2 0 0 1-4.17-1.14l-.3-.18-3.1.81.83-3.02-.2-.31a8.13 8.13 0 0 1-1.25-4.32c0-4.52 3.68-8.19 8.2-8.19 2.19 0 4.24.85 5.79 2.4a8.13 8.13 0 0 1 2.4 5.79c0 4.52-3.68 8.19-8.2 8.19Z" />
      </svg>
    </a>

    <!-- Mobile : barre d'action collée en bas -->
    <div class="fixed inset-x-0 bottom-0 z-90 grid grid-cols-3 border-t border-ink/10 bg-white/95 backdrop-blur-lg md:hidden">
      <a
        :href="`tel:${info.phonePrimary}`"
        class="flex flex-col items-center gap-1 py-2.5 text-[0.625rem] uppercase tracking-[0.14em] text-ink"
      >
        <svg viewBox="0 0 24 24" class="size-[18px] stroke-ink" fill="none" stroke-width="1.5" aria-hidden="true">
          <path d="M4.5 4.5h3.2l1.6 4-2 1.4a11.5 11.5 0 0 0 5.3 5.3l1.4-2 4 1.6v3.2a1.5 1.5 0 0 1-1.6 1.5C9.4 19 5 14.6 4.5 6.1A1.5 1.5 0 0 1 4.5 4.5Z" stroke-linejoin="round" />
        </svg>
        Appeler
      </a>
      <a
        :href="info.whatsappUrl"
        target="_blank"
        rel="noopener noreferrer"
        class="flex flex-col items-center gap-1 border-x border-ink/10 py-2.5 text-[0.625rem] uppercase tracking-[0.14em] text-ink"
      >
        <svg viewBox="0 0 24 24" class="size-[18px] fill-[#25D366]" aria-hidden="true">
          <path d="M12.04 2C6.6 2 2.18 6.42 2.18 11.86c0 1.74.46 3.44 1.32 4.94L2.05 22l5.34-1.4a9.82 9.82 0 0 0 4.65 1.18c5.43 0 9.85-4.42 9.85-9.86 0-2.63-1.03-5.11-2.89-6.97A9.79 9.79 0 0 0 12.04 2Zm5.43 12.38c-.3-.15-1.76-.87-2.03-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.94 1.17-.17.2-.35.22-.65.07-.3-.15-1.26-.46-2.4-1.48-.89-.79-1.49-1.77-1.66-2.07-.17-.3-.02-.46.13-.61.13-.13.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.08-.15-.67-1.61-.92-2.21-.24-.58-.49-.5-.67-.51h-.57c-.2 0-.52.07-.79.37-.27.3-1.04 1.01-1.04 2.47s1.06 2.87 1.21 3.07c.15.2 2.1 3.2 5.08 4.49.71.3 1.26.49 1.69.63.71.22 1.36.19 1.87.12.57-.09 1.76-.72 2.01-1.41.25-.7.25-1.29.17-1.42-.07-.13-.27-.2-.57-.35Z" />
        </svg>
        WhatsApp
      </a>
      <NuxtLink
        to="/contact"
        class="flex flex-col items-center gap-1 bg-ink py-2.5 text-[0.625rem] uppercase tracking-[0.14em] text-white"
      >
        <svg viewBox="0 0 24 24" class="size-[18px] stroke-white" fill="none" stroke-width="1.5" aria-hidden="true">
          <path d="M4 6h16v12H4z" stroke-linejoin="round" />
          <path d="m4 7 8 6 8-6" stroke-linejoin="round" />
        </svg>
        Devis
      </NuxtLink>
    </div>
  </div>
</template>
