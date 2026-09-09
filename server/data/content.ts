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
  Equipment,
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
      'Mobilier et matériel de bureau, informatique, équipements hospitaliers et de laboratoire, matériel roulant : nous fournissons, livrons et installons pour les entreprises, les administrations et les ONG.',
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
      'Mobilier, art de la table, décoration, son et lumière : nous équipons, installons et reprenons mariages, cérémonies, réceptions privées et événements d\'entreprise, de 20 à 2 000 invités.',
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
      'Études techniques et de faisabilité, conseil en organisation, formation, assistance à maîtrise d\'ouvrage et montage de dossiers d\'appels d\'offres.',
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
    imageAlt: 'Chandeliers, vases et tapis d\'honneur',
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
    slug: 'mobilier-bureau',
    branch: 'equipements',
    title: 'Mobilier & matériel de bureau',
    description:
      'Bureaux, fauteuils, armoires, banques d\'accueil et aménagement complet de plateaux.',
  },
  {
    slug: 'informatique',
    branch: 'equipements',
    title: 'Matériel informatique',
    description:
      'Postes de travail, portables, imprimantes, réseau, consommables et maintenance.',
  },
  {
    slug: 'sante-laboratoire',
    branch: 'equipements',
    title: 'Équipements hospitaliers & de laboratoire',
    description:
      'Mobilier médical, appareillage, réactifs et consommables pour cliniques et laboratoires.',
  },
  {
    slug: 'roulant',
    branch: 'equipements',
    title: 'Matériel roulant',
    description:
      'Véhicules de service, utilitaires, engins, pièces détachées et suivi de flotte.',
  },
  {
    slug: 'outillage',
    branch: 'equipements',
    title: 'Outillage & équipement d\'atelier',
    description:
      'Mallettes et coffrets, mesure électrique, découpe, soudure, échelles et équipement de travail en hauteur.',
  },
  {
    slug: 'controle-acces',
    branch: 'equipements',
    title: 'Contrôle d\'accès & sécurité',
    description:
      'Barrières, badges, centrales et pointeuses biométriques, vidéosurveillance intérieure et extérieure.',
  },
  {
    slug: 'chimie-reactifs',
    branch: 'equipements',
    title: 'Produits chimiques & réactifs',
    description:
      'Réactifs de laboratoire, produits de traitement de l\'eau et produits chimiques de qualité analytique ou alimentaire.',
  },
  {
    slug: 'photovoltaique',
    branch: 'equipements',
    title: 'Système photovoltaïque',
    description:
      'Panneaux, onduleurs hybrides, régulateurs de charge, batteries et convertisseurs pour site isolé ou appoint réseau.',
  },
  {
    slug: 'generateurs',
    branch: 'equipements',
    title: 'Groupes électrogènes',
    description:
      'Groupes diesel et essence, insonorisés ou ouverts, et postes de soudage autonomes.',
  },
  {
    slug: 'didactiques',
    branch: 'equipements',
    title: 'Équipements didactiques',
    description:
      'Bancs pédagogiques en énergies renouvelables pour lycées techniques, centres de formation et universités.',
  },
  {
    slug: 'branchement',
    branch: 'equipements',
    title: 'Matériels de branchement',
    description:
      'Compteurs d\'eau, raccords et réducteurs de pression pour raccordement et sous-comptage.',
  },
  {
    slug: 'electriques',
    branch: 'equipements',
    title: 'Matériels électriques',
    description:
      'Coffrets, tableaux modulaires et appareillage de protection différentielle.',
  },
  {
    slug: 'manutention',
    branch: 'equipements',
    title: 'Équipements de manutention',
    description:
      'Chariots élévateurs et transpalettes manuels ou électriques, pour entrepôt et quai de chargement.',
  },
  {
    slug: 'location-reception',
    branch: 'events',
    title: 'Location de matériel de réception',
    description:
      'Mobilier, art de la table, nappage, décor, son et lumière — livrés et installés.',
  },
  {
    slug: 'organisation',
    branch: 'events',
    title: 'Organisation & coordination',
    description: 'Scénographie, plan de salle, prestataires et présence le jour J.',
  },
  {
    slug: 'etudes-prestations',
    branch: 'etudes',
    title: 'Études & prestations intellectuelles',
    description:
      'Études techniques, conseil en organisation, formation et assistance à maîtrise d\'ouvrage.',
  },
  {
    slug: 'agro-industrie',
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
      'Aménagement complet de plateaux : bureaux, fauteuils ergonomiques, armoires, caissons et banques d\'accueil. Nous chiffrons, livrons et montons sur site.',
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
      'Véhicules de service et utilitaires, engins, pièces détachées et pneumatiques. Nous accompagnons le renouvellement et l\'entretien des flottes d\'entreprise et d\'institution.',
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
      'Chandeliers, vases, drapés, arches, tapis d\'honneur et potelets. Nous construisons une direction visuelle cohérente, de l\'entrée des invités jusqu\'au fond de scène.',
    tags: ['Chandeliers', 'Drapés', 'Tapis d\'honneur'],
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
  { id: 'gal-01', title: 'Mariage Adjovi — 620 invités', location: 'Agôè', category: 'mariage', branch: 'events', domain: 'organisation', image: '/images/galerie-mariage-adjovi.jpg', imageAlt: 'Mariage — vue d\'ensemble de la salle' },
  { id: 'gal-02', title: 'Art de la table — ligne ivoire', location: null, category: 'decor', branch: 'events', domain: 'location-reception', image: '/images/galerie-verrerie.jpg', imageAlt: 'Détail — verrerie et chandeliers' },
  { id: 'gal-03', title: 'Séminaire annuel — 180 places', location: null, category: 'corporate', branch: 'events', domain: 'organisation', image: '/images/galerie-seminaire.jpg', imageAlt: 'Séminaire — salle en configuration conférence' },
  { id: 'gal-04', title: 'Cérémonie officielle', location: null, category: 'ceremonie', branch: 'events', domain: 'organisation', image: '/images/galerie-ceremonie-officielle.jpg', imageAlt: 'Cérémonie — tapis d\'honneur et potelets' },
  { id: 'gal-05', title: 'Vin d\'honneur — jardin', location: null, category: 'mariage', branch: 'events', domain: 'organisation', image: '/images/galerie-vin-honneur.jpg', imageAlt: 'Mariage — cocktail extérieur' },
  { id: 'gal-06', title: 'Dîner de gala — 400 couverts', location: 'Lomé', category: 'corporate', branch: 'events', domain: 'organisation', image: '/images/galerie-diner-gala.jpg', imageAlt: 'Gala — dîner d\'entreprise, plan large' },
  { id: 'gal-07', title: 'Centre de table — saison sèche', location: null, category: 'decor', branch: 'events', domain: 'location-reception', image: '/images/galerie-centre-de-table.jpg', imageAlt: 'Détail — nappage et centre de table' },
  { id: 'gal-08', title: 'Soirée blanche — Baguida', location: null, category: 'mariage', branch: 'events', domain: 'organisation', image: '/images/galerie-soiree-blanche.jpg', imageAlt: 'Soirée — piste de danse lumineuse' },
  { id: 'gal-09', title: 'Baptême — chapiteau 200 places', location: null, category: 'ceremonie', branch: 'events', domain: 'location-reception', image: '/images/galerie-bapteme.jpg', imageAlt: 'Baptême — réception familiale sous chapiteau' },
  { id: 'gal-10', title: 'Équipement informatique — 40 postes', location: null, category: 'fourniture', branch: 'equipements', domain: 'informatique', image: '/images/equipements-informatique.jpg', imageAlt: 'Livraison de matériel informatique' },
  { id: 'gal-11', title: 'Aménagement de bureaux — siège Lomé', location: 'Lomé', category: 'fourniture', branch: 'equipements', domain: 'mobilier-bureau', image: '/images/branche-etudes.jpg', imageAlt: 'Aménagement de bureaux livré' },
  { id: 'gal-12', title: 'Mariage Sika — 380 invités', location: null, category: 'mariage', branch: 'events', domain: 'organisation', image: '/images/ambiance-blanc-or.jpg', imageAlt: 'Mariage — tables dressées' },
  { id: 'gal-13', title: 'Cérémonie coutumière — 500 places', location: null, category: 'ceremonie', branch: 'events', domain: 'organisation', image: '/images/hero-reception.jpg', imageAlt: 'Cérémonie — salle dressée' },
  { id: 'gal-14', title: 'Gala annuel — 300 couverts', location: null, category: 'corporate', branch: 'events', domain: 'organisation', image: '/images/branche-events.jpg', imageAlt: 'Gala — dîner assis' },
  { id: 'gal-15', title: 'Dressage — ligne or', location: null, category: 'decor', branch: 'events', domain: 'location-reception', image: '/images/events-dressage-or.jpg', imageAlt: 'Détail — couvert dressé' },
  { id: 'gal-16', title: 'Bénédiction nuptiale — 250 places', location: null, category: 'mariage', branch: 'events', domain: 'location-reception', image: '/images/categorie-tentes.jpg', imageAlt: 'Mariage — cérémonie sous chapiteau' },
  { id: 'gal-17', title: 'Cocktail d\'honneur — Baguida', location: 'Baguida', category: 'ceremonie', branch: 'events', domain: 'organisation', image: '/images/ambiance-cocktail.jpg', imageAlt: 'Cocktail extérieur — mange-debout' },
  { id: 'gal-18', title: 'Soirée de lancement — piste LED', location: null, category: 'corporate', branch: 'events', domain: 'location-reception', image: '/images/ambiance-nuit-electrique.jpg', imageAlt: 'Soirée entreprise — éclairage' },
  { id: 'gal-19', title: 'Scénographie de scène — fond drapé', location: null, category: 'decor', branch: 'events', domain: 'organisation', image: '/images/events-scenographie.jpg', imageAlt: 'Décor — fond de scène' },
  { id: 'gal-20', title: 'Nappage — chemins de table', location: null, category: 'decor', branch: 'events', domain: 'location-reception', image: '/images/categorie-nappage.jpg', imageAlt: 'Nappage — chemins de table' },
  { id: 'gal-21', title: 'Laboratoire d\'analyses — équipement livré', location: null, category: 'fourniture', branch: 'equipements', domain: 'sante-laboratoire', image: '/images/equipements-laboratoire.jpg', imageAlt: 'Laboratoire équipé' },
  { id: 'gal-22', title: 'Flotte de service — 6 véhicules', location: null, category: 'fourniture', branch: 'equipements', domain: 'roulant', image: '/images/equipements-materiel-roulant.jpg', imageAlt: 'Matériel roulant livré' },
  { id: 'gal-23', title: 'Projet agricole — petits équipements', location: null, category: 'fourniture', branch: 'agro', domain: 'agro-industrie', image: '/images/branche-agro.jpg', imageAlt: 'Agrobusiness — équipements livrés' },
]

