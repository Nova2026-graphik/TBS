/**
 * Contenu de présentation purement statique.
 *
 * Contrairement aux branches, prestations, galerie et FAQ (stockées en base
 * et servies par /api/site-content), ces éléments sont indissociables de la
 * mise en page : les transformer en lignes de base coûterait plus qu'il ne
 * rapporterait. Ils vivent donc dans `shared/utils`, auto-importés côté
 * client comme côté serveur.
 */
import type { Inspiration, Offer, ProcessStep, StatItem } from '../types'

export interface ProcessBlock {
  eyebrow: string
  title: string
  titleAccent: string
  steps: ProcessStep[]
  footnote?: string
}

export const PROCESS_BY_BRANCH: Record<string, ProcessBlock> = {
  equipements: {
    eyebrow: 'TBS Équipements — comment nous travaillons',
    title: 'De la demande',
    titleAccent: 'à la mise en service',
    steps: [
      {
        step: '01',
        title: 'Expression de besoin',
        description:
          'Cahier des charges, quantités, spécifications techniques. Nous cadrons la demande avec vos équipes.',
      },
      {
        step: '02',
        title: 'Offre chiffrée',
        description:
          'Sourcing auprès de nos fournisseurs, offre technique et financière détaillée, délais engagés.',
      },
      {
        step: '03',
        title: 'Livraison & installation',
        description:
          'Transport, réception contradictoire, installation et mise en service sur site.',
      },
      {
        step: '04',
        title: 'Garantie & suivi',
        description:
          'Garantie constructeur, pièces, maintenance et réapprovisionnement des consommables.',
      },
    ],
    footnote:
      "TBS Distribution S.A.R.L répond également aux consultations et appels d'offres publics et privés : dossier administratif à jour, offre technique et financière, factures normalisées.",
  },

  events: {
    eyebrow: 'TBS Events — comment ça marche',
    title: 'Louez en',
    titleAccent: 'quatre étapes',
    steps: [
      {
        step: '01',
        title: 'Dites-nous tout',
        description:
          "Date, lieu, nombre d'invités, style souhaité. Un échange de dix minutes suffit.",
      },
      {
        step: '02',
        title: 'Recevez le devis',
        description: 'Inventaire détaillé, plan de salle et prix ferme sous 24 heures.',
      },
      {
        step: '03',
        title: 'On installe',
        description:
          "Livraison, montage et mise en place terminés avant l'arrivée des invités.",
      },
      {
        step: '04',
        title: 'On reprend tout',
        description:
          'Démontage et reprise du matériel après la fête. Vous ne rangez rien.',
      },
    ],
  },

  etudes: {
    eyebrow: 'TBS Études & Conseils — prestations',
    title: 'Assistance',
    titleAccent: "& maîtrise d'ouvrage",
    steps: [
      {
        step: '01',
        title: "Assistance à maîtrise d'ouvrage",
        description:
          'Suivi technique et administratif de vos projets, du cahier des charges à la réception des travaux ou des équipements.',
      },
      {
        step: '02',
        title: 'Montage de dossiers',
        description:
          "Constitution des dossiers d'appels d'offres, pièces administratives, offres techniques et financières.",
      },
      {
        step: '03',
        title: 'Commerce général & sourcing',
        description:
          'Sourcing local et import, achats groupés, fournitures diverses pour institutions et entreprises.',
      },
    ],
  },

  agro: {
    eyebrow: 'TBS Agro — accompagnement',
    title: 'Du champ',
    titleAccent: 'au marché',
    steps: [
      {
        step: '01',
        title: 'Appui aux coopératives',
        description:
          'Structuration, approvisionnement groupé et formation technique des membres.',
      },
      {
        step: '02',
        title: 'Projets & bailleurs',
        description:
          "Fourniture d'équipements pour les projets agricoles financés par les bailleurs et les ONG.",
      },
      {
        step: '03',
        title: 'Maintenance des équipements',
        description:
          'Pièces, entretien et remise en état du petit matériel et des unités de transformation.',
      },
    ],
  },
}

