/**
 * Localisation de l'établissement.
 *
 * Les coordonnées ne sont pas écrites en dur : elles viennent de la
 * configuration, et tant qu'elles n'y sont pas, **rien n'est publié**. Une
 * latitude approximative dans un `LocalBusiness` est pire que son absence :
 * elle est reprise telle quelle par les moteurs, affichée comme un fait, et
 * envoie un chauffeur à un kilomètre de l'entrepôt sans que personne ne sache
 * d'où vient l'erreur.
 *
 * Le relevé se fait sur place — application boussole, ou Google Maps, clic
 * long sur le point, les deux nombres s'affichent.
 */

/** Coordonnées validées, prêtes à être publiées. */
export interface BusinessCoordinates {
  latitude: number
  longitude: number
}

/**
 * Analyse un couple de valeurs de configuration.
 *
 * Renvoie `null` dès qu'une des deux manque ou sort des bornes : mieux vaut
 * une carte approximative assumée qu'un point faux présenté comme exact. Les
 * bornes sont celles du Togo, élargies d'un demi-degré — une coordonnée
 * saisie à l'envers (longitude dans la latitude, l'erreur la plus courante)
 * tombe alors en dehors et se signale au lieu de passer.
 */
export function parseCoordinates(
  latitude: unknown,
  longitude: unknown,
): BusinessCoordinates | null {
  const lat = Number(String(latitude ?? '').trim())
  const lng = Number(String(longitude ?? '').trim())

  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null
  if (lat === 0 && lng === 0) return null

  // Togo : latitude 6,0 à 11,2 · longitude −0,2 à 1,9.
  const dansLeTogo = lat >= 5.5 && lat <= 11.7 && lng >= -0.7 && lng <= 2.4
  if (!dansLeTogo) {
    console.warn(
      `[localisation] Coordonnées hors du Togo : ${lat}, ${lng}. `
      + 'Vérifiez l\'ordre — la latitude vient en premier. Ignorées.',
    )
    return null
  }

  return { latitude: lat, longitude: lng }
}

/**
 * Cadre d'affichage autour du point, pour l'iframe OpenStreetMap.
 *
 * `delta` en degrés : 0,004 ≈ 450 m de côté, l'échelle à laquelle on
 * distingue une rue et un portail d'entrepôt.
 */
export function boundingBox({ latitude, longitude }: BusinessCoordinates, delta = 0.004): string {
  const arrondi = (n: number) => n.toFixed(5)
  return [
    arrondi(longitude - delta),
    arrondi(latitude - delta),
    arrondi(longitude + delta),
    arrondi(latitude + delta),
  ].join(',')
}

/** URL de l'iframe OpenStreetMap, marqueur compris. */
export function mapEmbedUrl(coords: BusinessCoordinates): string {
  const params = new URLSearchParams({
    bbox: boundingBox(coords),
    layer: 'mapnik',
    marker: `${coords.latitude},${coords.longitude}`,
  })
  return `https://www.openstreetmap.org/export/embed.html?${params}`
}

/** Lien vers la carte complète, centré sur le point. */
export function mapLinkUrl(coords: BusinessCoordinates): string {
  return `https://www.openstreetmap.org/?mlat=${coords.latitude}&mlon=${coords.longitude}#map=17/${coords.latitude}/${coords.longitude}`
}

/**
 * Itinéraire.
 *
 * Google Maps plutôt qu'OpenStreetMap : c'est l'application de navigation
 * installée par défaut sur les téléphones Android, largement majoritaires au
 * Togo. Le lien s'ouvre dans l'application si elle est présente, dans le
 * navigateur sinon.
 */
export function directionsUrl(coords: BusinessCoordinates): string {
  return `https://www.google.com/maps/dir/?api=1&destination=${coords.latitude},${coords.longitude}`
}
