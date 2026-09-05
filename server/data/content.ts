/**
 * Contenu éditorial de référence.
 *
 * Ce fichier est la source unique du contenu : il alimente le seed de la base
 * (`server/database/seed.ts`) ET sert de repli quand `DATABASE_URL` n'est pas
 * configuré. Le site est donc pleinement fonctionnel sans base de données ;
 * la base ne fait que reprendre la main quand elle est disponible.
 */
import type {
  Branch,
  Domain,
  FaqItem,
  GalleryItem,
  RentalCategory,
  ServiceBlock,
  Testimonial,
} from '../../shared/types'

export const BRANCH_COLORS: Record<string, string> = {
  equipements: '#827148',
  events: '#E8A07C',
  etudes: '#3E3524',
  agro: '#A5AF79',
}

export const BRANCH_LABELS: Record<string, string> = {
  equipements: 'TBS Équipements',
  events: 'TBS Events',
  etudes: 'TBS Études & Conseils',
  agro: 'TBS Agro',
}

export const branches: Branch[] = [
  {
    slug: 'equipements',
    index: 1,
    name: 'TBS Équipements',
    tagline: 'Fourniture de matériels & équipements',
    description:
      "Mobilier et matériel de bureau, informatique, équipements hospitaliers et de laboratoire, matériel roulant : nous fournissons, livrons et installons pour les entreprises, les administrations et les ONG.",
    color: BRANCH_COLORS.equipements!,
    image: '/images/branche-equipements.jpg',
    imageAlt: 'Plateau de bureaux équipé par TBS Équipements',
    tags: ['Bureau', 'Informatique', 'Santé & labo', 'Roulant'],
  },
  {
    slug: 'events',
    index: 2,
    name: 'TBS Events',
    tagline: 'Location de matériel de réception & événementiel',
    description:
      "Mobilier, art de la table, décoration, son et lumière : nous équipons, installons et reprenons mariages, cérémonies, réceptions privées et événements d'entreprise, de 20 à 2 000 invités.",
    color: BRANCH_COLORS.events!,
    image: '/images/branche-events.jpg',
    imageAlt: 'Salle de réception dressée par TBS Events',
    tags: ['Mariages', 'Cérémonies', 'Entreprise', 'Clé en main'],
  },
  {
    slug: 'etudes',
    index: 3,
    name: 'TBS Études & Conseils',
    tagline: 'Études & prestations intellectuelles',
    description:
      "Études techniques et de faisabilité, conseil en organisation, formation, assistance à maîtrise d'ouvrage et montage de dossiers d'appels d'offres.",
    color: BRANCH_COLORS.etudes!,
    image: '/images/branche-etudes.jpg',
    imageAlt: 'Séance de travail TBS Études & Conseils',
    tags: ['Études', 'Conseil', 'Formation', 'AMO'],
  },
  {
    slug: 'agro',
    index: 4,
    name: 'TBS Agro',
    tagline: 'Agriculture & agro-industrie',
    description:
      'Intrants, petits équipements agricoles et matériel de transformation. Nous accompagnons coopératives, exploitations et projets de développement agro-industriel.',
    color: BRANCH_COLORS.agro!,
    image: '/images/branche-agro.jpg',
    imageAlt: 'Exploitation agricole accompagnée par TBS Agro',
    tags: ['Intrants', 'Équipements', 'Transformation', 'Coopératives'],
  },
]

export const rentalCategories: RentalCategory[] = [
  {
    slug: 'mobilier',
    name: 'Mobilier',
    refCount: 210,
    image: '/images/categorie-mobilier.jpg',
    imageAlt: 'Chaises et tables de réception',
  },
  {
    slug: 'art-de-la-table',
    name: 'Art de la table',
    refCount: 280,
    image: '/images/categorie-art-de-la-table.jpg',
    imageAlt: 'Assiettes, verres et couverts dressés',
  },
  {
    slug: 'nappage',
    name: 'Nappage',
    refCount: 95,
    image: '/images/categorie-nappage.jpg',
    imageAlt: 'Nappes, housses et serviettes',
  },
  {
    slug: 'decoration',
    name: 'Décoration',
    refCount: 160,
    image: '/images/categorie-decoration.jpg',
    imageAlt: "Chandeliers, vases et tapis d'honneur",
  },
  {
    slug: 'son-lumiere',
    name: 'Son & lumière',
    refCount: 70,
    image: '/images/categorie-son-lumiere.jpg',
    imageAlt: 'Piste de danse LED et éclairage de soirée',
  },
  {
    slug: 'tentes-structures',
    name: 'Tentes & structures',
    refCount: 45,
    image: '/images/categorie-tentes.jpg',
    imageAlt: 'Tentes, structures et planchers de réception',
  },
]

