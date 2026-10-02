/**
 * Calcul du matériel d'une réception.
 *
 * Les ratios viennent des règles de dressage courantes au Togo — dix couverts
 * par table ronde, deux assiettes et demie par convive pour un dîner servi —
 * et non d'un catalogue théorique. Ils sont écrits ici plutôt que dans le
 * composant pour deux raisons : ils s'éprouvent seuls, et TBS doit pouvoir les
 * corriger sans toucher à l'interface.
 *
 * Ce que le calcul produit reste une **estimation de départ**. Le plan de
 * salle réel dépend du lieu, du service et du déroulé ; c'est le rôle du devis
 * de le trancher, et l'interface le dit.
 */

/** Format de réception, qui change tout le reste du calcul. */
export type FormatReception = 'assis' | 'cocktail' | 'mixte'

export interface OptionsCalcul {
  invites: number
  format: FormatReception
  /** Une réception qui dure au-delà du dîner consomme plus de verrerie. */
  soiree: boolean
}

export interface LigneMateriel {
  /** Identifiant stable, pour les tests et le pré-remplissage du devis. */
  cle: string
  libelle: string
  quantite: number
  unite: string
  /** Ce qui justifie le nombre, affiché sous la ligne. */
  regle: string
}

/** Marge de sécurité sur les pièces qui cassent ou se salissent. */
const MARGE_CASSE = 1.1

/** Couverts par table ronde — la table de dix est le standard local. */
export const COUVERTS_PAR_TABLE = 10

function arrondi(valeur: number): number {
  return Math.ceil(valeur)
}

/**
 * Sièges nécessaires.
 *
 * On prévoit 5 % de plus que d'invités : il y a toujours des accompagnants
 * non annoncés, et une chaise vide coûte moins cher qu'un invité debout.
 */
function sieges(invites: number, format: FormatReception): number {
  if (format === 'cocktail') return arrondi(invites * 0.35)
  if (format === 'mixte') return arrondi(invites * 0.75)
  return arrondi(invites * 1.05)
}