export const testimonials: Testimonial[] = [
  {
    quote:
      'Six cents invités, une salle transformée en une nuit. Le matin du mariage tout était en place, et personne n\'a vu l\'équipe travailler.',
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
      'J\'avais changé trois fois de plan de salle. Ils ont tout repris sans un soupir, et la piste de danse a fait l\'unanimité.',
    author: 'Sandrine A.',
    context: 'Anniversaire, Baguida',
  },
]

export const faqItems: FaqItem[] = [
  {
    id: 'faq-1',
    group: 'TBS Events',
    question: 'Combien de temps à l\'avance faut-il réserver ?',
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
      'Une caution est prévue au contrat. Les pièces cassées ou manquantes sont facturées au tarif de remplacement indiqué à l\'avance sur le devis, sans surprise après l\'événement.',
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
    question: 'Répondez-vous aux appels d\'offres ?',
    answer:
      'Oui, sur les quatre branches. TBS Distribution S.A.R.L participe aux consultations et appels d\'offres publics et privés : dossier administratif à jour, offre technique et financière, factures normalisées et références vérifiables.',
  },
  {
    id: 'faq-8',
    group: 'TBS Équipements, Études & Agro',
    question: 'Quels délais pour une commande de fournitures ?',
    answer:
      'Les articles en stock partent sous 48 heures. Pour un équipement à importer, comptez deux à six semaines selon la nature du matériel ; le délai est engagé sur l’offre et suivi jusqu’à la mise en service.',
  },
]