export const domains: Domain[] = [
  {
    branch: 'equipements',
    title: 'Mobilier & matériel de bureau',
    description:
      "Bureaux, fauteuils, armoires, banques d'accueil et aménagement complet de plateaux.",
  },
  {
    branch: 'equipements',
    title: 'Matériel informatique',
    description:
      'Postes de travail, portables, imprimantes, réseau, consommables et maintenance.',
  },
  {
    branch: 'equipements',
    title: 'Équipements hospitaliers & de laboratoire',
    description:
      'Mobilier médical, appareillage, réactifs et consommables pour cliniques et laboratoires.',
  },
  {
    branch: 'equipements',
    title: 'Matériel roulant',
    description:
      'Véhicules de service, utilitaires, engins, pièces détachées et suivi de flotte.',
  },
  {
    branch: 'events',
    title: 'Location de matériel de réception',
    description:
      'Mobilier, art de la table, nappage, décor, son et lumière — livrés et installés.',
  },
  {
    branch: 'events',
    title: 'Organisation & coordination',
    description: 'Scénographie, plan de salle, prestataires et présence le jour J.',
  },
  {
    branch: 'etudes',
    title: 'Études & prestations intellectuelles',
    description:
      "Études techniques, conseil en organisation, formation et assistance à maîtrise d'ouvrage.",
  },
  {
    branch: 'agro',
    title: 'Agriculture & agro-industrie',
    description:
      'Intrants, petits équipements, matériel de transformation et appui aux coopératives.',
  },
]

