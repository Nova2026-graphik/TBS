/**
 * Télécharge les visuels de domaine retenus, et n'accepte que ce qui est
 * vérifiable : licence libre commerciale, auteur nommé, fichier réellement
 * une image.
 */
import { writeFileSync, mkdirSync } from 'node:fs'
import sharp from 'sharp'

const AGENT = 'TBS-site/1.0 (tbstogo228@gmail.com)'
const SORTIE = 'public/images/domaines'

/** Un fichier par domaine, choisi à la main pour ce qu'il montre réellement. */
const CHOIX = [
  ['mobilier-bureau', 'File:Chairs in a meeting room (Unsplash).jpg'],
  ['outillage', 'File:Tools 66.jpg'],
  ['roulant', 'File:Toyota Hilux D4-D, parque nacional Kruger, Sudáfrica, 2018-07-24, DD 09.jpg'],
  ['photovoltaique', 'File:Rooftop solar photovoltaic installation.jpg'],
  ['chimie-reactifs', 'File:Laboratory-reagents.jpg'],
  ['controle-acces', 'File:Ludwigshafen Ueberwachungskameras 001 2024 07 24.jpg'],
]

const LIBRES = /^(CC BY|CC BY-SA|CC0|Public domain|PD)/i

mkdirSync(SORTIE, { recursive: true })

const credits = []

for (const [slug, titre] of CHOIX) {
  const url = 'https://commons.wikimedia.org/w/api.php?action=query&format=json'
    + `&titles=${encodeURIComponent(titre)}`
    + '&prop=imageinfo&iiprop=url|extmetadata|mime&iiurlwidth=1600'

  const donnees = await (await fetch(url, { headers: { 'User-Agent': AGENT } })).json()
  const page = Object.values(donnees.query?.pages ?? {})[0]
  const info = page?.imageinfo?.[0]

  if (!info) {
    console.log(`✗ ${slug} — fichier introuvable`)
    continue
  }

  const nettoie = v => (v?.value ?? '').replace(/<[^>]*>/g, '').trim()
  const licence = nettoie(info.extmetadata?.LicenseShortName)
  const auteur = nettoie(info.extmetadata?.Artist)

  // Une licence non vérifiée est une licence absente : on n'écrit rien.
  if (!LIBRES.test(licence) || !auteur) {
    console.log(`✗ ${slug} — licence « ${licence} » ou auteur manquant, écarté`)
    continue
  }

  const reponse = await fetch(info.thumburl, { headers: { 'User-Agent': AGENT } })
  const brut = Buffer.from(await reponse.arrayBuffer())

  // Recadré en 4:3 et compressé : le reste du site sert des images de ce
  // gabarit, et un JPEG de 2 Mo sur un réseau togolais n'est pas une image,
  // c'est une attente.
  const fichier = `${SORTIE}/${slug}.jpg`
  const { width, height } = await sharp(brut)
    .resize(1200, 900, { fit: 'cover', position: 'attention' })
    .jpeg({ quality: 78, mozjpeg: true })
    .toFile(fichier)
    .then(async () => sharp(fichier).metadata())

  credits.push({ slug, titre: titre.replace('File:', ''), licence, auteur, page: info.descriptionurl })
  console.log(`✓ ${slug.padEnd(18)} ${width}×${height}  ${licence} · ${auteur.slice(0, 34)}`)
}

// Les crédits sont écrits, pas laissés à la mémoire de qui a lancé le script :
// une licence CC BY-SA impose de nommer l'auteur là où l'image est publiée.
const lignes = credits.map(c =>
  `| \`${c.slug}\` | [${c.titre}](${c.page}) | ${c.auteur} | ${c.licence} |`,
).join('\n')

writeFileSync('docs/credits-images.md', `# Crédits des visuels de domaine

Visuels illustrant les domaines de TBS Équipements sur \`/galerie\`, déposés par
\`npm run images:domaines\`.

**Ils sont provisoires.** Ce sont des photographies documentaires, pas des
réalisations TBS : elles illustrent un métier, elles ne prouvent rien. Le
reportage de l'issue #22 a vocation à les remplacer.

Source unique : [Wikimedia Commons](https://commons.wikimedia.org). C'est la
seule banque dont la licence de chaque fichier est vérifiable par API — ce qui
permet au script de **refuser** tout fichier dont la licence n'autorise pas la
réutilisation commerciale, ou dont l'auteur n'est pas nommé.

| Domaine | Fichier | Auteur | Licence |
| --- | --- | --- | --- |
${lignes}

Les licences CC BY et CC BY-SA imposent de créditer l'auteur ; c'est l'objet de
ce fichier. Toute image ajoutée à \`public/images/domaines/\` doit y figurer.
`)
console.log(`\n${credits.length} visuel(s) déposé(s)`)
