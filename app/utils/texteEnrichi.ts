/**
 * Découpage d'un texte de fichier de langue en segments affichables.
 *
 * Les pages légales sont du texte suivi, et du texte suivi comporte des mots
 * en gras et des liens au milieu des phrases. Deux façons de les traduire :
 *
 *  - **découper chaque paragraphe en morceaux** dans les fichiers de langue
 *    — « Écrivez à », l'adresse, « ou appelez le », le numéro. Le traducteur
 *    reçoit des bouts de phrase sans ordre imposé, et l'anglais, qui ne les
 *    enchaîne pas comme le français, se retrouve coincé ;
 *  - **garder la phrase entière** et y laisser une notation légère que ce
 *    module relit. C'est ce qui est fait ici.
 *
 * La notation tient en deux signes, repris de Markdown :
 *
 * ```
 * **important**                      → <strong>
 * [mentions légales](/mentions-legales) → lien interne, traduit par la locale
 * [contact@tbs.tg](mailto:contact@tbs.tg) → lien externe tel quel
 * ```
 *
 * Rien n'est jamais injecté en HTML : le composant qui consomme ces segments
 * les passe par l'interpolation de Vue, donc échappés. Un chevron écrit dans
 * un fichier de langue s'affiche, il ne s'exécute pas.
 */

export type SegmentTexte
  /** Texte nu. */
  = | { type: 'texte', texte: string }
  /** Mise en relief. */
    | { type: 'fort', texte: string }
  /** Lien interne au site, à passer par `NuxtLinkLocale`. */
    | { type: 'route', texte: string, cible: string }
  /** `mailto:`, `tel:` ou adresse absolue — un `<a>` ordinaire. */
    | { type: 'lien', texte: string, cible: string }

/**
 * `**gras**` ou `[libellé](cible)`. Les quantificateurs sont paresseux pour
 * que deux marques successives sur une même ligne restent deux segments.
 */
const MARQUE = /\*\*(.+?)\*\*|\[([^\]\n]+?)\]\(([^)\s]+?)\)/g

/** Un lien interne commence par `/` ; tout le reste part tel quel dans `href`. */
function estInterne(cible: string): boolean {
  return cible.startsWith('/')
}

export function decouperTexteEnrichi(texte: string): SegmentTexte[] {
  const segments: SegmentTexte[] = []
  let curseur = 0

  for (const trouvee of texte.matchAll(MARQUE)) {
    const debut = trouvee.index
    if (debut > curseur) segments.push({ type: 'texte', texte: texte.slice(curseur, debut) })

    const [brut, fort, libelle, cible] = trouvee
    if (fort !== undefined) {
      segments.push({ type: 'fort', texte: fort })
    }
    else {
      segments.push({
        type: estInterne(cible!) ? 'route' : 'lien',
        texte: libelle!,
        cible: cible!,
      })
    }

    curseur = debut + brut.length
  }

  if (curseur < texte.length) segments.push({ type: 'texte', texte: texte.slice(curseur) })

  return segments
}