/**
 * Les références du catalogue TBS Équipements, par domaine.
 *
 * Le site annonçait ses domaines sans jamais dire ce qu'ils recouvrent :
 * « Matériel roulant » ne nommait aucun véhicule, « Outillage » aucun outil.
 * Un visiteur cherchant un groupe électrogène ne pouvait pas deviner que TBS
 * en fournit.
 *
 * Ni prix, ni stock, ni panier : ces entrées disent ce que TBS fournit et
 * renvoient au devis, qui reste le parcours de tout le site.
 *
 * Les descriptions sont rédigées pour TBS. La nomenclature — familles, noms
 * de références, caractéristiques techniques — vient du relevé de marché du
 * 9 septembre 2026 ; une caractéristique n'est portée que lorsqu'elle sert à
 * décider. Cf. l'issue #103.
 */
export const equipment: Equipment[] = [
  // ── mobilier-bureau ─────────────────────────────────────────────
  {
    domain: 'mobilier-bureau',
    name: 'Armoire bibliothèque en bois',
    description:
      'Rangement haut pour documents et ouvrages, à poser derrière un poste de direction.',
    specs: ['H 180 × L 90 × P 45 cm', 'Bois'],
  },
  {
    domain: 'mobilier-bureau',
    name: 'Armoire en bois à portes battantes',
    description:
      'Armoire fermée pour archives courantes, dans un bureau ou une salle de réunion.',
    specs: ['H 180 × L 80 × P 45 cm', 'Portes battantes'],
  },
  {
    domain: 'mobilier-bureau',
    name: 'Armoire à portes coulissantes transparentes',
    description:
      'Armoire haute à portes vitrées coulissantes : le contenu reste visible sans encombrer le passage.',
    specs: ['Portes coulissantes', 'Modèle haut'],
  },
  {
    domain: 'mobilier-bureau',
    name: 'Banque d\'accueil ATLAS',
    description:
      'Poste d\'accueil pour hall d\'entreprise ou d\'administration, avec plan de dépose visiteur.',
    specs: ['Poste d\'accueil'],
  },
  {
    domain: 'mobilier-bureau',
    name: 'Bureau droit, gamme panneaux',
    description:
      'Plan de travail droit sur piètement panneaux, pour aménagement de plateau en série.',
    specs: ['Plateau droit', 'Piètement panneaux'],
  },
  {
    domain: 'mobilier-bureau',
    name: 'Bureau individuel Solano avec retour et caisson',
    description:
      'Poste complet pour cadre : plan principal, retour latéral et caisson de rangement.',
    specs: ['Retour latéral', 'Caisson inclus'],
  },
  {
    domain: 'mobilier-bureau',
    name: 'Caisson de bureau à roulettes',
    description:
      'Caisson mobile à trois tiroirs, à glisser sous le plan de travail.',
    specs: ['3 tiroirs', 'Sur roulettes'],
  },
  {
    domain: 'mobilier-bureau',
    name: 'Canapé d\'angle convertible réversible',
    description:
      'Assise d\'attente convertible, l\'angle se monte à droite ou à gauche selon la pièce.',
    specs: ['4 places', 'Convertible', 'Angle réversible'],
  },
  {
    domain: 'mobilier-bureau',
    name: 'Canapé MAMAIA 3 places',
    description:
      'Canapé d\'accueil en velours pour espace d\'attente ou salon de direction.',
    specs: ['3 places', '177 × 92 × 78 cm', 'Velours'],
  },
  {
    domain: 'mobilier-bureau',
    name: 'Canapé d\'accueil de bureau',
    description:
      'Assise confortable pour zone d\'attente, en complément d\'une banque d\'accueil.',
    specs: ['Espace d\'attente'],
  },
  {
    domain: 'mobilier-bureau',
    name: 'Fauteuil de direction en cuir',
    description:
      'Siège de direction à dossier haut, garnissage cuir.',
    specs: ['Dossier haut', 'Cuir'],
  },
  {
    domain: 'mobilier-bureau',
    name: 'Fauteuil visiteur Dallas',
    description:
      'Siège visiteur à dossier filet et piètement luge, empilable le long d\'un mur.',
    specs: ['Dossier filet', 'Piètement luge'],
  },
  {
    domain: 'mobilier-bureau',
    name: 'Fauteuils de salle de conférence',
    description:
      'Sièges de salle pour amphithéâtre, salle de formation ou de projection.',
    specs: ['Salle équipée'],
  },
  {
    domain: 'mobilier-bureau',
    name: 'Salon complet 5 pièces',
    description:
      'Ensemble de salon pour bureau de direction ou salle d\'attente.',
    specs: ['5 pièces', 'Noir / noyer'],
  },
  {
    domain: 'mobilier-bureau',
    name: 'Salon complet 6 pièces',
    description:
      'Ensemble de salon plus large, pour hall ou espace de réception.',
    specs: ['6 pièces', 'Pin blanc / chêne brun'],
  },
  {
    domain: 'mobilier-bureau',
    name: 'Salon de jardin en résine tressée',
    description:
      'Ensemble d\'extérieur pour terrasse d\'entreprise ou espace de pause.',
    specs: ['Résine tressée', 'Blanc', 'Extérieur'],
  },
  {
    domain: 'mobilier-bureau',
    name: 'Siège visiteur en cuir',
    description:
      'Siège d\'appoint en cuir, à poser face à un bureau de direction.',
    specs: ['Cuir'],
  },
  {
    domain: 'mobilier-bureau',
    name: 'Table de conférence 12 personnes',
    description:
      'Table de réunion pour comité de direction ou salle de conseil.',
    specs: ['12 personnes'],
  },
  {
    domain: 'mobilier-bureau',
    name: 'Table de réunion en bois massif',
    description:
      'Table de réunion en bois massif, pour salle de commission.',
    specs: ['Bois massif'],
  },
  // ── informatique ────────────────────────────────────────────────
  {
    domain: 'informatique',
    name: 'Écran interactif tactile SpeechiTouch 65 pouces',
    description:
      'Écran tactile pour salle de formation ou de réunion, sans ordinateur dédié.',
    specs: ['65 pouces', '4K UHD', 'Android 8'],
  },
  {
    domain: 'informatique',
    name: 'HP LaserJet Pro MFP M479fdw',
    description:
      'Multifonction laser couleur pour service ou petit plateau : impression, copie, scan, fax.',
    specs: ['Laser couleur', 'Recto-verso', 'Wi-Fi'],
  },
  {
    domain: 'informatique',
    name: 'HP ProBook 450 G8',
    description:
      'Portable professionnel pour poste bureautique mobile.',
    specs: ['Core i7-1165G7', '8 Go', '512 Go SSD'],
  },
  {
    domain: 'informatique',
    name: 'HP Spectre x360',
    description:
      'Portable convertible haut de gamme, pour direction et déplacement.',
    specs: ['Core i7-1065G7', '16 Go', '1 To SSD', 'Convertible'],
  },
  // ── sante-laboratoire ───────────────────────────────────────────
  {
    domain: 'sante-laboratoire',
    name: 'Analyseur d\'électrolytes EA-2000B',
    description:
      'Dosage des électrolytes sanguins en laboratoire d\'analyses médicales.',
    specs: ['Électrolytes'],
  },
  {
    domain: 'sante-laboratoire',
    name: 'Analyseur de coagulation automatique',
    description:
      'Automate d\'hémostase pour laboratoire hospitalier ou de ville.',
    specs: ['Automatique', 'Hémostase'],
  },
  {
    domain: 'sante-laboratoire',
    name: 'Analyseur immunochromatographique',
    description:
      'Lecture de tests rapides immunochromatographiques.',
    specs: ['Tests rapides'],
  },
  {
    domain: 'sante-laboratoire',
    name: 'Bavettes de protection haute filtration',
    description:
      'Masques de protection respiratoire pour personnel soignant et laboratoire.',
    specs: ['Haute filtration'],
  },
  {
    domain: 'sante-laboratoire',
    name: 'Colposcope vidéo EDAN C3(A)/C6(A)',
    description:
      'Colposcope vidéo pour consultation gynécologique.',
    specs: ['Vidéo', 'EDAN'],
  },
  {
    domain: 'sante-laboratoire',
    name: 'Concentrateur d\'oxygène Diamedica Bébé CPAP',
    description:
      'Assistance respiratoire néonatale en pression positive continue.',
    specs: ['Néonatal', 'CPAP'],
  },
  {
    domain: 'sante-laboratoire',
    name: 'Conductimètre HANNA HI 9835',
    description:
      'Mesure de conductivité, TDS et salinité, au laboratoire ou sur le terrain.',
    specs: ['Conductivité', 'TDS', 'Salinité'],
  },
  {
    domain: 'sante-laboratoire',
    name: 'ECG Colson Cardi 6 multipistes',
    description:
      'Électrocardiographe tactile multipistes pour cabinet et service hospitalier.',
    specs: ['Multipistes', 'Écran tactile'],
  },
  {
    domain: 'sante-laboratoire',
    name: 'Lampe de photothérapie nouveau-né',
    description:
      'Traitement de l\'ictère du nouveau-né en maternité.',
    specs: ['Néonatal', 'Photothérapie'],
  },
  {
    domain: 'sante-laboratoire',
    name: 'Laveur de microplaques automatique 670',
    description:
      'Lavage automatisé des microplaques pour technique ELISA.',
    specs: ['Microplaques', 'ELISA'],
  },
  {
    domain: 'sante-laboratoire',
    name: 'Microscope biologique numérique Celestron',
    description:
      'Microscope à sortie numérique pour laboratoire et enseignement.',
    specs: ['Numérique', 'Biologique'],
  },
  {
    domain: 'sante-laboratoire',
    name: 'Moniteur patient M-9000-E',
    description:
      'Surveillance des paramètres vitaux au bloc, en réanimation ou en salle de réveil.',
    specs: ['12,1 pouces', 'Multiparamétrique'],
  },
  {
    domain: 'sante-laboratoire',
    name: 'Papier pour ECG Colson / Cardiette',
    description:
      'Consommable thermique pour électrocardiographe.',
    specs: ['Consommable', 'Thermique'],
  },
  {
    domain: 'sante-laboratoire',
    name: 'pH-mètre multiparamètre',
    description:
      'Contrôle du pH et des paramètres associés, en laboratoire ou en traitement de l\'eau.',
    specs: ['Multiparamètre'],
  },
  {
    domain: 'sante-laboratoire',
    name: 'Spectromètre d\'absorption atomique 280Z AA',
    description:
      'Dosage des métaux à l\'état de traces, en analyse environnementale ou agroalimentaire.',
    specs: ['Absorption atomique', 'Four graphite'],
  },
  {
    domain: 'sante-laboratoire',
    name: 'Tensiomètre Heine Gamma GP',
    description:
      'Tensiomètre manuel de qualité clinique, pour cabinet et service.',
    specs: ['Manuel', 'Clinique'],
  },
  {
    domain: 'sante-laboratoire',
    name: 'Thermoflash Pro LX-261E',
    description:
      'Thermomètre frontal sans contact, pour accueil et service de soins.',
    specs: ['Sans contact', 'Infrarouge'],
  },
  // ── roulant ─────────────────────────────────────────────────────
  {
    domain: 'roulant',
    name: 'Toyota Fortuner turbo',
    description:
      'Tout-terrain sept places pour mission de terrain et transport d\'équipe.',
    specs: ['7 places', 'Turbo', '4×4'],
  },
  {
    domain: 'roulant',
    name: 'Toyota Hilux 4×4 double cabine',
    description:
      'Pick-up double cabine, l\'utilitaire de référence pour chantier et projet en région.',
    specs: ['Double cabine', '4×4', 'Pick-up'],
  },
  {
    domain: 'roulant',
    name: 'Toyota Land Cruiser Prado',
    description:
      'Tout-terrain robuste pour missions longues et pistes difficiles.',
    specs: ['4×4'],
  },
  {
    domain: 'roulant',
    name: 'Toyota Rush',
    description:
      'Petit tout-chemin urbain, pour déplacement de service.',
    specs: ['Compact'],
  },
  {
    domain: 'roulant',
    name: 'Boîte de filtre à carburant Toyota Hilux',
    description:
      'Boîtier complet avec filtre, pour entretien programmé du Hilux.',
    specs: ['Toyota Hilux', 'Filtre inclus'],
  },
  {
    domain: 'roulant',
    name: 'Filtre à carburant Toyota Hilux',
    description:
      'Filtre de rechange pour entretien de flotte.',
    specs: ['Toyota Hilux'],
  },
  {
    domain: 'roulant',
    name: 'Jante aluminium 4×4',
    description:
      'Jante aluminium pour véhicule tout-terrain.',
    specs: ['Aluminium', '4×4'],
  },
  {
    domain: 'roulant',
    name: 'Pneus Toyota Hilux Pick-up',
    description:
      'Pneumatiques de remplacement pour pick-up.',
    specs: ['Toyota Hilux'],
  },
  // ── outillage ───────────────────────────────────────────────────
  {
    domain: 'outillage',
    name: 'Mallette à outils 198 pièces',
    description:
      'Coffret de réparation complet pour atelier ou intervention sur site.',
    specs: ['198 pièces'],
  },
  {
    domain: 'outillage',
    name: 'Étagère murale 44 boîtes',
    description:
      'Système de rangement mural à bacs, pour visserie et petites pièces d\'atelier.',
    specs: ['44 boîtes', '115 × 78 cm'],
  },
  {
    domain: 'outillage',
    name: 'Coffret à outils vide 5 compartiments',
    description:
      'Caisse à outils vide à compartiments, à composer selon le métier.',
    specs: ['5 compartiments', 'Vide'],
  },
  {
    domain: 'outillage',
    name: 'Corde de service',
    description:
      'Corde de travail pour manœuvre et levage léger.',
    specs: ['Travail en hauteur'],
  },
  {
    domain: 'outillage',
    name: 'Coupe-câble à crémaillère Ø 52 mm',
    description:
      'Coupe-câble isolé pour intervention sous tension, jusqu\'à 52 mm de diamètre.',
    specs: ['Ø 52 mm', 'Isolé 1000 V', 'Crémaillère'],
  },
  {
    domain: 'outillage',
    name: 'Échelle coulissante 2 plans',
    description:
      'Échelle à deux plans à mécanisme à corde, pour intervention en hauteur.',
    specs: ['2 plans', 'Mécanisme à corde'],
  },
  {
    domain: 'outillage',
    name: 'Élagueuse thermique Scheppach CSP2540',
    description:
      'Élagueuse thermique pour entretien d\'espaces verts et dégagement de lignes.',
    specs: ['25 cm', '25 cm³', 'Thermique'],
  },
  {
    domain: 'outillage',
    name: 'Grimpettes pour poteaux',
    description:
      'Grimpettes de monteur pour poteaux ronds ou hexagonaux.',
    specs: ['Poteaux ronds ou hexagonaux'],
  },
  {
    domain: 'outillage',
    name: 'Indicateur d\'ordre de phases',
    description:
      'Vérification du sens de rotation des phases avant mise en service.',
    specs: ['Triphasé'],
  },
  {
    domain: 'outillage',
    name: 'Pince multimètre TRMS 700 A',
    description:
      'Mesure de courant en valeur efficace vraie, jusqu\'à 700 ampères.',
    specs: ['700 A', 'TRMS'],
  },
  {
    domain: 'outillage',
    name: 'Poste de soudure',
    description:
      'Poste de soudure d\'atelier pour réparation et fabrication.',
    specs: ['Atelier'],
  },
  {
    domain: 'outillage',
    name: 'Scies à métaux',
    description:
      'Scies à main pour découpe de profilés et tubes.',
    specs: ['Métaux'],
  },
  {
    domain: 'outillage',
    name: 'Tronçonneuse à métaux Constructor',
    description:
      'Tronçonneuse d\'établi pour découpe de barres et profilés.',
    specs: ['2300 W', 'Métaux'],
  },
  {
    domain: 'outillage',
    name: 'Tronçonneuse sans fil 6 pouces',
    description:
      'Tronçonneuse de jardin sur batterie, livrée avec deux batteries et deux chaînes.',
    specs: ['6 pouces', '2 batteries', '2 chaînes'],
  },
  {
    domain: 'outillage',
    name: 'Valise de maintenance Expert PRIMO',
    description:
      'Valise de maintenance complète, pour technicien itinérant.',
    specs: ['145 outils'],
  },
  // ── controle-acces ──────────────────────────────────────────────
  {
    domain: 'controle-acces',
    name: 'Barrière de contrôle d\'accès MAXIMA ULTRA 68',
    description:
      'Barrière levante pour entrée de site, parking d\'entreprise ou d\'administration.',
    specs: ['Barrière levante'],
  },
  {
    domain: 'controle-acces',
    name: 'Barrière de contrôle d\'accès TERRA 180',
    description:
      'Barrière levante pour passage large et trafic soutenu.',
    specs: ['Barrière levante', 'Passage large'],
  },
  {
    domain: 'controle-acces',
    name: 'Cartes badges PVC à piste magnétique',
    description:
      'Badges d\'accès personnalisables, consommable du système de contrôle.',
    specs: ['PVC', 'Piste magnétique'],
  },
  {
    domain: 'controle-acces',
    name: 'Centrale de contrôle d\'accès inBIO 160/260/460',
    description:
      'Centrale de gestion des accès, de une à quatre portes selon le modèle.',
    specs: ['1 à 4 portes', 'Biométrie'],
  },
  {
    domain: 'controle-acces',
    name: 'Gâche électrique à sécurité intégrée',
    description:
      'Gâche à sécurité positive : la porte se libère en cas de coupure d\'alimentation.',
    specs: ['Sécurité intégrée'],
  },
  {
    domain: 'controle-acces',
    name: 'Pointeuse biométrique ZKTeco K40',
    description:
      'Pointeuse à empreinte digitale pour gestion des temps de présence.',
    specs: ['Empreinte digitale', 'Temps de présence'],
  },
  {
    domain: 'controle-acces',
    name: 'Pointeuse TimeMoto TM-828 SC',
    description:
      'Terminal de pointage pour effectif moyen, avec logiciel de suivi.',
    specs: ['Temps de présence'],
  },
  {
    domain: 'controle-acces',
    name: 'Caméra dôme 4 MP intérieure',
    description:
      'Caméra de surveillance intérieure, discrète et résistante au vandalisme.',
    specs: ['4 MP', 'Intérieur', 'Dôme'],
  },
  {
    domain: 'controle-acces',
    name: 'Caméra tube 4 MP extérieure',
    description:
      'Caméra de surveillance extérieure Full HD+, pour périmètre et parking.',
    specs: ['4 MP', 'Full HD+', 'Extérieur'],
  },
  // ── chimie-reactifs ─────────────────────────────────────────────
  {
    domain: 'chimie-reactifs',
    name: '2-Propanol',
    description:
      'Solvant de laboratoire et de nettoyage technique.',
    specs: ['Solvant'],
  },
  {
    domain: 'chimie-reactifs',
    name: 'Acétate d\'éthyle',
    description:
      'Solvant d\'extraction et de chromatographie.',
    specs: ['99,8 %+'],
  },
  {
    domain: 'chimie-reactifs',
    name: 'Acide propionique',
    description:
      'Acide organique pur, usage laboratoire et conservation.',
    specs: ['99,5 %+', 'Pur'],
  },
  {
    domain: 'chimie-reactifs',
    name: 'Acide succinique',
    description:
      'Acide organique de qualité alimentaire.',
    specs: ['99,5 %+', 'Qualité alimentaire'],
  },
  {
    domain: 'chimie-reactifs',
    name: 'Acide sulfurique 98 %',
    description:
      'Acide minéral concentré pour laboratoire et traitement industriel.',
    specs: ['98 %'],
  },
  {
    domain: 'chimie-reactifs',
    name: 'Carbonate de baryum (BaCO₃)',
    description:
      'Sel de haute pureté pour analyse et usage technique.',
    specs: ['Haute pureté'],
  },
  {
    domain: 'chimie-reactifs',
    name: 'Carbonate de potassium',
    description:
      'Sel de qualité alimentaire FCC, en poudre.',
    specs: ['99,9 %+', 'Qualité alimentaire FCC', 'Poudre'],
  },
  {
    domain: 'chimie-reactifs',
    name: 'Charbon actif granulé',
    description:
      'Média filtrant pour traitement de l\'eau et déchloration.',
    specs: ['Granulé', 'Traitement de l\'eau'],
  },
  {
    domain: 'chimie-reactifs',
    name: 'Chlorhydrate de 1,10-phénanthroline',
    description:
      'Réactif de dosage du fer par colorimétrie.',
    specs: ['Monohydraté', 'Réactif'],
  },
  {
    domain: 'chimie-reactifs',
    name: 'Sulfate de magnésium heptahydraté',
    description:
      'Sel de qualité alimentaire, usage laboratoire et industriel.',
    specs: ['99 %+', 'Qualité alimentaire'],
  },
  // ── photovoltaique ──────────────────────────────────────────────
  {
    domain: 'photovoltaique',
    name: 'Batterie plomb 12 V / 18 Ah',
    description:
      'Batterie de stockage pour petite installation autonome ou onduleur.',
    specs: ['12 V / 18 Ah', '216 Wh', 'Cosses M5'],
  },
  {
    domain: 'photovoltaique',
    name: 'Chargeur solaire 12 V / 10 W',
    description:
      'Maintien de charge d\'une batterie de véhicule à l\'arrêt prolongé.',
    specs: ['12 V', '10 W'],
  },
  {
    domain: 'photovoltaique',
    name: 'Convertisseur 12 V vers 230 V',
    description:
      'Alimentation d\'appareils secteur depuis une batterie, avec prise USB.',
    specs: ['300 W', 'USB 2,1 A'],
  },
  {
    domain: 'photovoltaique',
    name: 'Onduleur solaire hybride 3500 W',
    description:
      'Onduleur hybride à régulateur MPPT, pilotable à distance par module Wi-Fi.',
    specs: ['3500 W', 'MPPT 12/24 V', 'Wi-Fi'],
  },
  {
    domain: 'photovoltaique',
    name: 'Panneau solaire souple monocristallin',
    description:
      'Panneau souple à coller sur surface courbe, pour véhicule ou installation légère.',
    specs: ['100 W', 'Monocristallin', 'ETFE/EVA'],
  },
  {
    domain: 'photovoltaique',
    name: 'Panneau solaire mobile 260 W',
    description:
      'Panneau transportable pour alimentation de chantier ou de mission.',
    specs: ['260 W', 'Mobile'],
  },
  {
    domain: 'photovoltaique',
    name: 'Régulateur de charge solaire',
    description:
      'Protection de la batterie contre la surcharge et la décharge profonde.',
    specs: ['Régulation de charge'],
  },
  {
    domain: 'photovoltaique',
    name: 'Régulateur de tension hybride solaire / éolien',
    description:
      'Régulation d\'une installation combinant panneaux et éolienne.',
    specs: ['Hybride solaire / éolien'],
  },
  // ── generateurs ─────────────────────────────────────────────────
  {
    domain: 'generateurs',
    name: 'Groupe de soudage 180 A',
    description:
      'Groupe autonome de soudage à moteur thermique, pour chantier sans réseau.',
    specs: ['180 A', 'Moteur Honda', '4,5 kVA'],
  },
  {
    domain: 'generateurs',
    name: 'Groupe électrogène Ayerbe insonorisé',
    description:
      'Groupe insonorisé pour site sensible au bruit : bureau, clinique, hôtel.',
    specs: ['40 kVA', 'Insonorisé', 'AY-1500-40-TX-LOMB'],
  },
  {
    domain: 'generateurs',
    name: 'Groupe électrogène diesel GENELEC',
    description:
      'Groupe diesel de secours pour bâtiment ou installation technique.',
    specs: ['Diesel'],
  },
  {
    domain: 'generateurs',
    name: 'Groupe électrogène diesel KOHLER SDMO',
    description:
      'Groupe diesel de secours, gamme professionnelle.',
    specs: ['Diesel', 'KOHLER SDMO'],
  },
  // ── didactiques ─────────────────────────────────────────────────
  {
    domain: 'didactiques',
    name: 'Centrale solaire didactique',
    description:
      'Banc pédagogique couvrant les deux cas : restitution réseau et site isolé.',
    specs: ['Restitution réseau', 'Site isolé'],
  },
  {
    domain: 'didactiques',
    name: 'Simulateur d\'éolienne',
    description:
      'Banc pédagogique de production éolienne avec restitution réseau.',
    specs: ['Restitution réseau'],
  },
  {
    domain: 'didactiques',
    name: 'Station de pompage solaire',
    description:
      'Banc pédagogique de pompage alimenté par panneaux.',
    specs: ['Pompage solaire'],
  },
  {
    domain: 'didactiques',
    name: 'Tracker solaire avec batterie',
    description:
      'Banc de suivi de course du soleil, avec stockage.',
    specs: ['Suivi solaire', 'Batterie'],
  },
  // ── branchement ─────────────────────────────────────────────────
  {
    domain: 'branchement',
    name: 'Compteur divisionnaire universel DN15',
    description:
      'Sous-comptage d\'eau froide par local ou par usage.',
    specs: ['DN15', 'Eau froide'],
  },
  {
    domain: 'branchement',
    name: 'Compteur volumétrique DN15',
    description:
      'Comptage volumétrique d\'eau froide, précis à faible débit.',
    specs: ['DN15', 'Eau froide', 'Volumétrique'],
  },
  {
    domain: 'branchement',
    name: 'Raccord compteur d\'eau 25-33/42',
    description:
      'Raccord de pose pour compteur d\'eau.',
    specs: ['25-33/42'],
  },
  {
    domain: 'branchement',
    name: 'Réducteur de pression FF 3/4',
    description:
      'Stabilisation de la pression d\'entrée d\'un réseau intérieur.',
    specs: ['FF 3/4'],
  },
  // ── electriques ─────────────────────────────────────────────────
  {
    domain: 'electriques',
    name: 'Coffret 13 modules, 2 rangées',
    description:
      'Tableau modulaire pour local technique ou petit bâtiment.',
    specs: ['13 modules', '2 rangées', 'Schneider Resi9'],
  },
  {
    domain: 'electriques',
    name: 'Disjoncteur différentiel 1P+N',
    description:
      'Protection différentielle d\'un départ terminal.',
    specs: ['1P+N', 'C 10 A', 'Pouvoir de coupure 4500 A'],
  },
  // ── manutention ─────────────────────────────────────────────────
  {
    domain: 'manutention',
    name: 'Chariot élévateur VMAX',
    description:
      'Chariot élévateur pour entrepôt et quai de chargement.',
    specs: ['Élévateur'],
  },
  {
    domain: 'manutention',
    name: 'Transpalette électrique',
    description:
      'Transpalette à assistance électrique, pour rotations soutenues.',
    specs: ['Électrique'],
  },
  {
    domain: 'manutention',
    name: 'Transpalette manuel 2,5 t',
    description:
      'Transpalette manuel pour déplacement de palettes.',
    specs: ['2,5 tonnes', 'Manuel'],
  },
]
