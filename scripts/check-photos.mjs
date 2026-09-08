/**
 * Réception du reportage photo.
 *
 * Les trente-trois photographies du site viennent de la maquette : ce sont des
 * images de banque, à remplacer par de vrais clichés TBS (issue #22). Le
 * cahier de tournage — `docs/reportage-photo.md` — promet que le remplacement
 * ne demande aucune intervention sur le code, à deux conditions : conserver
 * les noms de fichiers, et conserver les proportions. Rien ne vérifiait ni
 * l'une ni l'autre.
 *
 *   npm run photos:check
 *
 * Une promesse tenue par un document seul finit toujours par être rompue le
 * jour de la livraison, quand un fichier arrive en paysage là où le site
 * attend un portrait. Le cadrage du site est réglé sur les proportions
 * actuelles : un portrait remplacé par un paysage ne se recadre pas, il coupe
 * le sujet.
 *
 * Le fichier de référence `docs/photos-reference.json` enregistre la géométrie
 * attendue de chaque fichier. Il se régénère, une fois la livraison acceptée :
 *
 *   npm run photos:check -- --enregistrer
 *
 * Renvoie un code non nul dès qu'un fichier manque, change d'orientation,
 * s'écarte de ses proportions ou perd en définition.
 */
import { readFile, readdir, writeFile } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import process from 'node:process'
import sharp from 'sharp'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const IMAGES = resolve(root, 'public/images')
const REFERENCE = resolve(root, 'docs/photos-reference.json')

/**
 * Tolérance sur les proportions.
 *
 * Un recadrage à la main ne retombe jamais au pixel près sur le rapport
 * d'origine, et le site n'en souffre pas : 2 % laissent passer un 3:2 devenu
 * 1,49 ou 1,53, et arrêtent un 3:2 devenu 4:3.
 */
const TOLERANCE = 0.02

/** Définition visée par le cahier de tournage, en pixels de large. */
const LARGEUR_VISEE = 2400

/**
 * Fichiers que le reportage ne remplacera pas.
 *
 * Le logotype n'est pas une photographie : il changera le jour où TBS fournira
 * un fichier vectoriel, pas à la demi-journée de prises de vue.
 */
const HORS_REPORTAGE = new Set(['logo-tbs.png'])

/** Dossiers où une image peut être citée. */
const SOURCES = ['app', 'server', 'i18n', 'content']

const orientation = (width, height) =>
  width === height ? 'carré' : width > height ? 'paysage' : 'portrait'

/** Géométrie d'un fichier, ou `null` s'il est absent ou illisible. */
async function geometrie(nom) {
  try {
    const { width, height } = await sharp(resolve(IMAGES, nom)).metadata()
    return { width, height, ratio: Number((width / height).toFixed(4)), orientation: orientation(width, height) }
  }
  catch {
    return null
  }
}

/** Les fichiers image du dossier public, dans l'ordre alphabétique. */
async function fichiers() {
  const noms = await readdir(IMAGES)
  return noms.filter(nom => /\.(jpe?g|png)$/i.test(nom)).sort()
}

/**
 * Les images citées dans le code, relevées à la lecture des sources.
 *
 * Une image peut être nommée dans un objet de données, un gabarit ou une
 * traduction ; toutes s'écrivent `/images/<nom>`. Le relevé est textuel, donc
 * large : il vaut mieux signaler une citation de trop qu'en manquer une.
 */
async function citees() {
  const trouvees = new Set()

  async function parcourir(chemin) {
    for (const entree of await readdir(chemin, { withFileTypes: true })) {
      const complet = resolve(chemin, entree.name)
      if (entree.isDirectory()) {
        if (entree.name !== 'node_modules') await parcourir(complet)
        continue
      }
      if (!/\.(ts|js|mjs|vue|json|md)$/.test(entree.name)) continue
      const texte = await readFile(complet, 'utf8')
      for (const [, nom] of texte.matchAll(/\/images\/([\w-]+\.(?:jpe?g|png))/g)) trouvees.add(nom)
    }
  }

  for (const dossier of SOURCES) {
    await parcourir(resolve(root, dossier)).catch(() => {})
  }
  return trouvees
}

// ── Enregistrement de la référence ─────────────────────────────────────────

if (process.argv.includes('--enregistrer')) {
  const reference = {}
  for (const nom of await fichiers()) {
    const geo = await geometrie(nom)
    if (geo) reference[nom] = geo
  }
  await writeFile(REFERENCE, `${JSON.stringify(reference, null, 2)}\n`, 'utf8')
  console.log(`Référence enregistrée : ${Object.keys(reference).length} fichiers → docs/photos-reference.json`)
  process.exit(0)
}

// ── Vérification ───────────────────────────────────────────────────────────

const reference = JSON.parse(await readFile(REFERENCE, 'utf8'))
const presents = await fichiers()
const nommees = await citees()

const erreurs = []
const remarques = []
const manquants = new Set()
let aRemplacer = 0

for (const [nom, attendu] of Object.entries(reference)) {
  const geo = await geometrie(nom)

  if (!geo) {
    erreurs.push(`${nom} — absent de public/images`)
    manquants.add(nom)
    continue
  }

  if (geo.orientation !== attendu.orientation) {
    erreurs.push(`${nom} — ${attendu.orientation} attendu, ${geo.orientation} livré : le cadrage du site coupera le sujet`)
    continue
  }

  const ecart = Math.abs(geo.ratio - attendu.ratio) / attendu.ratio
  if (ecart > TOLERANCE) {
    erreurs.push(`${nom} — proportions ${geo.ratio} au lieu de ${attendu.ratio} (${(ecart * 100).toFixed(1)} % d'écart)`)
    continue
  }

  if (geo.width < attendu.width) {
    erreurs.push(`${nom} — ${geo.width} px de large contre ${attendu.width} px : le site servirait une image agrandie`)
    continue
  }

  if (HORS_REPORTAGE.has(nom)) continue
  if (geo.width < LARGEUR_VISEE) aRemplacer += 1
  else if (attendu.width < LARGEUR_VISEE) remarques.push(`${nom} — ${geo.width} px : vrai cliché reçu, pensez à réenregistrer la référence`)
}

// Une image citée sans être en référence : un chemin inventé, ou un fichier
// oublié à l'ajout. Les absences déjà signalées ne le sont pas deux fois.
for (const nom of nommees) {
  if (!presents.includes(nom) && !manquants.has(nom)) {
    erreurs.push(`${nom} — cité dans les sources, introuvable dans public/images`)
  }
}

for (const nom of presents) {
  if (!reference[nom]) remarques.push(`${nom} — présent, hors référence : à ajouter par --enregistrer s'il est légitime`)
  else if (!nommees.has(nom)) remarques.push(`${nom} — jamais cité dans les sources`)
}

console.log(`\n${presents.length} fichiers dans public/images, ${Object.keys(reference).length} en référence.\n`)

if (aRemplacer) {
  console.log(`  ⏳ ${aRemplacer} images de maquette sous ${LARGEUR_VISEE} px — le reportage de l'issue #22 les remplacera.`)
}
for (const remarque of remarques) console.log(`  · ${remarque}`)
for (const erreur of erreurs) console.log(`  ✗ ${erreur}`)

if (erreurs.length) {
  console.log(`\n✗ ${erreurs.length} problème(s) — voir docs/reportage-photo.md, « Remplacement des fichiers ».`)
  process.exit(1)
}

console.log('\n✔ Noms, orientations, proportions et définitions conformes.')
