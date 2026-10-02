<script setup lang="ts">
/**
 * Conditions générales de location — branche TBS Événementiel.
 *
 * Le déroulé est celui réellement pratiqué par TBS et décrit ailleurs sur le
 * site (devis, montage, reprise). Les montants et délais, eux, sont des
 * décisions de gestion : ils restent marqués « à compléter » jusqu'à
 * validation, et le devis accepté prévaut en toute hypothèse.
 *
 * **Page bilingue**, comme les deux autres documents légaux : la version
 * anglaise est une traduction de confort, et l'avertissement en tête de page
 * renvoie au texte français, seul opposable.
 */
const info = useSiteInfo()
const { t, locale } = useI18n()
const anglais = computed(() => locale.value === 'en')
const updatedAt = computed(() => formatLegalDate(LEGAL_UPDATED_AT, anglais.value ? 'en-GB' : 'fr-FR'))
const terms = RENTAL_TERMS
const pending = countPendingLegalFields(terms)

const contact = computed(() => ({
  email: info.email,
  phone: info.phoneDisplay,
  phoneHref: info.phonePrimary,
}))

usePageSeo({
  title: t('seo.rental.title'),
  description: t('seo.rental.description'),
  path: '/conditions-de-location',
})

useBreadcrumbSchema([{ name: t('footer.legal.rental'), path: '/conditions-de-location' }])
</script>

<template>
  <div>
    <UiPageHero
      data-hors-impression
      :eyebrow="$t('legal.rental.eyebrow')"
      :title="$t('legal.rental.title')"
      :accent="$t('legal.rental.accent')"
      :lead="$t('legal.rental.lead')"
    />

    <section class="u-gutter u-section bg-white">
      <div class="mx-auto flex max-w-[68ch] flex-wrap items-center justify-between gap-4">
        <p class="max-w-[68ch] text-[0.6875rem] uppercase tracking-[0.16em] text-ink-mute">
          {{ $t('legal.updatedAt', { date: updatedAt }) }}
        </p>
        <LegalTelechargement />
      </div>

      <LegalPrevaut v-if="anglais" />

      <aside
        v-if="pending > 0"
        class="mx-auto mt-8 max-w-[68ch] border border-dashed border-warn-border bg-warn-surface p-5 text-[0.9375rem] leading-[1.7] text-warn-text"
      >
        <strong class="font-medium">{{ $t('legal.rental.pendingTitle') }}</strong>
        {{ $t('legal.rental.pendingBody') }}
        {{ $t('legal.rental.pendingCount', { n: pending }, pending) }}
        <LegalTexte tag="span" :texte="$t('legal.rental.pendingPrevails')" />
      </aside>

      <div data-impression class="u-prose mx-auto mt-10 max-w-[68ch]">
        <h2>{{ $t('legal.rental.purpose') }}</h2>
        <LegalTexte :texte="$t('legal.rental.purposeBody')" />
        <LegalTexte :texte="$t('legal.rental.purposeQuote')" />

        <h2>{{ $t('legal.rental.booking') }}</h2>
        <LegalTexte :texte="$t('legal.rental.bookingQuote')" />
        <LegalTexte :texte="$t('legal.rental.bookingFirm')" />

        <h2>{{ $t('legal.rental.amounts') }}</h2>
        <LegalTexte :texte="$t('legal.rental.amountsIntro')" />
        <LegalFields :fields="terms" />
        <LegalTexte :texte="$t('legal.rental.amountsRefund')" />

        <h2>{{ $t('legal.rental.delivery') }}</h2>
        <LegalTexte :texte="$t('legal.rental.deliveryBody')" />
        <LegalTexte :texte="$t('legal.rental.deliveryAccess')" />

        <h2>{{ $t('legal.rental.use') }}</h2>
        <LegalTexte :texte="$t('legal.rental.useOwnership')" />
        <LegalTexte :texte="$t('legal.rental.useCare')" />

        <h2>{{ $t('legal.rental.breakage') }}</h2>
        <LegalTexte :texte="$t('legal.rental.breakageInventory')" />
        <LegalTexte :texte="$t('legal.rental.breakageWear')" />
        <LegalTexte :texte="$t('legal.rental.breakageLate')" />

        <h2>{{ $t('legal.rental.cancellation') }}</h2>
        <LegalTexte :texte="$t('legal.rental.cancellationNotice')" />
        <LegalTexte :texte="$t('legal.rental.cancellationPostpone')" />
        <LegalTexte :texte="$t('legal.rental.cancellationByTbs')" />

        <h2>{{ $t('legal.rental.liability') }}</h2>
        <LegalTexte :texte="$t('legal.rental.liabilityTbs')" />
        <LegalTexte :texte="$t('legal.rental.liabilityClient')" />
        <LegalTexte :texte="$t('legal.rental.liabilityForce')" />

        <h2>{{ $t('legal.rental.claims') }}</h2>
        <LegalTexte :texte="$t('legal.rental.claimsBody', contact)" />

        <h2>{{ $t('legal.rental.data') }}</h2>
        <LegalTexte :texte="$t('legal.rental.dataBody')" />

        <h2>{{ $t('legal.rental.law') }}</h2>
        <LegalTexte :texte="$t('legal.rental.lawBody')" />
      </div>
    </section>

    <SharedCtaBanner data-hors-impression />
  </div>
</template>