export function calculerMateriel({ invites, format, soiree }: OptionsCalcul): LigneMateriel[] {
  if (!Number.isFinite(invites) || invites <= 0) return []

  const assis = format !== 'cocktail'
  const nbSieges = sieges(invites, format)
  const tablesRondes = assis ? arrondi(invites / COUVERTS_PAR_TABLE) : 0
  const mangeDebout = format === 'assis' ? 0 : arrondi(invites / 12)

  const lignes: LigneMateriel[] = [
    {
      cle: 'chaises',
      libelle: 'Chaises',
      quantite: nbSieges,
      unite: 'pièces',
      regle: format === 'cocktail'
        ? 'Un tiers des invités assis : en cocktail, on ne s’assoit pas tous en même temps'
        : format === 'mixte'
          ? 'Trois quarts des invités assis, le reste debout ou en lounge'
          : 'Un siège par invité, plus 5 % — il y a toujours des accompagnants non annoncés',
    },
  ]

  if (tablesRondes) {
    lignes.push({
      cle: 'tables-rondes',
      libelle: `Tables rondes de ${COUVERTS_PAR_TABLE}`,
      quantite: tablesRondes,
      unite: 'tables',
      regle: `${COUVERTS_PAR_TABLE} couverts par table, le standard local`,
    })
  }

  if (mangeDebout) {
    lignes.push({
      cle: 'mange-debout',
      libelle: 'Mange-debout',
      quantite: mangeDebout,
      unite: 'tables',
      regle: 'Un mange-debout pour douze personnes en circulation',
    })
  }

  lignes.push({
    cle: 'nappes',
    libelle: 'Nappes',
    quantite: tablesRondes + mangeDebout + arrondi(invites / 60),
    unite: 'pièces',
    regle: 'Une par table, plus les buffets et la table d’honneur',
  })

  if (assis) {
    lignes.push({
      cle: 'assiettes',
      libelle: 'Assiettes',
      quantite: arrondi(invites * 2.5 * MARGE_CASSE),
      unite: 'pièces',
      regle: 'Deux services et demi par convive — entrée, plat, dessert partagé — plus 10 % de casse',
    })
    lignes.push({
      cle: 'couverts',
      libelle: 'Couverts',
      quantite: arrondi(invites * 3 * MARGE_CASSE),
      unite: 'pièces',
      regle: 'Trois pièces par convive, plus 10 % de casse',
    })
  }

  lignes.push({
    cle: 'verres',
    libelle: 'Verres',
    quantite: arrondi(invites * (soiree ? 3.5 : 2.5) * MARGE_CASSE),
    unite: 'pièces',
    regle: soiree
      ? 'Trois verres et demi par invité pour une soirée qui se prolonge, plus 10 % de casse'
      : 'Deux verres et demi par invité, plus 10 % de casse',
  })

  lignes.push({
    cle: 'serviettes',
    libelle: 'Serviettes',
    quantite: arrondi(invites * 1.2),
    unite: 'pièces',
    regle: 'Une par invité, plus 20 % pour le service',
  })

  /** Une tente de 100 m² abrite environ 80 personnes assises. */
  lignes.push({
    cle: 'tente',
    libelle: 'Surface de tente',
    quantite: arrondi(invites * (assis ? 1.3 : 0.9)),
    unite: 'm² si extérieur',
    regle: assis
      ? '1,3 m² par invité assis, circulation et service compris'
      : '0,9 m² par invité debout',
  })

  if (invites >= 150) {
    lignes.push({
      cle: 'sonorisation',
      libelle: 'Sonorisation',
      quantite: invites >= 500 ? 2 : 1,
      unite: 'ensemble(s)',
      regle: 'Au-delà de 500 invités, deux points de diffusion valent mieux qu’un système poussé',
    })
  }

  return lignes
}

/* ── Ajustements du visiteur ───────────────────────────────────────────────
 *
 * Le barème donne un point de départ, pas un verdict. Le lieu impose parfois
 * des tables de huit, la famille apporte sa vaisselle, un client sait qu'il
 * lui faut deux groupes électrogènes et pas un. Jusqu'ici la liste était à
 * prendre ou à laisser : on la recopiait à la main dans le message, et le
 * calculateur perdait l'essentiel de son intérêt.
 *
 * Les quantités sont donc modifiables, les lignes retirables, et le visiteur
 * peut ajouter ce que le barème ne connaît pas. Ce que le barème a calculé
 * n'est jamais perdu pour autant : chaque ligne modifiée garde sa valeur
 * d'origine et peut y revenir d'un clic.
 */

/** Plafond de saisie. Au-delà, ce n'est plus une réception, c'est un marché. */
export const QUANTITE_MAX = 99_999

/** Ce que le visiteur a changé sur la liste calculée. */
export interface Ajustements {
  /** Quantité retenue, par clé — elle remplace celle du barème. */
  quantites: Record<string, number>
  /** Lignes du barème que le visiteur a retirées. */
  retirees: string[]
}

/** Article ajouté par le visiteur, que le barème ne connaît pas. */
export interface LigneLibre {
  cle: string
  libelle: string
  quantite: number
  unite: string
}

/** Une ligne telle qu'elle s'affiche, barème et ajustements réconciliés. */
export interface LigneInventaire extends LigneMateriel {
  /** La quantité ne vient plus du barème. */
  ajustee: boolean
  /** Ce que le barème avait calculé — ce à quoi « Rétablir » revient. */
  quantiteCalculee: number
  /** Article ajouté par le visiteur. */
  libre: boolean
}

export const AJUSTEMENTS_VIDES: Ajustements = { quantites: {}, retirees: [] }

