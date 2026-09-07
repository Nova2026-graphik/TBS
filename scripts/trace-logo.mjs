/**
 * Vectorise le logo pour `favicon.svg` et `mask-icon.svg`.
 *
 * Le dépôt n'a du logo qu'un PNG de 400 × 200. Emballer ce PNG dans un `<svg>`
 * n'aurait rien donné — mêmes pixels, aucune mise à l'échelle gagnée. Le
 * logotype étant un aplat bichrome sans dégradé ni détail fin, il se **trace**
 * proprement : chaque couleur est isolée en masque noir et blanc, puis convertie
 * en contours par potrace.
 *
 * Ce n'est pas le fichier d'origine, et cela se dit : si TBS retrouve son AI ou
 * son EPS, il vaut mieux le substituer. En attendant, un tracé net vaut mieux
 * qu'une absence — Safari n'affiche pas d'icône épinglée sans SVG monochrome, et
 * les navigateurs modernes préfèrent le SVG au PNG dans l'onglet.
 *
 *   node scripts/trace-logo.mjs
 */
import { writeFile } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { promisify } from 'node:util'
import potrace from 'potrace'
import sharp from 'sharp'

const racine = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const LOGO = resolve(racine, 'public/images/logo-tbs.png')

/** Les deux encres du logotype, relevées sur le fichier source. */
const ENCRES = [
  { nom: 'bleu', cible: [48, 120, 192], sortie: '#2E78C0' },
  { nom: 'rouge', cible: [216, 48, 48], sortie: '#D83030' },
]

/** Marge autour du logotype dans le carré, en fraction du côté. */
const MARGE = 0.12

/**
 * Trace à haute résolution : les contours suivent le pixel, pas l'inverse.
 *
 * Descendre à 700 px avec une tolérance de 1,0 ramènerait le SVG de 30 à
 * 18 Ko, au prix de courbes légèrement plus molles sur le « s ». L'écart ne
 * se voit pas à 32 px, mais le fichier sert aussi d'unique source vectorielle
 * du logotype : autant le garder fidèle. Compressé, il pèse 12,8 Ko, chargés
 * une seule fois puis mis en cache.
 */
const RESOLUTION = 1600

const tracer = promisify(potrace.trace)

/**
 * Masque noir et blanc d'une encre.
 *
 * La distance est calculée dans l'espace RVB : les deux encres sont assez
 * éloignées l'une de l'autre et du blanc pour qu'un seuil simple suffise. Les
 * pixels d'anticrénelage, à mi-chemin, tombent du côté de l'encre la plus
 * proche — c'est ce qui donne des contours pleins plutôt que dentelés.
 */
async function masque(cible) {
  const { data, info } = await sharp(LOGO)
    .flatten({ background: '#ffffff' })
    .raw()
    .toBuffer({ resolveWithObject: true })

  const sortie = Buffer.alloc(info.width * info.height)

  for (let p = 0; p < info.width * info.height; p++) {
    const i = p * info.channels
    const pixel = [data[i], data[i + 1], data[i + 2]]

    const distances = [...ENCRES.map(e => e.cible), [255, 255, 255]].map(ref =>
      Math.hypot(pixel[0] - ref[0], pixel[1] - ref[1], pixel[2] - ref[2]),
    )
    const plusProche = distances.indexOf(Math.min(...distances))
    const estCible = ENCRES[plusProche]?.cible === cible

    // potrace noircit ce qui est sous le seuil : l'encre passe en noir.
    sortie[p] = estCible ? 0 : 255
  }

  return sharp(sortie, { raw: { width: info.width, height: info.height, channels: 1 } })
    .resize({ width: RESOLUTION, kernel: 'lanczos3' })
    .threshold(128)
    .png()
    .toBuffer()
}

/** Extrait l'attribut `d` du SVG rendu par potrace. */
function chemins(svg) {
  return [...svg.matchAll(/ d="([^"]+)"/g)].map(m => m[1])
}

/** Boîte englobante du tracé, pour recadrer le logotype au plus juste. */
function boite(listeDeChemins) {
  const nombres = listeDeChemins
    .join(' ')
    .match(/-?\d+(?:\.\d+)?/g)
    ?.map(Number) ?? []

  const xs = nombres.filter((_, i) => i % 2 === 0)
  const ys = nombres.filter((_, i) => i % 2 === 1)

  return {
    x: Math.min(...xs),
    y: Math.min(...ys),
    largeur: Math.max(...xs) - Math.min(...xs),
    hauteur: Math.max(...ys) - Math.min(...ys),
  }
}

async function main() {
  const traces = []

  for (const encre of ENCRES) {
    const svg = await tracer(await masque(encre.cible), {
      threshold: 128,
      turdSize: 8, // ignore les îlots de moins de 8 px² — le bruit d'anticrénelage
      optCurve: true,
      optTolerance: 0.2,
      alphaMax: 1,
    })
    traces.push({ ...encre, chemins: chemins(svg) })
    console.log(`${encre.nom} : ${chemins(svg).length} contour(s)`)
  }

  const tous = traces.flatMap(t => t.chemins)
  const b = boite(tous)

  // Carré autour du logotype, marge comprise — même cadrage que les PNG.
  const cote = Math.max(b.largeur, b.hauteur) * (1 + MARGE * 2)
  const x = b.x - (cote - b.largeur) / 2
  const y = b.y - (cote - b.hauteur) / 2
  const viewBox = [x, y, cote, cote].map(n => n.toFixed(1)).join(' ')

  const corps = traces
    .map(t => t.chemins.map(d => `  <path fill="${t.sortie}" d="${d}"/>`).join('\n'))
    .join('\n')

  await writeFile(resolve(racine, 'public/favicon.svg'), `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${viewBox}">
  <rect x="${x.toFixed(1)}" y="${y.toFixed(1)}" width="${cote.toFixed(1)}" height="${cote.toFixed(1)}" fill="#ffffff"/>
${corps}
</svg>
`)

  /**
   * Icône épinglée de Safari : monochrome imposé, le navigateur applique
   * lui-même la couleur d'accent. Fond transparent, un seul aplat noir.
   */
  await writeFile(resolve(racine, 'public/mask-icon.svg'), `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${viewBox}">
${tous.map(d => `  <path fill="#000000" d="${d}"/>`).join('\n')}
</svg>
`)

  console.log('favicon.svg et mask-icon.svg écrits · viewBox', viewBox)
}

main().catch((erreur) => {
  console.error(erreur)
  process.exitCode = 1
})
