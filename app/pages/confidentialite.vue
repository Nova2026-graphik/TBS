<script setup lang="ts">
/**
 * Politique de confidentialité.
 *
 * Décrit exactement ce que le formulaire de devis enregistre, `ip_hash` et
 * `user_agent` compris — ces deux champs servent l'anti-abus et sont les plus
 * faciles à passer sous silence, donc les plus importants à déclarer.
 *
 * Cadre : loi togolaise n° 2019-014 relative à la protection des données à
 * caractère personnel, alignée sur le RGPD — le site s'adresse aussi à des
 * ONG et bailleurs européens. C'est aussi la page légale qui avait le plus
 * besoin d'une version anglaise : un bailleur européen la lit avant de
 * remplir le formulaire, pas après.
 *
 * **Page bilingue**, avec l'avertissement d'usage : la version française fait
 * foi.
 */
const info = useSiteInfo()
const { t, locale } = useI18n()
const anglais = computed(() => locale.value === 'en')
const updatedAt = computed(() => formatLegalDate(LEGAL_UPDATED_AT, anglais.value ? 'en-GB' : 'fr-FR'))
const processors = LEGAL_PROCESSORS

/**
 * La page dit ce qui est réellement en place. Annoncer « aucune mesure
 * d'audience » alors qu'un script tourne serait une fausse déclaration ;
 * l'inverse, une inquiétude gratuite.
 */
const { public: cfg } = useRuntimeConfig()
const analytics = isAnalyticsEnabled(cfg.analytics) ? cfg.analytics : null
const retentionMonths = QUOTE_RETENTION_MONTHS

const contact = computed(() => ({
  address: info.address,
  email: info.email,
  phone: info.phoneDisplay,
  phoneHref: info.phonePrimary,
}))

usePageSeo({
  title: t('seo.privacy.title'),
  description: t('seo.privacy.description'),
  path: '/confidentialite',
})

useBreadcrumbSchema([{ name: t('footer.legal.privacy'), path: '/confidentialite' }])
</script>

<template>
  <div>
    <UiPageHero
      data-hors-impression
      :eyebrow="$t('legal.privacy.eyebrow')"
      :title="$t('legal.privacy.title')"
      :accent="$t('legal.privacy.accent')"
      :lead="$t('legal.privacy.lead')"
    />

    <section class="u-gutter u-section bg-white">
      <div class="mx-auto flex max-w-[68ch] flex-wrap items-center justify-between gap-4">
        <p class="max-w-[68ch] text-[0.6875rem] uppercase tracking-[0.16em] text-ink-mute">
          {{ $t('legal.updatedAt', { date: updatedAt }) }}
        </p>
        <LegalTelechargement />
      </div>

      <LegalPrevaut v-if="anglais" />

      <div data-impression class="u-prose mx-auto mt-10 max-w-[68ch]">
        <h2>{{ $t('legal.privacy.summary') }}</h2>
        <LegalTexte :texte="$t('legal.privacy.summaryBody')" />
        <LegalTexte v-if="analytics" :texte="$t('legal.privacy.summaryAnalytics')" />

        <h2>{{ $t('legal.privacy.controller') }}</h2>
        <LegalTexte :texte="$t('legal.privacy.controllerBody', contact)" />
        <LegalTexte :texte="$t('legal.privacy.controllerContact', contact)" />
        <LegalTexte :texte="$t('legal.privacy.controllerIdentity')" />

        <h2>{{ $t('legal.privacy.collected') }}</h2>
        <h3>{{ $t('legal.privacy.collectedYou') }}</h3>
        <LegalListe cle="legal.privacy.collectedYouItems" />

        <h3>{{ $t('legal.privacy.collectedServer') }}</h3>
        <LegalListe cle="legal.privacy.collectedServerItems" />
        <LegalTexte :texte="$t('legal.privacy.collectedServerUse')" />

        <h2>{{ $t('legal.privacy.purposes') }}</h2>
        <LegalListe cle="legal.privacy.purposesItems" />
        <LegalTexte :texte="$t('legal.privacy.purposesNoProspecting')" />

        <h2>{{ $t('legal.privacy.recipients') }}</h2>
        <LegalTexte :texte="$t('legal.privacy.recipientsIntro')" />
        <LegalFields :fields="processors" />
        <LegalTexte :texte="$t('legal.privacy.recipientsNone')" />

        <h2>{{ $t('legal.privacy.retention') }}</h2>
        <LegalTexte :texte="$t('legal.privacy.retentionCaveat')" />
        <LegalTexte :texte="$t('legal.privacy.retentionBody', { months: retentionMonths })" />
        <LegalTexte :texte="$t('legal.privacy.retentionAuto')" />
        <LegalTexte :texte="$t('legal.privacy.retentionAccounting')" />

        <h2>{{ $t('legal.privacy.rights') }}</h2>
        <LegalTexte :texte="$t('legal.privacy.rightsBody')" />
        <LegalTexte :texte="$t('legal.privacy.rightsHow', contact)" />
        <LegalTexte :texte="$t('legal.privacy.rightsAuthority')" />

        <h2>{{ $t('legal.privacy.security') }}</h2>
        <LegalTexte :texte="$t('legal.privacy.securityBody')" />

        <h2>{{ $t('legal.privacy.cookies') }}</h2>
        <LegalTexte :texte="$t('legal.privacy.cookiesBody')" />
        <LegalTexte
          v-if="analytics"
          :texte="$t('legal.privacy.cookiesAnalytics', {
            provider: analytics.provider === 'umami' ? 'Umami' : 'Plausible',
            host: analytics.host,
          })"
        />
        <LegalTexte v-else :texte="$t('legal.privacy.cookiesNoAnalytics')" />

        <h2>{{ $t('legal.privacy.thirdParties') }}</h2>
        <LegalTexte :texte="$t('legal.privacy.thirdPartiesMap')" />
        <LegalTexte :texte="$t('legal.privacy.thirdPartiesNone')" />

        <h2>{{ $t('legal.privacy.changes') }}</h2>
        <LegalTexte :texte="$t('legal.privacy.changesBody')" />

        <h2>{{ $t('legal.privacy.others') }}</h2>
        <LegalListe cle="legal.privacy.othersItems" />
      </div>
    </section>

    <SharedCtaBanner data-hors-impression />
  </div>
</template>