export const EVENT_OFFERS: Offer[] = [
  {
    label: 'Formule',
    title: 'Location simple',
    description:
      'Vous choisissez les références, nous livrons et reprenons. Idéal pour les familles et les petites réceptions.',
    note: 'Livraison incluse dès 250 000 F',
    featured: false,
  },
  {
    label: 'Le plus demandé',
    title: 'Location + installation',
    description:
      'Montage complet, mise en place de la salle et démontage après la fête. Nous gérons le plan de table avec vous.',
    note: 'Devis sur mesure sous 24h',
    featured: true,
  },
  {
    label: 'Formule',
    title: 'Événement clé en main',
    description:
      'Coordination complète : repérage du lieu, scénographie, prestataires, planning et présence le jour J.',
    note: 'Sur rendez-vous',
    featured: false,
  },
]

export const INSPIRATIONS: Inspiration[] = [
  {
    title: 'Blanc & or',
    description:
      'Nappage ivoire, chandeliers hauts, chaises Napoléon dorées. La valeur sûre des grandes cérémonies.',
    image: '/images/ambiance-blanc-or.jpg',
    imageAlt: 'Ambiance mariage blanc et or',
  },
  {
    title: 'Nuit électrique',
    description:
      "Piste de danse lumineuse, lounge sombre, éclairage d'ambiance piloté sur place.",
    image: '/images/ambiance-nuit-electrique.jpg',
    imageAlt: 'Ambiance soirée — piste LED et lumière colorée',
  },
  {
    title: 'Cocktail sous les arbres',
    description:
      "Mange-debout, bar mobile et guirlandes : le format idéal pour les lancements et les réceptions d'entreprise en extérieur.",
    image: '/images/ambiance-cocktail.jpg',
    imageAlt: 'Ambiance cocktail extérieur — mange-debout au jardin',
  },
]

export const HOME_STATS: StatItem[] = [
  {
    value: '900',
    suffix: '+',
    label: 'Références en stock',
    hint: 'Mobilier, vaisselle, décor, technique',
  },
  { value: '7j / 7', label: 'Livraison & montage', hint: 'Grand Lomé et tout le Togo' },
  { value: '24', suffix: 'h', label: 'Devis chiffré', hint: 'Un conseiller dédié à votre date' },
  { value: '100 %', label: 'Matériel contrôlé', hint: 'Lavé et vérifié avant chaque départ' },
]

export const ABOUT_STATS: StatItem[] = [
  { value: '2014', label: 'Année de création' },
  { value: '480', suffix: '+', label: 'Événements équipés' },
  { value: '4', label: "Branches d'activité" },
  { value: '18', label: 'Personnes sur le terrain' },
]

/** Libellés courts des branches, réutilisés dans les filtres et le formulaire. */
export const BRANCH_TABS = [
  { slug: 'equipements', label: 'Équipements', color: '#827148' },
  { slug: 'events', label: 'Events', color: '#E8A07C' },
  { slug: 'etudes', label: 'Études & Conseils', color: '#3E3524' },
  { slug: 'agro', label: 'Agro', color: '#A5AF79' },
] as const

/** Filtres de la galerie. */
export const GALLERY_FILTERS = [
  { value: 'all', label: 'Tout voir' },
  { value: 'mariage', label: 'Mariages' },
  { value: 'ceremonie', label: 'Cérémonies' },
  { value: 'corporate', label: 'Entreprise' },
  { value: 'decor', label: 'Décor & détails' },
  { value: 'fourniture', label: 'Fournitures & équipements' },
] as const

/**
 * Comptes sociaux. `url: null` = compte inexistant ou non communiqué : le pied
 * de page n'affiche alors rien du tout.
 *
 * Un lien mort — `href="#"` — était pire que l'absence : au clic la page
 * remontait en haut, et les lecteurs d'écran annonçaient un lien sans
 * destination. Renseigner une URL ici suffit à réafficher l'entrée.
 */
export const SOCIAL_ACCOUNTS: { label: string, url: string | null }[] = [
  { label: 'Facebook', url: null },
  { label: 'Instagram', url: null },
  { label: 'LinkedIn', url: null },
]
