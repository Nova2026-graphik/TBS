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
 * ONG et bailleurs européens.
 */
const info = useSiteInfo()
const updatedAt = formatLegalDate(LEGAL_UPDATED_AT)
const processors = LEGAL_PROCESSORS

/**
 * La page dit ce qui est réellement en place. Annoncer « aucune mesure
 * d'audience » alors qu'un script tourne serait une fausse déclaration ;
 * l'inverse, une inquiétude gratuite.
 */
const { public: cfg } = useRuntimeConfig()
const analytics = isAnalyticsEnabled(cfg.analytics) ? cfg.analytics : null
const retentionMonths = QUOTE_RETENTION_MONTHS

usePageSeo({
  title: 'Politique de confidentialité',
  description:
    'Quelles données le formulaire de devis collecte, pourquoi, combien de temps elles sont conservées et comment exercer vos droits auprès de TBS Distribution S.A.R.L.',
  path: '/confidentialite',
})

useBreadcrumbSchema([{ name: 'Confidentialité', path: '/confidentialite' }])
</script>

<template>
  <div>
    <UiPageHero
      eyebrow="Confidentialité"
      title="Politique de"
      accent="confidentialité"
      lead="Ce que nous enregistrons quand vous demandez un devis, pourquoi, pour combien de temps, et comment le faire effacer."
    />

    <section class="u-gutter u-section bg-white">
      <p class="text-[0.6875rem] uppercase tracking-[0.16em] text-ink-mute">
        Dernière mise à jour : {{ updatedAt }}
      </p>

      <div class="u-prose mt-10">
        <h2>En bref</h2>
        <p>
          Ce site ne dépose <strong>aucun cookie</strong>, n'utilise aucun outil
          de mesure d'audience et ne pratique aucune publicité ciblée. La seule
          collecte de données a lieu lorsque vous remplissez volontairement le
          formulaire de demande de devis.
        </p>
        <p v-if="analytics">
          Une exception : une mesure d'audience <strong>sans cookie et sans
          identifiant individuel</strong> compte les pages consultées. Elle ne
          permet pas de vous reconnaître d'une visite à l'autre. Détail au
          paragraphe « Cookies et traceurs ».
        </p>

        <h2>Responsable du traitement</h2>
        <p>
          TBS Distribution S.A.R.L, {{ info.address }}.<br >
          Téléphone : <a :href="`tel:${info.phonePrimary}`">{{ info.phoneDisplay }}</a> —
          courriel : <a :href="`mailto:${info.email}`">{{ info.email }}</a>.
        </p>
        <p>
          L'identification complète de la société figure sur la page
          <NuxtLink to="/mentions-legales">mentions légales</NuxtLink>.
        </p>

        <h2>Données collectées</h2>
        <h3>Ce que vous saisissez</h3>
        <ul>
          <li><strong>Nom</strong> et <strong>téléphone</strong> — obligatoires, ce sont eux qui permettent de vous rappeler ;</li>
          <li><strong>Adresse électronique</strong> — facultative, pour vous envoyer la proposition écrite ;</li>
          <li><strong>Branche concernée</strong> et <strong>type de demande</strong> ;</li>
          <li><strong>Date de l'événement</strong>, <strong>nombre d'invités</strong> et <strong>lieu</strong> — facultatifs, pour dimensionner l'offre ;</li>
          <li><strong>Description du besoin</strong>.</li>
        </ul>

        <h3>Ce que le serveur enregistre</h3>
        <ul>
          <li>
            Une <strong>empreinte de votre adresse IP</strong> — l'adresse
            n'est jamais stockée en clair : seule une empreinte cryptographique
            irréversible l'est, pour limiter le nombre de demandes par heure et
            écarter les envois automatisés ;
          </li>
          <li>
            L'identifiant de votre navigateur (<strong>user-agent</strong>), à
            la même fin.
          </li>
        </ul>
        <p>
          Ces deux éléments servent exclusivement à protéger le formulaire des
          abus. Ils ne sont ni exploités à des fins commerciales, ni transmis à
          des tiers, et ne figurent pas dans les messages envoyés à l'équipe.
        </p>

        <h2>Finalités et base légale</h2>
        <ul>
          <li>
            <strong>Répondre à votre demande de devis</strong> — traitement
            nécessaire à l'exécution de mesures précontractuelles prises à
            votre demande ;
          </li>
          <li>
            <strong>Protéger le formulaire contre les abus</strong> — intérêt
            légitime de TBS à préserver le bon fonctionnement de son site ;
          </li>
          <li>
            <strong>Conserver la trace des échanges commerciaux</strong> —
            intérêt légitime, et respect des obligations comptables lorsqu'une
            location est effectivement conclue.
          </li>
        </ul>
        <p>
          Aucune donnée n'est utilisée pour de la prospection non sollicitée.
        </p>

        <h2>Destinataires</h2>
        <p>
          Les demandes sont accessibles aux seules personnes de TBS
          Distribution S.A.R.L chargées des devis. Elles transitent par des
          prestataires techniques agissant sur nos instructions :
        </p>
        <LegalFields :fields="processors" />
        <p>
          Cette liste sera complétée à la mise en ligne, une fois les
          prestataires retenus. Aucune donnée n'est vendue, louée ou échangée.
        </p>

        <h2>Durée de conservation</h2>
        <p>
          Les demandes de devis sont conservées
          <strong>{{ retentionMonths }} mois</strong> à compter du
          dernier échange, puis anonymisées : nom, téléphone, adresse
          électronique, lieu, description du besoin et éléments techniques sont
          effacés. Ne subsistent que la branche, le type de demande et les
          dates — des statistiques sans lien avec une personne.
        </p>
        <p>
          Cette anonymisation est <strong>automatique</strong> : une tâche
          planifiée la déclenche chaque nuit, elle ne dépend d'aucune
          intervention manuelle.
        </p>
        <p>
          Lorsqu'une location est conclue, les pièces comptables associées sont
          conservées pour la durée légale applicable aux documents commerciaux.
        </p>

        <h2>Vos droits</h2>
        <p>
          Vous disposez d'un droit d'<strong>accès</strong>, de
          <strong>rectification</strong>, d'<strong>effacement</strong>, de
          <strong>limitation</strong>, d'<strong>opposition</strong> et de
          <strong>portabilité</strong> sur les données vous concernant.
        </p>
        <p>
          Pour les exercer, écrivez à
          <a :href="`mailto:${info.email}`">{{ info.email }}</a> ou appelez le
          <a :href="`tel:${info.phonePrimary}`">{{ info.phoneDisplay }}</a>.
          Une réponse vous est apportée dans un délai d'un mois. Aucune
          justification n'est exigée pour demander la suppression d'une demande
          de devis.
        </p>
        <p>
          Si la réponse ne vous satisfait pas, vous pouvez saisir
          l'<strong>Instance de protection des données à caractère personnel
          (IPDCP)</strong>, autorité de contrôle togolaise. Les personnes
          résidant dans l'Union européenne peuvent également saisir l'autorité
          de contrôle de leur pays de résidence.
        </p>

        <h2>Sécurité</h2>
        <p>
          Le site est servi en HTTPS et transmet les en-têtes de sécurité
          usuels. Les demandes de devis sont stockées sur une base à accès
          restreint, l'adresse IP n'y figure que sous forme d'empreinte, et le
          formulaire est protégé contre les envois automatisés.
        </p>

        <h2>Cookies et traceurs</h2>
        <p>
          Le site ne dépose <strong>aucun cookie</strong> et n'utilise ni
          stockage local, ni pixel publicitaire. Aucune bannière de
          consentement n'est nécessaire : il n'y a rien à consentir.
        </p>
        <p v-if="analytics">
          La mesure d'audience est assurée par
          <strong>{{ analytics.provider === 'umami' ? 'Umami' : 'Plausible' }}</strong>
          ({{ analytics.host }}), choisi précisément parce qu'il fonctionne
          sans cookie et sans identifiant persistant. Sont comptés la page
          consultée, le pays, le type d'appareil et la provenance — jamais de
          quoi vous reconnaître. Sont également comptés quelques gestes utiles
          au suivi commercial : ouverture du formulaire de devis, envoi,
          clics sur les numéros et sur WhatsApp.
        </p>
        <p v-else>
          Aucun outil de mesure d'audience n'est en place.
        </p>

        <h2>Services tiers</h2>
        <p>
          La page <NuxtLink to="/contact">contact</NuxtLink> propose une carte
          fournie par <strong>OpenStreetMap</strong>.
          <strong>Elle ne se charge pas toute seule</strong> : rien n'est
          demandé à OpenStreetMap tant que vous n'avez pas cliqué sur
          « Afficher la carte ». Si vous le faites, ses serveurs reçoivent
          alors votre adresse IP et les caractéristiques de votre navigateur.
        </p>
        <p>
          Aucune autre ressource tierce n'est chargée : polices, images et
          scripts sont servis depuis ce site.
        </p>

        <h2>Modifications</h2>
        <p>
          Cette politique peut évoluer, notamment lorsque les prestataires
          techniques seront arrêtés. La date de dernière mise à jour figure en
          haut de page.
        </p>

        <h2>Autres documents</h2>
        <ul>
          <li><NuxtLink to="/mentions-legales">Mentions légales</NuxtLink></li>
          <li><NuxtLink to="/conditions-de-location">Conditions de location</NuxtLink></li>
        </ul>
      </div>
    </section>

    <SharedCtaBanner />
  </div>
</template>
