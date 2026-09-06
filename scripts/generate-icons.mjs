/**
 * Fabrique le jeu d'icônes et l'image sociale depuis le logo et la photo de
 * réception. À rejouer seulement quand l'un des deux change :
 *
 *   node scripts/generate-icons.mjs
 *
 * Les fichiers produits sont versionnés — ils font partie du site livré, au
 * même titre que les photos, et rien au déploiement ne doit dépendre de sharp.
 */
import { Buffer } from 'node:buffer'
import { mkdir, writeFile } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import sharp from 'sharp'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const LOGO = resolve(root, 'public/images/logo-tbs.png')
const OUT = resolve(root, 'public')

const image = (name) => resolve(root, 'public/images', name)

/** Blanc plutôt que transparent : une icône d'onglet se pose sur des fonds
 *  imprévisibles, et le logo est bicolore sur fond clair. */
const WHITE = { r: 255, g: 255, b: 255, alpha: 1 }
const INK = '#3e3524'
const CREAM = '#ffeed6'

/**
 * Logo détouré de ses marges, ramené à `ratio` de la largeur du carré et
 * centré. `ratio` descend à 0,58 pour l'icône masquable : Android peut y
 * découper un cercle, un losange ou une goutte, et seule la zone centrale —
 * 80 % du côté — est garantie visible.
 */
async function squareLogo(size, ratio = 0.72) {
  const trimmed = await sharp(LOGO).trim().png().toBuffer()
  const inner = Math.round(size * ratio)
  const logo = await sharp(trimmed)
    .resize({ width: inner, fit: 'inside', withoutEnlargement: false })
    .toBuffer()

  return sharp({
    create: { width: size, height: size, channels: 4, background: WHITE },
  })
    .composite([{ input: logo, gravity: 'centre' }])
    .png()
    .toBuffer()
}

/**
 * Conteneur ICO minimal autour d'images PNG.
 *
 * Le format accepte le PNG depuis Vista, et tous les navigateurs encore en
 * circulation le lisent — inutile de repasser par du BMP à masque. En-tête de
 * 6 octets, puis une entrée de 16 octets par taille, puis les PNG bout à bout.
 */
function buildIco(images) {
  const header = Buffer.alloc(6)
  header.writeUInt16LE(0, 0) // réservé
  header.writeUInt16LE(1, 2) // type : icône
  header.writeUInt16LE(images.length, 4)

  const directory = Buffer.alloc(16 * images.length)
  let offset = header.length + directory.length

  images.forEach(({ size, data }, i) => {
    const entry = i * 16
    // 256 px s'écrit 0 : le champ ne fait qu'un octet.
    directory.writeUInt8(size >= 256 ? 0 : size, entry)
    directory.writeUInt8(size >= 256 ? 0 : size, entry + 1)
    directory.writeUInt8(0, entry + 2) // couleurs de la palette
    directory.writeUInt8(0, entry + 3) // réservé
    directory.writeUInt16LE(1, entry + 4) // plans
    directory.writeUInt16LE(32, entry + 6) // bits par pixel
    directory.writeUInt32LE(data.length, entry + 8)
    directory.writeUInt32LE(offset, entry + 12)
    offset += data.length
  })

  return Buffer.concat([header, directory, ...images.map((i) => i.data)])
}

/**
 * Image de partage 1200 × 630 : la photo assombrie comme sur le site, le logo
 * sur une plaque claire, et deux lignes de texte. Sans elle, les aperçus
 * WhatsApp et LinkedIn recadraient une photo verticale et muette.
 *
 * Le texte est posé en SVG, sans retour à la ligne automatique : les libellés
 * sont donc courts et fixés ici, à la main. Georgia remplace Cormorant
 * Garamond, absente de la machine qui fabrique l'image — même famille (serif
 * à empattements fins), et l'écart ne se voit qu'à côté du site.
 */
