<script setup lang="ts">
const info = useSiteInfo()
const year = new Date().getFullYear()

const branchLinks = [
  { label: 'TBS Équipements', to: '/services?branche=equipements', color: '#827148' },
  { label: 'TBS Events', to: '/services?branche=events', color: '#E8A07C' },
  { label: 'TBS Études & Conseils', to: '/services?branche=etudes', color: '#FFEED6' },
  { label: 'TBS Agro', to: '/services?branche=agro', color: '#A5AF79' },
]

const pageLinks = [
  { label: 'Accueil', to: '/' },
  { label: 'Galerie', to: '/galerie' },
  { label: 'Nos services', to: '/services' },
  { label: 'À propos', to: '/a-propos' },
  { label: 'Contact', to: '/contact' },
  { label: 'FAQ', to: '/faq' },
]

const socialLinks = [
  { label: 'WhatsApp', href: info.whatsappUrl, external: true },
  { label: 'Facebook', href: '#', external: false },
  { label: 'Instagram', href: '#', external: false },
  { label: 'LinkedIn', href: '#', external: false },
]
</script>

<template>
  <footer class="bg-ink text-white/70">
    <div class="u-gutter grid gap-x-10 gap-y-12 py-[clamp(3rem,6vw,5.5rem)] sm:grid-cols-2 lg:grid-cols-[1.6fr_1fr_0.8fr_1fr_0.8fr]">
      <!-- Identité -->
      <div>
        <!-- Le logo est bichrome sur fond clair : une pastille blanche le
             garde lisible sur le brun profond sans en altérer les couleurs. -->
        <div class="inline-flex bg-white px-4 py-3">
          <NuxtImg
            src="/images/logo-tbs.png"
            alt="TBS Distribution S.A.R.L"
            width="400"
            height="200"
            loading="lazy"
            class="h-9 w-auto"
          />
        </div>
        <p class="mt-6 max-w-[42ch] text-sm leading-[1.75] text-white/55">
          Quatre branches : Équipements, Events, Études &amp; Conseils, Agro.
          Fourniture, location, conseil et agro-industrie.
          Agôè-Démakpoè, Lomé — Togo.
        </p>
      </div>

      <!-- Branches -->
      <div>
        <h2 class="text-[0.6875rem] uppercase tracking-[0.2em] text-white">Branches</h2>
        <ul class="mt-5 flex flex-col gap-3">
          <li v-for="link in branchLinks" :key="link.label">
            <NuxtLink
              :to="link.to"
              class="flex items-center gap-2.5 text-sm text-white/60 transition-colors hover:text-white"
            >
              <span class="size-1.5 shrink-0 rounded-full" :style="{ background: link.color }" />
              {{ link.label }}
            </NuxtLink>
          </li>
          <li>
            <NuxtLink to="/galerie" class="text-sm text-white/60 transition-colors hover:text-white">
              Réalisations &amp; références
            </NuxtLink>
          </li>
        </ul>
      </div>

      <!-- Pages -->
      <div>
        <h2 class="text-[0.6875rem] uppercase tracking-[0.2em] text-white">Pages</h2>
        <ul class="mt-5 flex flex-col gap-3">
          <li v-for="link in pageLinks" :key="link.to">
            <NuxtLink :to="link.to" class="text-sm text-white/60 transition-colors hover:text-white">
              {{ link.label }}
            </NuxtLink>
          </li>
        </ul>
      </div>

      <!-- Coordonnées -->
      <div>
        <h2 class="text-[0.6875rem] uppercase tracking-[0.2em] text-white">Coordonnées</h2>
        <ul class="mt-5 flex flex-col gap-3 text-sm text-white/60">
          <li>
            <a :href="`tel:${info.phonePrimary}`" class="transition-colors hover:text-white">
              {{ info.phoneDisplay }}
            </a>
          </li>
          <li>
            <a :href="`tel:${info.phoneSecondary}`" class="transition-colors hover:text-white">
              {{ info.phoneSecondaryDisplay }}
            </a>
          </li>
          <li>
            <a :href="`mailto:${info.email}`" class="break-all transition-colors hover:text-white">
              {{ info.email }}
            </a>
          </li>
          <li class="text-white/45">Agôè - Démakpoè, Lomé</li>
          <li v-for="slot in info.hours" :key="slot.days" class="text-white/45">
            {{ slot.days }} : {{ slot.time }}
          </li>
        </ul>
      </div>

      <!-- Réseaux -->
      <div>
        <h2 class="text-[0.6875rem] uppercase tracking-[0.2em] text-white">Réseaux</h2>
        <ul class="mt-5 flex flex-col gap-3">
          <li v-for="link in socialLinks" :key="link.label">
            <a
              :href="link.href"
              :target="link.external ? '_blank' : undefined"
              :rel="link.external ? 'noopener noreferrer' : undefined"
              class="text-sm text-white/60 transition-colors hover:text-white"
            >
              {{ link.label }}
            </a>
          </li>
        </ul>
      </div>
    </div>

    <div class="u-gutter flex flex-wrap items-center justify-between gap-4 border-t border-white/10 py-6 text-[0.6875rem] tracking-[0.1em] text-white/40">
      <span>© {{ year }} TBS Distribution S.A.R.L — Tous droits réservés.</span>
      <span>Mentions légales · Conditions de location · Confidentialité</span>
    </div>
  </footer>
</template>
