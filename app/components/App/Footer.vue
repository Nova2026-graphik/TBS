<script setup lang="ts">
const info = useSiteInfo()
const year = new Date().getFullYear()

/**
 * Le nom de branche se traduit — « TBS Études & Conseils » devient « TBS
 * Studies & Consulting » —, mais le slug de l'URL ne bouge pas : c'est lui qui
 * porte `?branche=`, et un lien partagé doit rester valable dans les deux
 * langues.
 */
const branchLinks = computed(() => [
  { key: 'equipements', color: 'var(--color-gold)' },
  { key: 'events', color: 'var(--color-peach)' },
  { key: 'etudes', color: 'var(--color-cream)' },
  { key: 'agro', color: 'var(--color-olive)' },
].map(branche => ({
  ...branche,
  label: `TBS ${t(`topbar.branches.${branche.key}`)}`,
  to: { path: '/services', query: { branche: branche.key } },
})))

const { t } = useI18n()

const pageLinks = computed(() => [
  { key: 'home', to: '/' },
  { key: 'gallery', to: '/galerie' },
  { key: 'services', to: '/services' },
  { key: 'about', to: '/a-propos' },
  { key: 'advice', to: '/conseils' },
  { key: 'contact', to: '/contact' },
  { key: 'faq', to: '/faq' },
].map(item => ({ ...item, label: t(`nav.${item.key}`) })))

/**
 * WhatsApp est le canal réel ; les autres comptes n'apparaissent que si TBS
 * en a communiqué l'URL (`SOCIAL_ACCOUNTS`). Trois `href="#"` traînaient ici :
 * au clic la page remontait en haut, et les lecteurs d'écran annonçaient un
 * lien sans destination.
 */
const socialLinks = [
  { label: 'WhatsApp', href: info.whatsappUrl },
  ...SOCIAL_ACCOUNTS.filter(account => account.url).map(account => ({
    label: account.label,
    href: account.url as string,
  })),
]

/**
 * Les pages légales n'existent qu'en français : elles engagent la société au
 * regard du droit togolais. Le lien reste affiché en version anglaise, mais il
 * ramène au document français — mieux vaut un texte valable dans une langue
 * qu'une traduction non relue par un juriste.
 */
const legalLinks = computed(() => [
  { key: 'mentions', to: '/mentions-legales' },
  { key: 'rental', to: '/conditions-de-location' },
  { key: 'privacy', to: '/confidentialite' },
].map(item => ({ ...item, label: t(`footer.legal.${item.key}`) })))
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
          {{ $t('footer.tagline') }}
        </p>
      </div>

      <!-- Branches -->
      <div>
        <h2 class="text-[0.6875rem] uppercase tracking-[0.2em] text-white">{{ $t('footer.branches') }}</h2>
        <ul class="mt-5 flex flex-col gap-3">
          <li v-for="link in branchLinks" :key="link.key">
            <NuxtLinkLocale
              :to="link.to"
              class="flex items-center gap-2.5 py-1 text-sm text-white/60 transition-colors hover:text-white"
            >
              <span class="size-1.5 shrink-0 rounded-full" :style="{ background: link.color }" />
              {{ link.label }}
            </NuxtLinkLocale>
          </li>
          <li>
            <NuxtLinkLocale to="/galerie" class="inline-block py-1 text-sm text-white/60 transition-colors hover:text-white">
              {{ $t('footer.references') }}
            </NuxtLinkLocale>
          </li>
        </ul>
      </div>

      <!-- Pages -->
      <div>
        <h2 class="text-[0.6875rem] uppercase tracking-[0.2em] text-white">{{ $t('footer.pages') }}</h2>
        <ul class="mt-5 flex flex-col gap-3">
          <li v-for="link in pageLinks" :key="link.to">
            <NuxtLinkLocale :to="link.to" class="inline-block py-1 text-sm text-white/60 transition-colors hover:text-white">
              {{ link.label }}
            </NuxtLinkLocale>
          </li>
        </ul>
      </div>

      <!-- Coordonnées -->
      <div>
        <h2 class="text-[0.6875rem] uppercase tracking-[0.2em] text-white">{{ $t('footer.contact') }}</h2>
        <ul class="mt-5 flex flex-col gap-3 text-sm text-white/60">
          <li>
            <a :href="`tel:${info.phonePrimary}`" class="inline-flex min-h-6 items-center transition-colors hover:text-white">
              {{ info.phoneDisplay }}
            </a>
          </li>
          <li>
            <a :href="`tel:${info.phoneSecondary}`" class="inline-flex min-h-6 items-center transition-colors hover:text-white">
              {{ info.phoneSecondaryDisplay }}
            </a>
          </li>
          <li>
            <a :href="`mailto:${info.email}`" class="inline-block break-all py-1 transition-colors hover:text-white">
              {{ info.email }}
            </a>
          </li>
          <li class="text-white/60">{{ $t('common.addressShort') }}</li>
          <li v-for="slot in info.hours" :key="slot.days" class="text-white/60">
            {{ slot.days }} : {{ slot.time }}
          </li>
        </ul>
      </div>

      <!-- Réseaux -->
      <div>
        <h2 class="text-[0.6875rem] uppercase tracking-[0.2em] text-white">{{ $t('footer.social') }}</h2>
        <ul class="mt-5 flex flex-col gap-3">
          <li v-for="link in socialLinks" :key="link.label">
            <a
              :href="link.href"
              target="_blank"
              rel="noopener noreferrer"
              class="inline-block py-1 text-sm text-white/60 transition-colors hover:text-white"
            >
              {{ link.label }}
            </a>
          </li>
        </ul>
      </div>
    </div>

    <div class="u-gutter flex flex-wrap items-center justify-between gap-4 border-t border-white/10 py-6 text-[0.6875rem] tracking-[0.1em] text-white/60">
      <span>{{ $t('footer.copyright', { year }) }}</span>
      <!-- Ces trois pages sont exigées : les libellés étaient affichés depuis
           l'origine, sans lien ni page derrière. -->
      <nav :aria-label="$t('footer.legalLabel')" class="flex flex-wrap items-center gap-x-3 gap-y-1">
        <template v-for="(link, i) in legalLinks" :key="link.to">
          <span v-if="i > 0" aria-hidden="true">·</span>
          <NuxtLinkLocale
            :to="link.to"
            class="inline-block py-1 transition-colors hover:text-white/80"
          >
            {{ link.label }}
          </NuxtLinkLocale>
        </template>
      </nav>
    </div>
  </footer>
</template>
