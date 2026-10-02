import { describe, expect, it } from 'vitest'
import { decouperTexteEnrichi } from '../../app/utils/texteEnrichi'

/**
 * Le texte des pages légales vient des fichiers de langue et traverse ce
 * découpage avant d'être affiché. Une erreur ici ne casse pas la page : elle
 * publie une phrase fausse sur un document qui engage la société.
 */
describe('decouperTexteEnrichi', () => {
  it('rend un texte sans marque en un seul segment', () => {
    expect(decouperTexteEnrichi('Une phrase ordinaire.')).toEqual([
      { type: 'texte', texte: 'Une phrase ordinaire.' },
    ])
  })

  it('isole la mise en relief', () => {
    expect(decouperTexteEnrichi('Le site ne dépose **aucun cookie** du tout.')).toEqual([
      { type: 'texte', texte: 'Le site ne dépose ' },
      { type: 'fort', texte: 'aucun cookie' },
      { type: 'texte', texte: ' du tout.' },
    ])
  })

  it('distingue le lien interne du lien externe', () => {
    expect(decouperTexteEnrichi('Voir les [mentions](/mentions-legales).')).toContainEqual(
      { type: 'route', texte: 'mentions', cible: '/mentions-legales' },
    )
    expect(decouperTexteEnrichi('Écrivez à [nous](mailto:a@b.tg).')).toContainEqual(
      { type: 'lien', texte: 'nous', cible: 'mailto:a@b.tg' },
    )
    expect(decouperTexteEnrichi('Appelez le [90](tel:+22890).')).toContainEqual(
      { type: 'lien', texte: '90', cible: 'tel:+22890' },
    )
  })

  /**
   * Un quantificateur gourmand avalerait tout ce qui sépare deux marques :
   * « **a** et **b** » rendrait un seul gras « a** et **b ».
   */
  it('sépare deux marques successives', () => {
    expect(decouperTexteEnrichi('**a** et **b**')).toEqual([
      { type: 'fort', texte: 'a' },
      { type: 'texte', texte: ' et ' },
      { type: 'fort', texte: 'b' },
    ])
  })

  it('mélange gras et liens dans la même phrase', () => {
    const segments = decouperTexteEnrichi('**Important** : voir la [politique](/confidentialite).')
    expect(segments.map(s => s.type)).toEqual(['fort', 'texte', 'route', 'texte'])
  })

  /**
   * Le contenu vient de fichiers que d'autres mains mettront à jour. Une
   * marque mal fermée doit s'afficher telle quelle — jamais disparaître, et
   * surtout jamais être interprétée.
   */
  it('laisse passer une marque incomplète sans rien perdre', () => {
    for (const texte of ['Deux **astérisques isolés', 'Un [lien sans cible', 'Un ](inverse)']) {
      expect(decouperTexteEnrichi(texte).map(s => s.texte).join('')).toBe(texte)
    }
  })

  it('ne laisse jamais tomber un caractère', () => {
    const texte = 'TBS **loue** du matériel ; voir [le devis](/contact) et [écrire](mailto:a@b.tg).'
    const rendu = decouperTexteEnrichi(texte)
      .map(s => (s.type === 'fort' ? `**${s.texte}**` : s.type === 'texte' ? s.texte : `[${s.texte}](${s.cible})`))
      .join('')
    expect(rendu).toBe(texte)
  })

  it('rend un tableau vide pour une chaîne vide', () => {
    expect(decouperTexteEnrichi('')).toEqual([])
  })
})
