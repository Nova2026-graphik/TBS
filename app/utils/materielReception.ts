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
 *
 * **Le barème ne porte aucun texte.** Il rend des clés de traduction et leurs
 * paramètres ; la langue est résolue au rendu par `resoudreLignes`. La
 * rubrique Conseils existe dans les deux langues, et un libellé écrit en dur
 * ici serait resté français dans l'article anglais qui embarque ce
 * calculateur.
 */

/** Format de réception, qui change tout le reste du calcul. */
export type FormatReception = 'assis' | 'cocktail' | 'mixte'

/** Traducteur injecté — `t` de vue-i18n, ou un substitut dans les tests. */
export type Traduire = (cle: string, params?: Record<string, unknown>) => string

export interface OptionsCalcul {
  invites: number
  format: FormatReception
  /** Une réception qui dure au-delà du dîner consomme plus de verrerie. */
  soiree: boolean
}

/** Une ligne telle que le barème la produit : des clés, pas des phrases. */
export interface LigneBareme {
  /** Identifiant stable, pour les tests et le pré-remplissage du devis. */
  cle: string
  quantite: number
  libelleCle: string
  libelleParams?: Record<string, number>
  /** Ce qui justifie le nombre, affiché sous la ligne. */
  regleCle: string
  regleParams?: Record<string, number>
  uniteCle: string
}

/** La même ligne, une fois les clés résolues dans la langue de la page. */
export interface LigneMateriel {
  cle: string
  libelle: string
  quantite: number
  unite: string
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

export function calculerMateriel({ invites, format, soiree }: OptionsCalcul): LigneBareme[] {
  if (!Number.isFinite(invites) || invites <= 0) return []

  const assis = format !== 'cocktail'
  const nbSieges = sieges(invites, format)
  const tablesRondes = assis ? arrondi(invites / COUVERTS_PAR_TABLE) : 0
  const mangeDebout = format === 'assis' ? 0 : arrondi(invites / 12)

  const lignes: LigneBareme[] = [
    {
      cle: 'chaises',
      quantite: nbSieges,
      libelleCle: 'calculator.items.chaises',
      uniteCle: 'calculator.units.pieces',
      regleCle: `calculator.rules.chaises-${format}`,
    },
  ]

  if (tablesRondes) {
    lignes.push({
      cle: 'tables-rondes',
      quantite: tablesRondes,
      libelleCle: 'calculator.items.tables-rondes',
      libelleParams: { n: COUVERTS_PAR_TABLE },
      uniteCle: 'calculator.units.tables',
      regleCle: 'calculator.rules.tables-rondes',
      regleParams: { n: COUVERTS_PAR_TABLE },
    })
  }

  if (mangeDebout) {
    lignes.push({
      cle: 'mange-debout',
      quantite: mangeDebout,
      libelleCle: 'calculator.items.mange-debout',
      uniteCle: 'calculator.units.tables',
      regleCle: 'calculator.rules.mange-debout',
    })
  }

  lignes.push({
    cle: 'nappes',
    quantite: tablesRondes + mangeDebout + arrondi(invites / 60),
    libelleCle: 'calculator.items.nappes',
    uniteCle: 'calculator.units.pieces',
    regleCle: 'calculator.rules.nappes',
  })

  if (assis) {
    lignes.push({
      cle: 'assiettes',
      quantite: arrondi(invites * 2.5 * MARGE_CASSE),
      libelleCle: 'calculator.items.assiettes',
      uniteCle: 'calculator.units.pieces',
      regleCle: 'calculator.rules.assiettes',
    })
    lignes.push({
      cle: 'couverts',
      quantite: arrondi(invites * 3 * MARGE_CASSE),
      libelleCle: 'calculator.items.couverts',
      uniteCle: 'calculator.units.pieces',
      regleCle: 'calculator.rules.couverts',
    })
  }

  lignes.push({
    cle: 'verres',
    quantite: arrondi(invites * (soiree ? 3.5 : 2.5) * MARGE_CASSE),
    libelleCle: 'calculator.items.verres',
    uniteCle: 'calculator.units.pieces',
    regleCle: soiree ? 'calculator.rules.verres-soiree' : 'calculator.rules.verres',
  })

  lignes.push({
    cle: 'serviettes',
    quantite: arrondi(invites * 1.2),
    libelleCle: 'calculator.items.serviettes',
    uniteCle: 'calculator.units.pieces',
    regleCle: 'calculator.rules.serviettes',
  })

  /** Une tente de 100 m² abrite environ 80 personnes assises. */
  lignes.push({
    cle: 'tente',
    quantite: arrondi(invites * (assis ? 1.3 : 0.9)),
    libelleCle: 'calculator.items.tente',
    uniteCle: 'calculator.units.sqmOutdoor',
    regleCle: assis ? 'calculator.rules.tente-assis' : 'calculator.rules.tente-debout',
  })

  if (invites >= 150) {
    lignes.push({
      cle: 'sonorisation',
      quantite: invites >= 500 ? 2 : 1,
      libelleCle: 'calculator.items.sonorisation',
      uniteCle: 'calculator.units.sets',
      regleCle: 'calculator.rules.sonorisation',
    })
  }

  return lignes
}

/** Résout les clés du barème dans la langue de la page. */
export function resoudreLignes(bareme: LigneBareme[], t: Traduire): LigneMateriel[] {
  return bareme.map(ligne => ({
    cle: ligne.cle,
    quantite: ligne.quantite,
    libelle: t(ligne.libelleCle, ligne.libelleParams),
    unite: t(ligne.uniteCle),
    regle: t(ligne.regleCle, ligne.regleParams),
  }))
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

/** Réconcilie les lignes résolues, les ajustements et les articles ajoutés. */
export function appliquerAjustements(
  base: LigneMateriel[],
  ajustements: Ajustements,
  libres: LigneLibre[] = [],
  regleLibre = 'Ajouté par vos soins',
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
    regle: regleLibre,
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
 *
 * Le message part dans la langue de la page : c'est celle dans laquelle le
 * client s'exprime, et celle dans laquelle il relira sa demande.
 */
export function messageDevis(
  options: OptionsCalcul,
  lignes: LigneMateriel[],
  t: Traduire,
): string {
  const formats: Record<FormatReception, string> = {
    assis: t('calculator.quote.formatAssis'),
    cocktail: t('calculator.quote.formatCocktail'),
    mixte: t('calculator.quote.formatMixte'),
  }

  const inventaire = lignes
    .map((ligne) => {
      const base = `- ${ligne.libelle} : ${ligne.quantite} ${ligne.unite}`
      const detail = ligne as Partial<LigneInventaire>

      if (detail.libre) return `${base} (${t('calculator.quote.addedByClient')})`
      if (detail.ajustee) {
        return `${base} (${t('calculator.quote.adjusted', { n: detail.quantiteCalculee })})`
      }
      return base
    })
    .join('\n')

  const retouche = lignes.some((ligne) => {
    const detail = ligne as Partial<LigneInventaire>
    return detail.libre || detail.ajustee
  })

  return [
    t('calculator.quote.intro'),
    ``,
    t('calculator.quote.summary', {
      n: options.invites,
      format: formats[options.format],
      evening: options.soiree ? t('calculator.quote.evening') : '',
    }),
    ``,
    inventaire,
    ...(retouche ? [``, t('calculator.quote.note')] : []),
    ``,
    t('calculator.quote.closing'),
  ].join('\n')
}
