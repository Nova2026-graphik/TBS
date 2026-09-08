import { afterEach, describe, expect, it, vi } from 'vitest'
import {
  boundingBox,
  directionsUrl,
  mapEmbedUrl,
  mapLinkUrl,
  parseCoordinates,
} from '../../app/utils/businessLocation'

/**
 * Localisation de l'établissement.
 *
 * Les coordonnées de l'entrepôt d'Agôè-Démakpoè ne sont pas encore connues :
 * l'issue #23 attend un relevé sur place. Tout le câblage est en revanche
 * posé, et se déclenche sur deux variables d'environnement. Ces tests
 * vérifient qu'il tiendra le jour où elles arriveront — sans quoi personne ne
 * le saura avant la mise en ligne, c'est-à-dire trop tard.
 *
 * Le point d'attention est le refus : une coordonnée fausse dans un
 * `LocalBusiness` est reprise telle quelle par les moteurs et affichée comme
 * un fait. Mieux vaut ne rien publier.
 */

/** Repère plausible pour Lomé, à défaut du relevé réel. */
const LOME = { latitude: 6.2028, longitude: 1.2255 }

afterEach(() => {
  vi.restoreAllMocks()
})

describe('parseCoordinates', () => {
  it('accepte un couple valide, en nombres', () => {
    expect(parseCoordinates(LOME.latitude, LOME.longitude)).toEqual(LOME)
  })

  it('accepte les chaînes de la configuration, espaces compris', () => {
    // `runtimeConfig` ne transporte que des chaînes : c'est la forme réelle.
    expect(parseCoordinates(' 6.2028 ', ' 1.2255 ')).toEqual(LOME)
  })

  it('refuse une configuration vide — le cas d’aujourd’hui', () => {
    expect(parseCoordinates('', '')).toBeNull()
    expect(parseCoordinates(undefined, undefined)).toBeNull()
    expect(parseCoordinates(null, null)).toBeNull()
  })

  it('refuse une seule des deux valeurs', () => {
    // Ce test a trouvé un défaut réel. `Number('')` vaut 0, un zéro
    // parfaitement fini, et une longitude de 0 tombe dans les bornes du Togo :
    // une latitude renseignée sans sa longitude plaçait l'entrepôt en mer, au
    // large du Ghana, et le publiait dans le `LocalBusiness` comme un fait.
    expect(parseCoordinates('6.2028', '')).toBeNull()
    expect(parseCoordinates('', '1.2255')).toBeNull()
  })

  it('refuse le point nul, qui trahit une variable oubliée', () => {
    expect(parseCoordinates('0', '0')).toBeNull()
  })

  it('refuse ce qui n’est pas un nombre', () => {
    expect(parseCoordinates('à relever', 'à relever')).toBeNull()
  })

  it('refuse et signale une inversion latitude/longitude', () => {
    // L'erreur la plus courante d'un copier-coller de Google Maps. Ici elle
    // tombe hors du Togo, donc elle se voit — c'est tout l'objet des bornes.
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})

    expect(parseCoordinates(LOME.longitude, LOME.latitude)).toBeNull()
    expect(warn).toHaveBeenCalledOnce()
    expect(warn.mock.calls[0]?.[0]).toContain('hors du Togo')
  })

  it('refuse une position hors du pays', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})

    // Paris : au-delà de toutes les bornes.
    expect(parseCoordinates(48.8566, 2.3522)).toBeNull()
    expect(warn).toHaveBeenCalledOnce()
  })

  it('accepte le nord du Togo, pas seulement Lomé', () => {
    // Dapaong, à l'extrême nord : les bornes couvrent tout le pays, au cas où
    // TBS ouvrirait un second site.
    expect(parseCoordinates(10.8626, 0.2072)).toEqual({ latitude: 10.8626, longitude: 0.2072 })
  })
})

describe('cadrage de la carte', () => {
  it('encadre le point, longitude d’abord — l’ordre attendu par OpenStreetMap', () => {
    expect(boundingBox(LOME)).toBe('1.22150,6.19880,1.22950,6.20680')
  })

  it('resserre ou élargit selon le delta demandé', () => {
    const [ouest, sud, est, nord] = boundingBox(LOME, 0.01).split(',').map(Number)

    expect(est - ouest).toBeCloseTo(0.02, 5)
    expect(nord - sud).toBeCloseTo(0.02, 5)
  })
})

describe('liens', () => {
  it('l’iframe porte le cadre et le marqueur', () => {
    const url = new URL(mapEmbedUrl(LOME))

    expect(url.origin + url.pathname).toBe('https://www.openstreetmap.org/export/embed.html')
    expect(url.searchParams.get('bbox')).toBe(boundingBox(LOME))
    expect(url.searchParams.get('marker')).toBe('6.2028,1.2255')
  })

  it('le lien de carte ouvre au niveau de la rue', () => {
    expect(mapLinkUrl(LOME)).toBe(
      'https://www.openstreetmap.org/?mlat=6.2028&mlon=1.2255#map=17/6.2028/1.2255',
    )
  })

  it('l’itinéraire passe par Google Maps, majoritaire sur Android', () => {
    expect(directionsUrl(LOME)).toBe(
      'https://www.google.com/maps/dir/?api=1&destination=6.2028,1.2255',
    )
  })
})