async function socialImage({ photo, eyebrow, title, tagline, footer, crop = 'centre' }) {
  const W = 1200
  const H = 630

  // Les photos sources sont verticales : la bande retenue change tout. Le
  // centre convient partout sauf mention contraire ; `attention` laissait la
  // carte « À propos » sur un premier plan flou.
  const base = await sharp(photo).resize(W, H, { fit: 'cover', position: crop }).toBuffer()

  const veil = Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">
    <defs>
      <linearGradient id="v" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="${INK}" stop-opacity="0.62"/>
        <stop offset="45%" stop-color="${INK}" stop-opacity="0.72"/>
        <stop offset="100%" stop-color="${INK}" stop-opacity="0.94"/>
      </linearGradient>
    </defs>
    <rect width="${W}" height="${H}" fill="url(#v)"/>
  </svg>`)

  const text = Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">
    <g font-family="Georgia, 'Times New Roman', serif">
      <rect x="72" y="392" width="54" height="2" fill="${CREAM}" opacity="0.85"/>
      <text x="140" y="399" font-family="Segoe UI, Arial, sans-serif" font-size="21"
            letter-spacing="5.5" fill="${CREAM}" opacity="0.9">${escapeXml(eyebrow)}</text>
      <text x="72" y="476" font-size="66" fill="#ffffff">${escapeXml(title)}</text>
      <text x="72" y="524" font-size="40" font-style="italic" fill="${CREAM}">${escapeXml(tagline)}</text>
      <text x="72" y="574" font-family="Segoe UI, Arial, sans-serif" font-size="24"
            fill="#ffffff" opacity="0.82">${escapeXml(footer)}</text>
    </g>
  </svg>`)

  const trimmed = await sharp(LOGO).trim().png().toBuffer()
  const logo = await sharp(trimmed).resize({ width: 190 }).toBuffer()
  const { height: logoH = 0 } = await sharp(logo).metadata()

  const pad = 26
  const plaque = await sharp({
    create: {
      width: 190 + pad * 2,
      height: logoH + pad * 2,
      channels: 4,
      background: { r: 255, g: 248, b: 236, alpha: 0.96 },
    },
  })
    .composite([{ input: logo, gravity: 'centre' }])
    .png()
    .toBuffer()

  return sharp(base)
    .composite([{ input: veil }, { input: plaque, top: 66, left: 72 }, { input: text }])
    .jpeg({ quality: 86, chromaSubsampling: '4:4:4' })
    .toBuffer()
}

/** `&` et `<` dans un libellé casseraient le SVG. */
function escapeXml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
}

/**
 * Une carte par page qui en déclare une. Toutes au même format : les
 * dimensions annoncées dans `og:image:width` / `og:image:height` valent alors
 * pour n'importe laquelle — cf. `app/composables/useSeo.ts`.
 */
const SOCIAL_CARDS = {
  'og-image.jpg': {
    photo: image('hero-reception.jpg'),
    crop: 'attention',
    eyebrow: 'LOMÉ — TOGO',
    title: 'TBS Distribution S.A.R.L',
    tagline: 'Équiper vos réceptions, fournir vos projets',
    footer: 'Équipements · Events · Études & Conseils · Agro',
  },
  'og-services.jpg': {
    photo: image('branche-equipements.jpg'),
    eyebrow: 'NOS SERVICES',
    title: 'Quatre branches, un interlocuteur',
    tagline: 'Fournir, équiper, conseiller, cultiver',
    footer: 'TBS Distribution S.A.R.L — Lomé, Togo',
  },
  'og-galerie.jpg': {
    photo: image('galerie-mariage-adjovi.jpg'),
    eyebrow: 'RÉALISATIONS',
    title: 'Nos réceptions et livraisons',
    tagline: 'Mariages, cérémonies, réceptions d’entreprise',
    footer: 'TBS Distribution S.A.R.L — Lomé, Togo',
  },
  'og-a-propos.jpg': {
    photo: image('apropos-equipe.jpg'),
    eyebrow: 'À PROPOS',
    title: 'Dix ans sur le terrain togolais',
    tagline: 'Un parc de plus de 900 références',
    footer: 'TBS Distribution S.A.R.L — Lomé, Togo',
  },
}

async function main() {
  await mkdir(OUT, { recursive: true })

  const png = async (size, ratio) => squareLogo(size, ratio)

  const files = {
    'apple-touch-icon.png': await png(180, 0.7),
    'icon-192.png': await png(192, 0.72),
    'icon-512.png': await png(512, 0.72),
    // Zone de sécurité Android : le logo tient dans le cercle central.
    'icon-512-maskable.png': await png(512, 0.58),
    'favicon-96.png': await png(96, 0.78),
  }

  for (const [name, card] of Object.entries(SOCIAL_CARDS)) {
    files[name] = await socialImage(card)
  }

  files['favicon.ico'] = buildIco([
    { size: 16, data: await png(16, 0.86) },
    { size: 32, data: await png(32, 0.84) },
    { size: 48, data: await png(48, 0.82) },
  ])

  for (const [name, data] of Object.entries(files)) {
    await writeFile(resolve(OUT, name), data)
    console.log(`${name} — ${(data.length / 1024).toFixed(1)} Ko`)
  }
}

main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
