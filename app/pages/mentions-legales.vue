<script setup lang="ts">
/**
 * Mentions légales.
 *
 * Au Togo, l'identification d'une société commerciale — RCCM, NIF, siège,
 * capital, gérant — est obligatoire sur ses supports de communication.
 * Les valeurs encore attendues de TBS sont marquées en clair sur la page :
 * elles se renseignent dans `shared/utils/legalData.ts`.
 *
 * **Page bilingue.** Le document engage la société au regard du droit
 * togolais : la version anglaise est une traduction de confort, et la page le
 * dit en toutes lettres par le bandeau `legal.prevails`, qui renvoie au texte
 * français. Le texte lui-même vit dans les fichiers de langue comme celui de
 * toutes les autres pages — un document légal qu'on ne peut pas relire dans
 * sa langue n'est pas lu du tout.
 */
const info = useSiteInfo()
const { t, locale } = useI18n()
const anglais = computed(() => locale.value === 'en')
const updatedAt = computed(() => formatLegalDate(LEGAL_UPDATED_AT, anglais.value ? 'en-GB' : 'fr-FR'))
const identity = LEGAL_IDENTITY
const host = LEGAL_HOST
const pending = countPendingLegalFields(identity, host)

/** Coordonnées réinjectées dans les phrases traduites, pas découpées en morceaux. */
const contact = computed(() => ({
  email: info.email,
  phone: info.phoneDisplay,
  phoneHref: info.phonePrimary,
  phone2: info.phoneSecondaryDisplay,
  phone2Href: info.phoneSecondary,
}))

usePageSeo({
  title: t('seo.legalNotice.title'),
  description: t('seo.legalNotice.description'),
  path: '/mentions-legales',
})

useBreadcrumbSchema([{ name: t('footer.legal.mentions'), path: '/mentions-legales' }])
</script>

<template>
  <div>
    <UiPageHero
      data-hors-impression
      :eyebrow="$t('legal.notice.eyebrow')"
      :title="$t('legal.notice.title')"
      :accent="$t('legal.notice.accent')"
      :lead="$t('legal.notice.lead')"
    />

    <section class="u-gutter u-section bg-white">
      <div class="mx-auto flex max-w-[68ch] flex-wrap items-center justify-between gap-4">
        <p class="max-w-[68ch] text-[0.6875rem] uppercase tracking-[0.16em] text-ink-mute">
          {{ $t('legal.updatedAt', { date: updatedAt }) }}
        </p>
        <LegalTelechargement />
      </div>

      <LegalPrevaut v-if="anglais" />

      <!-- Bandeau de suivi : il disparaît de lui-même quand les dernières
           informations sont renseignées dans `shared/utils/legalData.ts`. -->
      <aside
        v-if="pending > 0"
        class="mx-auto mt-8 max-w-[68ch] border border-dashed border-warn-border bg-warn-surface p-5 text-[0.9375rem] leading-[1.7] text-warn-text"
      >
        <strong class="font-medium">{{ $t('legal.notice.pendingCount', { n: pending }, pending) }}</strong>
        {{ $t('legal.notice.pendingBody') }}
      </aside>

      <div data-impression class="u-prose mx-auto mt-10 max-w-[68ch]">
        <h2>{{ $t('legal.notice.publisher') }}</h2>
        <LegalFields :fields="identity" />
        <LegalTexte :texte="$t('legal.notice.publisherContact', contact)" />

        <h2>{{ $t('legal.notice.director') }}</h2>
        <LegalTexte :texte="$t('legal.notice.directorBody', contact)" />

        <h2>{{ $t('legal.notice.host') }}</h2>
        <LegalTexte :texte="$t('legal.notice.hostBody')" />
        <LegalFields :fields="host" />

        <h2>{{ $t('legal.notice.ip') }}</h2>
        <LegalTexte :texte="$t('legal.notice.ipBody')" />
        <LegalTexte :texte="$t('legal.notice.ipRequests', contact)" />

        <h2>{{ $t('legal.notice.credits') }}</h2>
        <LegalTexte :texte="$t('legal.notice.creditsBody')" />

        <h2>{{ $t('legal.notice.report') }}</h2>
        <LegalTexte :texte="$t('legal.notice.reportBody', contact)" />

        <h2>{{ $t('legal.notice.others') }}</h2>
        <LegalListe cle="legal.notice.othersItems" />
      </div>
    </section>

    <SharedCtaBanner data-hors-impression />
  </div>
</template>
