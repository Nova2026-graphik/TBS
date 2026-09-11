<script setup lang="ts">
/**
 * Conditions générales de location — branche TBS Événementiel.
 *
 * Le déroulé est celui réellement pratiqué par TBS et décrit ailleurs sur le
 * site (devis, montage, reprise). Les montants et délais, eux, sont des
 * décisions de gestion : ils restent marqués « à compléter » jusqu'à
 * validation, et le devis accepté prévaut en toute hypothèse.
 */
const info = useSiteInfo()
const updatedAt = formatLegalDate(LEGAL_UPDATED_AT)
const terms = RENTAL_TERMS
const pending = countPendingLegalFields(terms)

usePageSeo({
  title: 'Conditions de location',
  description:
    'Devis et réservation, caution, livraison et reprise, casse et manquants, annulation, responsabilité : les conditions de location du matériel de réception TBS Événementiel.',
  path: '/conditions-de-location',
})

useBreadcrumbSchema([{ name: 'Conditions de location', path: '/conditions-de-location' }])

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
      eyebrow="Conditions de location"
      title="Conditions"
      accent="de location"
      lead="Ce qui est convenu quand vous louez du matériel de réception : réservation, livraison, reprise, casse et annulation."
    />

    <section class="u-gutter u-section bg-white">
      <p class="text-[0.6875rem] uppercase tracking-[0.16em] text-ink-mute">
        Dernière mise à jour : {{ updatedAt }}
      </p>

      <aside
        v-if="pending > 0"
        class="mt-8 max-w-[72ch] border border-dashed border-warn-border bg-warn-surface p-5 text-[0.9375rem] leading-[1.7] text-warn-text"
      >
        <strong class="font-medium">Document en cours de validation.</strong>
        Le déroulé décrit ci-dessous est celui pratiqué par TBS.
        {{ pending }} valeur{{ pending > 1 ? 's' : '' }} commerciale{{ pending > 1 ? 's' : '' }}
        — acompte, caution, délais d'annulation — reste{{ pending > 1 ? 'nt' : '' }} à arrêter.
        En attendant, <strong class="font-medium">seul le devis accepté fait foi</strong>.
      </aside>

      <div class="u-prose mt-10">
        <h2>Objet</h2>
        <p>
          Les présentes conditions régissent la location de matériel de
          réception par TBS Distribution S.A.R.L — mobilier, art de la table,
          nappage, décoration, sonorisation et éclairage — ainsi que les
          prestations de livraison, montage et reprise associées.
        </p>
        <p>
          Elles complètent le devis accepté. <strong>En cas de divergence, le
            devis prévaut</strong> : il porte le détail du matériel, les dates,
          le lieu et le prix ferme convenus.
        </p>

        <h2>Devis et réservation</h2>
        <p>
          Toute demande donne lieu à un devis chiffré, adressé sous 24 heures
          ouvrées. Le devis précise l'inventaire, les quantités, les dates de
          mise à disposition et de reprise, le lieu et le montant total.
        </p>
        <p>
          La réservation devient ferme à l'acceptation écrite du devis et au
          versement de l'acompte. Le matériel n'est retenu qu'à compter de ce
          moment : en haute saison, un devis non confirmé ne garantit aucune
          disponibilité.
        </p>

        <h2>Montants, caution et délais</h2>
        <p>
          Les valeurs suivantes s'appliquent à toute location, sauf mention
          contraire au devis :
        </p>
        <LegalFields :fields="terms" />
        <p>
          La caution est restituée après reprise et vérification du matériel,
          déduction faite des éventuels manquants ou dégradations.
        </p>

        <h2>Livraison, montage et reprise</h2>
        <p>
          TBS livre, monte et met en place le matériel avant l'heure convenue,
          puis démonte et reprend après la manifestation. Les créneaux figurent
          au devis.
        </p>
        <p>
          Le client garantit un accès praticable au lieu de la manifestation
          — voie carrossable, aire de déchargement, espace de montage dégagé —
          et la présence d'un interlocuteur à la livraison comme à la reprise.
          Si l'accès est impossible ou l'espace non libéré, l'attente et le
          second passage sont facturés.
        </p>

        <h2>Usage du matériel</h2>
        <p>
          Le matériel reste la propriété de TBS Distribution S.A.R.L pendant
          toute la durée de la location. Il ne peut être ni sous-loué, ni
          prêté, ni déplacé hors du lieu indiqué au devis, ni modifié.
        </p>
        <p>
          Il est mis à disposition lavé, vérifié et compté. Le client en
          prend soin en bon père de famille et le protège des intempéries et
          des dégradations pendant toute la durée de la mise à disposition.
        </p>

        <h2>Casse, manquants et retards</h2>
        <p>
          Un inventaire contradictoire est établi à la livraison et à la
          reprise. Le matériel manquant, cassé ou rendu inutilisable est
          facturé sur la base indiquée au tableau ci-dessus.
        </p>
        <p>
          L'usure normale n'est pas facturée. Une nappe tachée est nettoyée par
          TBS ; une nappe déchirée ou brûlée est remplacée.
        </p>
        <p>
          Tout matériel non restitué à la date convenue prolonge la location et
          est facturé au tarif journalier, jusqu'à restitution effective.
        </p>

        <h2>Annulation et report</h2>
        <p>
          Toute annulation se signale par écrit — courriel ou message
          WhatsApp — au plus tôt. Les délais et retenues applicables figurent
          au tableau ci-dessus.
        </p>
        <p>
          Un report à une date ultérieure est accepté sans frais dans la limite
          des disponibilités, lorsqu'il est demandé dans le délai d'annulation
          sans frais.
        </p>
        <p>
          Si TBS se trouve dans l'impossibilité d'assurer la prestation, les
          sommes versées sont intégralement restituées, sans autre indemnité.
        </p>

        <h2>Responsabilité</h2>
        <p>
          TBS répond de la conformité du matériel livré et de la bonne
          exécution du montage. Sa responsabilité est limitée au montant de la
          location concernée et ne couvre pas les dommages indirects.
        </p>
        <p>
          Le client répond du matériel dès la livraison et jusqu'à la reprise,
          y compris en cas de vol, de dégradation par un tiers ou d'intempérie.
          Il lui appartient de vérifier que son assurance couvre la
          manifestation.
        </p>
        <p>
          Aucune des parties n'est tenue responsable d'un manquement dû à un
          cas de force majeure.
        </p>

        <h2>Réclamations</h2>
        <p>
          Toute réclamation se signale dans les 48 heures suivant la reprise,
          par courriel à <a :href="`mailto:${info.email}`">{{ info.email }}</a>
          ou par téléphone au
          <a :href="`tel:${info.phonePrimary}`">{{ info.phoneDisplay }}</a>.
          Passé ce délai, la prestation est réputée acceptée.
        </p>

        <h2>Données personnelles</h2>
        <p>
          Les informations transmises lors d'une demande de devis sont traitées
          conformément à la
          <NuxtLinkLocale to="/confidentialite">politique de confidentialité</NuxtLinkLocale>.
        </p>

        <h2>Droit applicable et litiges</h2>
        <p>
          Les présentes conditions sont soumises au <strong>droit
            togolais</strong>. En cas de différend, les parties recherchent
          d'abord une solution amiable. À défaut d'accord, le litige relève des
          <strong>tribunaux compétents de Lomé</strong>.
        </p>
      </div>
    </section>

    <SharedCtaBanner />
  </div>
</template>
