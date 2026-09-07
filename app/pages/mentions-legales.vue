<script setup lang="ts">
/**
 * Mentions légales.
 *
 * Au Togo, l'identification d'une société commerciale — RCCM, NIF, siège,
 * capital, gérant — est obligatoire sur ses supports de communication.
 * Les valeurs encore attendues de TBS sont marquées en clair sur la page :
 * elles se renseignent dans `shared/utils/legalData.ts`.
 */
const info = useSiteInfo()
const updatedAt = formatLegalDate(LEGAL_UPDATED_AT)
const identity = LEGAL_IDENTITY
const host = LEGAL_HOST
const pending = countPendingLegalFields(identity, host)

usePageSeo({
  title: 'Mentions légales',
  description:
    'Identification de TBS Distribution S.A.R.L : raison sociale, forme juridique, siège social, RCCM, NIF, gérant et hébergeur du site.',
  path: '/mentions-legales',
})

useBreadcrumbSchema([{ name: 'Mentions légales', path: '/mentions-legales' }])

/**
 * Page française uniquement.
 *
 * Ce document engage la société au regard du droit togolais. Une traduction
 * non relue par un juriste ne serait pas un service mais une prise de risque :
 * la version anglaise renvoie donc ici, et le lien du pied de page reste
 * valide dans les deux langues.
 */
defineI18nRoute({ locales: ['fr'] })
</script>

<template>
  <div>
    <UiPageHero
      eyebrow="Mentions légales"
      title="Mentions"
      accent="légales"
      lead="Qui édite ce site, qui l'héberge, et à qui appartiennent les contenus."
    />

    <section class="u-gutter u-section bg-white">
      <p class="text-[0.6875rem] uppercase tracking-[0.16em] text-ink-mute">
        Dernière mise à jour : {{ updatedAt }}
      </p>

      <!-- Bandeau de suivi : il disparaît de lui-même quand les dernières
           informations sont renseignées dans `shared/utils/legalData.ts`. -->
      <aside
        v-if="pending > 0"
        class="mt-8 max-w-[72ch] border border-dashed border-[#c4633f] bg-[#fbeae5] p-5 text-[0.9375rem] leading-[1.7] text-[#8a2b12]"
      >
        <strong class="font-medium">
          {{ pending }} information{{ pending > 1 ? 's' : '' }} manque{{ pending > 1 ? 'nt' : '' }} encore.
        </strong>
        Elles sont signalées ci-dessous et doivent être communiquées par TBS
        avant la mise en ligne : identification au registre du commerce,
        identification fiscale, capital, gérant et coordonnées de l'hébergeur.
      </aside>

      <div class="u-prose mt-10">
        <h2>Éditeur du site</h2>
        <LegalFields :fields="identity" />
        <p>
          Téléphone : <a :href="`tel:${info.phonePrimary}`">{{ info.phoneDisplay }}</a>
          et <a :href="`tel:${info.phoneSecondary}`">{{ info.phoneSecondaryDisplay }}</a>.
          Courriel : <a :href="`mailto:${info.email}`">{{ info.email }}</a>.
        </p>

        <h2>Directeur de la publication</h2>
        <p>
          Le gérant de TBS Distribution S.A.R.L, dont le nom figure au bloc
          ci-dessus. Toute demande relative au contenu du site peut lui être
          adressée à <a :href="`mailto:${info.email}`">{{ info.email }}</a>.
        </p>

        <h2>Hébergeur</h2>
        <p>
          Le site est un site statique servi par un serveur Node. Le prestataire
          d'hébergement n'est pas encore arrêté ; ses coordonnées seront
          publiées ici à la mise en ligne.
        </p>
        <LegalFields :fields="host" />

        <h2>Propriété intellectuelle</h2>
        <p>
          La dénomination <strong>TBS Distribution</strong>, le logotype, la
          charte graphique, les textes et la structure de ce site sont la
          propriété de TBS Distribution S.A.R.L. Toute reproduction,
          représentation ou adaptation, totale ou partielle, sans autorisation
          écrite préalable est interdite.
        </p>
        <p>
          Les demandes d'autorisation se font à
          <a :href="`mailto:${info.email}`">{{ info.email }}</a>.
        </p>

        <h2>Crédits photographiques</h2>
        <p>
          Les photographies actuellement en ligne proviennent de la maquette du
          site et sont issues de banques d'images. Elles seront remplacées par
          des clichés des réalisations de TBS ; les crédits correspondants
          seront alors publiés ici.
        </p>

        <h2>Signaler une erreur</h2>
        <p>
          Une information inexacte sur cette page ? Écrivez à
          <a :href="`mailto:${info.email}`">{{ info.email }}</a> ou appelez le
          <a :href="`tel:${info.phonePrimary}`">{{ info.phoneDisplay }}</a>.
          La correction est faite sans délai.
        </p>

        <h2>Autres documents</h2>
        <ul>
          <li>
            <NuxtLinkLocale to="/conditions-de-location">Conditions de location</NuxtLinkLocale> —
            devis, caution, livraison, annulation et responsabilité.
          </li>
          <li>
            <NuxtLinkLocale to="/confidentialite">Politique de confidentialité</NuxtLinkLocale> —
            données collectées par le formulaire de devis et droits associés.
          </li>
        </ul>
      </div>
    </section>

    <SharedCtaBanner />
  </div>
</template>