/**
 * Ramène une saisie à un entier utilisable.
 *
 * La saisie vient d'un `<input type="number">` : elle peut être vide, un
 * texte, un nombre à virgule ou négatif. On ne refuse pas — on borne, et le
 * champ montre aussitôt ce qui a été retenu.
 */
export function normaliserQuantite(valeur: unknown): number {
  const nombre = Math.floor(Number(valeur))
  if (!Number.isFinite(nombre) || nombre < 0) return 0
  return Math.min(nombre, QUANTITE_MAX)
}

/** `true` si le visiteur a touché à quoi que ce soit. */
export function aDesAjustements(ajustements: Ajustements, libres: LigneLibre[]): boolean {
  return (
    Object.keys(ajustements.quantites).length > 0
    || ajustements.retirees.length > 0
    || libres.length > 0
  )
}

/** Réconcilie le barème, les ajustements et les articles ajoutés. */
export function appliquerAjustements(
  base: LigneMateriel[],
  ajustements: Ajustements,
  libres: LigneLibre[] = [],
): LigneInventaire[] {
  const retirees = new Set(ajustements.retirees)

  const calculees = base
    .filter(ligne => !retirees.has(ligne.cle))
    .map((ligne): LigneInventaire => {
      const ajustee = Object.hasOwn(ajustements.quantites, ligne.cle)
      return {
        ...ligne,
        quantite: ajustee ? normaliserQuantite(ajustements.quantites[ligne.cle]) : ligne.quantite,
        quantiteCalculee: ligne.quantite,
        ajustee,
        libre: false,
      }
    })

  const ajoutees = libres.map((ligne): LigneInventaire => ({
    cle: ligne.cle,
    libelle: ligne.libelle,
    quantite: normaliserQuantite(ligne.quantite),
    unite: ligne.unite,
    regle: 'Ajouté par vos soins',
    quantiteCalculee: normaliserQuantite(ligne.quantite),
    ajustee: false,
    libre: true,
  }))

  return [...calculees, ...ajoutees]
}

/**
 * Message pré-rempli pour le formulaire de devis.
 *
 * Le calcul ne sert à rien s'il faut le recopier à la main. Le texte reprend
 * les quantités telles quelles, dans une forme qu'un conseiller peut chiffrer
 * sans rien redemander.
 *
 * **Ce que le visiteur a modifié est signalé ligne par ligne.** Sans cela, le
 * conseiller recevrait des nombres en croyant qu'ils sortent du barème : il
 * corrigerait un choix délibéré, ou raterait une contrainte que le client
 * avait pris la peine d'exprimer. La valeur calculée est rappelée entre
 * parenthèses, pour qu'il voie l'écart sans avoir à refaire le calcul.
 */
export function messageDevis(options: OptionsCalcul, lignes: LigneMateriel[]): string {
  const formats: Record<FormatReception, string> = {
    assis: 'dîner assis',
    cocktail: 'cocktail debout',
    mixte: 'format mixte (assis et debout)',
  }

  const inventaire = lignes
    .map((ligne) => {
      const base = `- ${ligne.libelle} : ${ligne.quantite} ${ligne.unite}`
      const detail = ligne as Partial<LigneInventaire>

      if (detail.libre) return `${base} (ajouté par le client)`
      if (detail.ajustee) return `${base} (ajusté par le client ; calcul : ${detail.quantiteCalculee})`
      return base
    })
    .join('\n')

  const retouche = lignes.some((ligne) => {
    const detail = ligne as Partial<LigneInventaire>
    return detail.libre || detail.ajustee
  })

  return [
    `Estimation faite depuis le calculateur du site.`,
    ``,
    `${options.invites} invités, ${formats[options.format]}${options.soiree ? ', avec soirée' : ''}.`,
    ``,
    inventaire,
    ...(retouche
      ? [``, `J'ai ajusté certaines quantités : ce sont celles-là qui comptent.`]
      : []),
    ``,
    `Merci de me confirmer les quantités et le prix.`,
  ].join('\n')
}