export const serviceBlocks: ServiceBlock[] = [
  // ── TBS Équipements ──────────────────────────────────────────────────────
  {
    branch: 'equipements',
    eyebrow: '01 — Bureau',
    title: 'Mobilier & matériel de bureau',
    description:
      "Aménagement complet de plateaux : bureaux, fauteuils ergonomiques, armoires, caissons et banques d'accueil. Nous chiffrons, livrons et montons sur site.",
    tags: ['Bureaux', 'Sièges', 'Rangement', 'Accueil'],
    image: '/images/branche-equipements.jpg',
    imageAlt: 'Bureaux équipés — mobilier et postes de travail',
  },
  {
    branch: 'equipements',
    eyebrow: '02 — Informatique',
    title: 'Matériel informatique',
    description:
      'Postes fixes et portables, imprimantes et copieurs, réseau et onduleurs, consommables. Installation, paramétrage et contrat de maintenance en option.',
    tags: ['Postes de travail', 'Impression', 'Réseau', 'Consommables'],
    image: '/images/equipements-informatique.jpg',
    imageAlt: 'Matériel informatique — postes de travail livrés',
  },
  {
    branch: 'equipements',
    eyebrow: '03 — Santé & laboratoire',
    title: 'Équipements hospitaliers & de laboratoire',
    description:
      'Mobilier médical, appareillage de diagnostic, verrerie, réactifs et consommables pour cliniques, cabinets et laboratoires. Livraison suivie et réapprovisionnement programmé.',
    tags: ['Mobilier médical', 'Appareillage', 'Réactifs', 'Consommables'],
    image: '/images/equipements-laboratoire.jpg',
    imageAlt: 'Laboratoire équipé — appareillage et consommables',
  },
  {
    branch: 'equipements',
    eyebrow: '04 — Matériel roulant',
    title: 'Matériel roulant',
    description:
      "Véhicules de service et utilitaires, engins, pièces détachées et pneumatiques. Nous accompagnons le renouvellement et l'entretien des flottes d'entreprise et d'institution.",
    tags: ['Véhicules', 'Utilitaires', 'Pièces', 'Suivi de flotte'],
    image: '/images/equipements-materiel-roulant.jpg',
    imageAlt: 'Matériel roulant — véhicules de service',
  },

  // ── TBS Events ───────────────────────────────────────────────────────────
  {
    branch: 'events',
    eyebrow: '01 — Mobilier',
    title: 'Chaises, tables, lounge',
    description:
      'Chaises Napoléon et banquet, tables rondes de 8 à 12 couverts, mange-debout, bars mobiles, canapés et poufs pour espaces lounge. Housses et galettes assorties.',
    tags: ['Chaises banquet', 'Tables rondes', 'Lounge', 'Bars'],
    image: '/images/events-mobilier.jpg',
    imageAlt: 'Mobilier de réception — chaises et tables installées',
  },
  {
    branch: 'events',
    eyebrow: '02 — Art de la table',
    title: 'Vaisselle, verrerie, nappage',
    description:
      'Assiettes et couverts par lignes complètes, verres à pied, gobelets, seaux à champagne. Nappes, chemins de table et serviettes lavés et repassés à chaque location.',
    tags: ['Assiettes', 'Verrerie', 'Couverts', 'Nappage'],
    image: '/images/events-dressage-or.jpg',
    imageAlt: 'Art de la table — couvert dressé en gros plan',
  },
  {
    branch: 'events',
    eyebrow: '03 — Décoration',
    title: 'Scénographie & décor',
    description:
      "Chandeliers, vases, drapés, arches, tapis d'honneur et potelets. Nous construisons une direction visuelle cohérente, de l'entrée des invités jusqu'au fond de scène.",
    tags: ['Chandeliers', 'Drapés', "Tapis d'honneur"],
    image: '/images/events-scenographie.jpg',
    imageAlt: 'Décoration — scénographie de salle',
  },
  {
    branch: 'events',
    eyebrow: '04 — Technique',
    title: 'Son, lumière & piste LED',
    description:
      'Sonorisation calibrée à la salle, micros, éclairage d’ambiance, piste de danse lumineuse et groupe électrogène. Un technicien reste en régie toute la soirée.',
    tags: ['Sono', 'Lumière', 'Piste LED', 'Groupe'],
    image: '/images/categorie-son-lumiere.jpg',
    imageAlt: 'Technique — piste LED et éclairage de soirée',
  },

  // ── TBS Études & Conseils ────────────────────────────────────────────────
  {
    branch: 'etudes',
    eyebrow: '01 — Études',
    title: 'Études techniques & de faisabilité',
    description:
      'Diagnostics, études techniques et économiques, dimensionnement et chiffrage. Nous produisons des livrables directement exploitables par vos financeurs et vos partenaires.',
    tags: ['Diagnostic', 'Faisabilité', 'Dimensionnement', 'Chiffrage'],
    image: '/images/branche-etudes.jpg',
    imageAlt: 'Séance de travail — étude et conseil',
  },
  {
    branch: 'etudes',
    eyebrow: '02 — Conseil & formation',
    title: 'Conseil en organisation & formation',
    description:
      'Accompagnement à la structuration des équipes, procédures, outils de gestion, et formation du personnel sur site ou en salle.',
    tags: ['Organisation', 'Procédures', 'Formation', 'Coaching'],
    image: '/images/etudes-formation.jpg',
    imageAlt: 'Formation et conseil en organisation',
  },

  // ── TBS Agro ─────────────────────────────────────────────────────────────
  {
    branch: 'agro',
    eyebrow: '01 — Intrants & équipements',
    title: 'Agriculture & intrants',
    description:
      'Semences, engrais, produits de traitement et petits équipements agricoles. Nous approvisionnons exploitations, coopératives et projets de développement, avec un suivi de campagne.',
    tags: ['Semences', 'Engrais', 'Traitement', 'Outillage'],
    image: '/images/branche-agro.jpg',
    imageAlt: 'Exploitation agricole — intrants et cultures',
  },
  {
    branch: 'agro',
    eyebrow: '02 — Agro-industrie',
    title: 'Transformation & agro-industrie',
    description:
      'Matériel de transformation et de conditionnement, équipements de stockage et de séchage. Nous accompagnons la montée en échelle des unités de production locales.',
    tags: ['Transformation', 'Conditionnement', 'Stockage', 'Séchage'],
    image: '/images/agro-transformation.jpg',
    imageAlt: 'Unité de transformation agro-industrielle',
  },
]

