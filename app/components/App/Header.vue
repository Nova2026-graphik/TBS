<script setup lang="ts">
/**
 * Header collant.
 *
 * Améliorations par rapport à la maquette :
 *  - navigation par vraies routes (liens partageables, indexables) ;
 *  - état actif calculé par NuxtLink, pas par un state React ;
 *  - ombre portée qui n'apparaît qu'une fois la page défilée ;
 *  - tiroir mobile accessible : verrouillage du scroll, fermeture à Échap,
 *    focus renvoyé sur le bouton à la fermeture.
 */
const { t } = useI18n()
const localePath = useLocalePath()

const NAV = computed(() => [
  { key: 'home', to: '/' },
  { key: 'gallery', to: '/galerie' },
  { key: 'services', to: '/services' },
  { key: 'about', to: '/a-propos' },
  { key: 'advice', to: '/conseils' },
  { key: 'contact', to: '/contact' },
  { key: 'faq', to: '/faq' },
].map(item => ({ ...item, label: t(`nav.${item.key}`), to: localePath(item.to) })))

const route = useRoute()
const info = useSiteInfo()
const open = ref(false)
const toggleRef = ref<HTMLButtonElement | null>(null)
const drawerRef = ref<HTMLElement | null>(null)

const { y } = useWindowScroll()
const scrolled = computed(() => y.value > 12)

// Le tiroir se ferme à chaque changement de route.
watch(() => route.fullPath, () => {
  open.value = false
})

// Scroll verrouillé tant que le tiroir est ouvert.
watch(open, (isOpen) => {
  if (import.meta.server) return
  document.documentElement.style.overflow = isOpen ? 'hidden' : ''
  if (!isOpen) toggleRef.value?.focus()
})

onBeforeUnmount(() => {
  if (import.meta.client) document.documentElement.style.overflow = ''
})

onKeyStroke('Escape', () => {
  if (open.value) open.value = false
})
onClickOutside(drawerRef, () => {
  if (open.value) open.value = false
}, { ignore: [toggleRef] })
</script>

<template>
  <header
    class="sticky top-0 z-120 border-b border-ink/8 bg-white/90 backdrop-blur-lg transition-shadow duration-500"
    :class="scrolled ? 'shadow-header' : ''"
  >
    <div class="u-gutter flex items-center justify-between gap-6 py-[clamp(0.75rem,1.9vw,1.375rem)]">
      <NuxtLinkLocale to="/" class="shrink-0" :aria-label="$t('nav.homeLabel')">
        <NuxtImg
          src="/images/logo-tbs.png"
          alt="TBS Distribution S.A.R.L"
          width="400"
          height="200"
          preload
          class="h-[clamp(2rem,4.2vw,3.125rem)] w-auto"
        />
      </NuxtLinkLocale>

      <!-- Navigation bureau -->
      <nav class="hidden items-center gap-[clamp(0.875rem,2.4vw,2.125rem)] lg:flex" :aria-label="$t('nav.mainLabel')">
        <NuxtLinkLocale
          v-for="item in NAV"
          :key="item.to"
          :to="item.to"
          class="border-b py-1.5 text-xs uppercase tracking-[0.14em] transition-colors duration-500"
          :class="
            route.path === item.to
              ? 'border-gold text-ink'
              : 'border-transparent text-ink-soft hover:text-ink'
          "
        >
          {{ item.label }}
        </NuxtLinkLocale>

        <UiButton to="/contact" class="ml-[clamp(0.125rem,0.8vw,0.875rem)]">
          {{ $t('common.quote') }}
        </UiButton>
      </nav>

      <!-- Bouton menu mobile -->
      <button
        ref="toggleRef"
        type="button"
        class="flex size-11 flex-col justify-center gap-[5px] px-2 lg:hidden"
        :aria-expanded="open"
        aria-controls="mobile-nav"
        :aria-label="open ? $t('nav.close') : $t('nav.open')"
        @click="open = !open"
      >
        <span
          class="block h-px w-full bg-ink transition-transform duration-400 ease-[var(--ease-out-expo)]"
          :class="open ? 'translate-y-[3px] rotate-45' : ''"
        />
        <span
          class="block h-px w-full bg-ink transition-transform duration-400 ease-[var(--ease-out-expo)]"
          :class="open ? '-translate-y-[3px] -rotate-45' : ''"
        />
      </button>
    </div>

    <!-- Tiroir mobile -->
    <Transition
      enter-active-class="transition-[opacity,transform] duration-400 ease-[var(--ease-out-expo)]"
      enter-from-class="opacity-0 -translate-y-3"
      leave-active-class="transition-opacity duration-250"
      leave-to-class="opacity-0"
    >
      <div
        v-if="open"
        id="mobile-nav"
        ref="drawerRef"
        class="u-gutter absolute inset-x-0 top-full max-h-[calc(100dvh-var(--header-h))] overflow-y-auto bg-ink pb-8 pt-6 lg:hidden"
      >
        <nav class="flex flex-col" :aria-label="$t('nav.mobileLabel')">
          <NuxtLinkLocale
            v-for="item in NAV"
            :key="item.to"
            :to="item.to"
            class="border-b border-white/10 py-3 font-display text-[1.625rem] transition-colors last:border-0"
            :class="route.path === item.to ? 'text-cream' : 'text-white'"
          >
            {{ item.label }}
          </NuxtLinkLocale>
        </nav>

        <UiButton to="/contact" variant="light" block class="mt-5">
          {{ $t('common.quote') }}
        </UiButton>

        <!-- Le bandeau supérieur, qui porte le sélecteur de charte sur
             bureau, est masqué sous 768px : le tiroir le reprend. -->
        <div class="mt-6 flex items-center justify-between gap-4">
          <span class="text-[0.6875rem] uppercase tracking-[0.18em] text-white/55">
            {{ $t('theme.label') }}
          </span>
          <UiThemeSwitch />
        </div>

        <div class="mt-5 flex flex-col gap-1.5 text-[0.6875rem] tracking-[0.12em] text-white/55">
          <a :href="`tel:${info.phonePrimary}`">{{ info.phoneDisplay }}</a>
          <a :href="`mailto:${info.email}`">{{ info.email }}</a>
        </div>
      </div>
    </Transition>
  </header>
</template>