export const galleryItems: GalleryItem[] = [
  { id: 'gal-01', title: 'Mariage Adjovi — 620 invités', location: 'Agôè', category: 'mariage', branch: 'events', image: '/images/galerie-mariage-adjovi.jpg', imageAlt: "Mariage — vue d'ensemble de la salle" },
  { id: 'gal-02', title: 'Art de la table — ligne ivoire', location: null, category: 'decor', branch: 'events', image: '/images/galerie-verrerie.jpg', imageAlt: 'Détail — verrerie et chandeliers' },
  { id: 'gal-03', title: 'Séminaire annuel — 180 places', location: null, category: 'corporate', branch: 'events', image: '/images/galerie-seminaire.jpg', imageAlt: 'Séminaire — salle en configuration conférence' },
  { id: 'gal-04', title: 'Cérémonie officielle', location: null, category: 'ceremonie', branch: 'events', image: '/images/galerie-ceremonie-officielle.jpg', imageAlt: "Cérémonie — tapis d'honneur et potelets" },
  { id: 'gal-05', title: "Vin d'honneur — jardin", location: null, category: 'mariage', branch: 'events', image: '/images/galerie-vin-honneur.jpg', imageAlt: 'Mariage — cocktail extérieur' },
  { id: 'gal-06', title: 'Dîner de gala — 400 couverts', location: 'Lomé', category: 'corporate', branch: 'events', image: '/images/galerie-diner-gala.jpg', imageAlt: "Gala — dîner d'entreprise, plan large" },
  { id: 'gal-07', title: 'Centre de table — saison sèche', location: null, category: 'decor', branch: 'events', image: '/images/galerie-centre-de-table.jpg', imageAlt: 'Détail — nappage et centre de table' },
  { id: 'gal-08', title: 'Soirée blanche — Baguida', location: null, category: 'mariage', branch: 'events', image: '/images/galerie-soiree-blanche.jpg', imageAlt: 'Soirée — piste de danse lumineuse' },
  { id: 'gal-09', title: 'Baptême — chapiteau 200 places', location: null, category: 'ceremonie', branch: 'events', image: '/images/galerie-bapteme.jpg', imageAlt: 'Baptême — réception familiale sous chapiteau' },
  { id: 'gal-10', title: 'Équipement informatique — 40 postes', location: null, category: 'fourniture', branch: 'equipements', image: '/images/equipements-informatique.jpg', imageAlt: 'Livraison de matériel informatique' },
  { id: 'gal-11', title: 'Aménagement de bureaux — siège Lomé', location: 'Lomé', category: 'fourniture', branch: 'equipements', image: '/images/branche-etudes.jpg', imageAlt: 'Aménagement de bureaux livré' },
  { id: 'gal-12', title: 'Mariage Sika — 380 invités', location: null, category: 'mariage', branch: 'events', image: '/images/ambiance-blanc-or.jpg', imageAlt: 'Mariage — tables dressées' },
  { id: 'gal-13', title: 'Cérémonie coutumière — 500 places', location: null, category: 'ceremonie', branch: 'events', image: '/images/hero-reception.jpg', imageAlt: 'Cérémonie — salle dressée' },
  { id: 'gal-14', title: 'Gala annuel — 300 couverts', location: null, category: 'corporate', branch: 'events', image: '/images/branche-events.jpg', imageAlt: 'Gala — dîner assis' },
  { id: 'gal-15', title: 'Dressage — ligne or', location: null, category: 'decor', branch: 'events', image: '/images/events-dressage-or.jpg', imageAlt: 'Détail — couvert dressé' },
  { id: 'gal-16', title: 'Bénédiction nuptiale — 250 places', location: null, category: 'mariage', branch: 'events', image: '/images/categorie-tentes.jpg', imageAlt: 'Mariage — cérémonie sous chapiteau' },
  { id: 'gal-17', title: "Cocktail d'honneur — Baguida", location: 'Baguida', category: 'ceremonie', branch: 'events', image: '/images/ambiance-cocktail.jpg', imageAlt: 'Cocktail extérieur — mange-debout' },
  { id: 'gal-18', title: 'Soirée de lancement — piste LED', location: null, category: 'corporate', branch: 'events', image: '/images/ambiance-nuit-electrique.jpg', imageAlt: 'Soirée entreprise — éclairage' },
  { id: 'gal-19', title: 'Scénographie de scène — fond drapé', location: null, category: 'decor', branch: 'events', image: '/images/events-scenographie.jpg', imageAlt: 'Décor — fond de scène' },
  { id: 'gal-20', title: 'Nappage — chemins de table', location: null, category: 'decor', branch: 'events', image: '/images/categorie-nappage.jpg', imageAlt: 'Nappage — chemins de table' },
  { id: 'gal-21', title: "Laboratoire d'analyses — équipement livré", location: null, category: 'fourniture', branch: 'equipements', image: '/images/equipements-laboratoire.jpg', imageAlt: 'Laboratoire équipé' },
  { id: 'gal-22', title: 'Flotte de service — 6 véhicules', location: null, category: 'fourniture', branch: 'equipements', image: '/images/equipements-materiel-roulant.jpg', imageAlt: 'Matériel roulant livré' },
  { id: 'gal-23', title: 'Projet agricole — petits équipements', location: null, category: 'fourniture', branch: 'agro', image: '/images/branche-agro.jpg', imageAlt: 'Agrobusiness — équipements livrés' },
]

export const testimonials: Testimonial[] = [
  {
    quote:
      "Six cents invités, une salle transformée en une nuit. Le matin du mariage tout était en place, et personne n'a vu l'équipe travailler.",
    author: 'Akouvi & Kodjo',
    context: 'Mariage, Agôè',
  },
  {
    quote:
      'Nous confions nos galas annuels à TBS depuis quatre ans. Devis clair, matériel impeccable, aucun imprévu à gérer de notre côté.',
    author: 'Direction communication',
    context: 'Lomé',
  },
  {
    quote:
      "J'avais changé trois fois de plan de salle. Ils ont tout repris sans un soupir, et la piste de danse a fait l'unanimité.",
    author: 'Sandrine A.',
    context: 'Anniversaire, Baguida',
  },
]

export const faqItems: FaqItem[] = [
  {
    id: 'faq-1',
    group: 'TBS Events',
    question: "Combien de temps à l'avance faut-il réserver ?",
    answer:
      'Deux à quatre semaines pour un mariage ou une grande réception, surtout en saison sèche. Pour les demandes urgentes, appelez-nous : nous vérifions la disponibilité du stock immédiatement.',
  },
  {
    id: 'faq-2',
    group: 'TBS Events',
    question: 'La livraison et le montage sont-ils inclus ?',
    answer:
      'La livraison est incluse dans le Grand Lomé à partir d’un certain montant de location. Le montage et la mise en place sont chiffrés selon le volume et la configuration de la salle, et toujours indiqués sur le devis.',
  },
  {
    id: 'faq-3',
    group: 'TBS Events',
    question: 'Intervenez-vous en dehors de Lomé ?',
    answer:
      'Oui, sur tout le territoire togolais. Un forfait transport est ajouté selon la distance et le volume de matériel ; nous le calculons dès le premier échange.',
  },
  {
    id: 'faq-4',
    group: 'TBS Events',
    question: 'Faut-il rendre la vaisselle lavée ?',
    answer:
      'Non. Rendez le matériel débarrassé, nous nous occupons du lavage : chaque pièce repart contrôlée et propre pour la location suivante.',
  },
  {
    id: 'faq-5',
    group: 'TBS Events',
    question: 'Que se passe-t-il en cas de casse ?',
    answer:
      "Une caution est prévue au contrat. Les pièces cassées ou manquantes sont facturées au tarif de remplacement indiqué à l'avance sur le devis, sans surprise après l'événement.",
  },
  {
    id: 'faq-6',
    group: 'TBS Events',
    question: 'Peut-on visiter le stock avant de choisir ?',
    answer:
      'Bien sûr. Nos entrepôts d’Agôè-Démakpoè se visitent du lundi au samedi sur rendez-vous : vous voyez les chaises, les lignes de vaisselle et les nappages en vrai avant de valider.',
  },
  {
    id: 'faq-7',
    group: 'TBS Équipements, Études & Agro',
    question: "Répondez-vous aux appels d'offres ?",
    answer:
      "Oui, sur les quatre branches. TBS Distribution S.A.R.L participe aux consultations et appels d'offres publics et privés : dossier administratif à jour, offre technique et financière, factures normalisées et références vérifiables.",
  },
  {
    id: 'faq-8',
    group: 'TBS Équipements, Études & Agro',
    question: 'Quels délais pour une commande de fournitures ?',
    answer:
      'Les articles en stock partent sous 48 heures. Pour un équipement à importer, comptez deux à six semaines selon la nature du matériel ; le délai est engagé sur l’offre et suivi jusqu’à la mise en service.',
  },
]
