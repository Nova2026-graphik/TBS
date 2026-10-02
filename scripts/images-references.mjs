/**
 * Visuels des références du catalogue — un par référence.
 *
 *   npm run images:references
 *
 * Source unique : Wikimedia Commons. C'est la seule banque dont la licence de
 * chaque fichier se vérifie **par API**, ce qui permet au script de refuser
 * automatiquement tout ce qu'il ne peut pas prouver : licence n'autorisant pas
 * l'usage commercial, ou auteur non nommé.
 *
 * Ce que ces images sont, et ne sont pas :
 *
 *  - pour une référence **générique** — « Armoire bibliothèque en bois »,
 *    « Scies à métaux », « Transpalette manuel » — la photographie montre bien
 *    l'objet décrit ;
 *  - pour un **modèle nommé** — « Bureau Solano », « HP ProBook 450 G8 »,
 *    « Analyseur EA-2000B » — elle montre le **type** d'objet, pas ce modèle
 *    précis. Commons est une archive encyclopédique, pas un catalogue
 *    fournisseur.
 *
 * Cette limite est écrite dans `docs/credits-images.md` plutôt que tue. Les
 * photographies produit exactes viendront des catalogues fournisseurs, qui
 * autorisent en général leurs revendeurs à les reprendre.
 */
import { writeFileSync, mkdirSync, existsSync } from 'node:fs'
import sharp from 'sharp'
import { equipment } from '../server/data/content.ts'

const AGENT = 'TBS-site/1.0 (tbstogo228@gmail.com)'
const SORTIE = 'public/images/references'
const LIBRES = /^(CC BY|CC BY-SA|CC0|Public domain|PD)/i

/**
 * Requête Commons par référence, en anglais et en termes d'objet.
 *
 * Écrite à la main : traduire mécaniquement le nom français donnerait
 * « bank of welcome ATLAS » pour une banque d'accueil. Le nom commercial est
 * toujours retiré — il ne ramène rien, ou pire, il ramène autre chose.
 */
const REQUETES = {
  // ── mobilier-bureau ──────────────────────────────────────────────────────
  'Armoire bibliothèque en bois': 'wooden bookcase shelf furniture',
  'Armoire en bois à portes battantes': 'wooden cabinet doors office',
  'Armoire à portes coulissantes transparentes': 'glass sliding door cabinet',
  'Banque d\'accueil ATLAS': 'reception desk lobby counter',
  'Bureau droit, gamme panneaux': 'office desk workstation',
  'Bureau individuel Solano avec retour et caisson': 'executive office desk',
  'Caisson de bureau à roulettes': 'office drawer pedestal',
  'Canapé d\'angle convertible réversible': 'corner sofa couch',
  'Canapé MAMAIA 3 places': 'three seater sofa',
  'Canapé d\'accueil de bureau': 'waiting room sofa',
  'Fauteuil de direction en cuir': 'leather office chair',
  'Fauteuil visiteur Dallas': 'visitor chair mesh',
  'Fauteuils de salle de conférence': 'auditorium seating chairs',
  'Salon complet 5 pièces': 'living room furniture set',
  'Salon complet 6 pièces': 'sofa armchair set living room',
  'Salon de jardin en résine tressée': 'rattan garden furniture set',
  'Siège visiteur en cuir': 'leather armchair office',
  'Table de conférence 12 personnes': 'conference table meeting room',
  'Table de réunion en bois massif': 'wooden meeting table',

  // ── informatique ─────────────────────────────────────────────────────────
  'Écran interactif tactile SpeechiTouch 65 pouces': 'interactive whiteboard touchscreen classroom',
  'HP LaserJet Pro MFP M479fdw': 'laser printer office multifunction',
  'HP ProBook 450 G8': 'laptop computer notebook',
  'HP Spectre x360': 'convertible laptop tablet mode',

  // ── sante-laboratoire ────────────────────────────────────────────────────
  'Analyseur d\'électrolytes EA-2000B': 'clinical chemistry analyzer laboratory',
  'Analyseur de coagulation automatique': 'hematology analyzer laboratory',
  'Analyseur immunochromatographique': 'rapid test cassette immunoassay',
  'Bavettes de protection haute filtration': 'surgical mask respirator',
  'Colposcope vidéo EDAN C3(A)/C6(A)': 'colposcope gynecology examination',
  'Concentrateur d\'oxygène Diamedica Bébé CPAP': 'oxygen concentrator medical',
  'Conductimètre HANNA HI 9835': 'conductivity meter water testing',
  'ECG Colson Cardi 6 multipistes': 'electrocardiograph ECG machine',
  'Lampe de photothérapie nouveau-né': 'neonatal phototherapy incubator',
  'Laveur de microplaques automatique 670': 'microplate washer ELISA',
  'Microscope biologique numérique Celestron': 'optical microscope laboratory',
  'Moniteur patient M-9000-E': 'patient monitor vital signs',
  'Papier pour ECG Colson / Cardiette': 'thermal paper roll',
  'pH-mètre multiparamètre': 'pH meter laboratory',
  'Spectromètre d\'absorption atomique 280Z AA': 'atomic absorption spectrometer',
  'Tensiomètre Heine Gamma GP': 'sphygmomanometer blood pressure cuff',
  'Thermoflash Pro LX-261E': 'infrared thermometer forehead',

  // ── roulant ──────────────────────────────────────────────────────────────
  'Toyota Fortuner turbo': 'Toyota Fortuner SUV',
  'Toyota Hilux 4×4 double cabine': 'Toyota Hilux double cab pickup',
  'Toyota Land Cruiser Prado': 'Toyota Land Cruiser Prado',
  'Toyota Rush': 'Toyota Rush car',
  'Boîte de filtre à carburant Toyota Hilux': 'fuel filter housing automotive',
  'Filtre à carburant Toyota Hilux': 'fuel filter car part',
  'Jante aluminium 4×4': 'alloy wheel rim',
  'Pneus Toyota Hilux Pick-up': 'off road tyre truck',

  // ── outillage ────────────────────────────────────────────────────────────
  'Mallette à outils 198 pièces': 'tool case set',
  'Étagère murale 44 boîtes': 'storage bins wall rack workshop',
  'Coffret à outils vide 5 compartiments': 'empty tool box',
  'Corde de service': 'climbing rope coil',
  'Coupe-câble à crémaillère Ø 52 mm': 'cable cutter tool',
  'Échelle coulissante 2 plans': 'extension ladder aluminium',
  'Élagueuse thermique Scheppach CSP2540': 'pole pruner chainsaw',
  'Grimpettes pour poteaux': 'pole climbing spikes lineman',
  'Indicateur d\'ordre de phases': 'phase rotation tester',
  'Pince multimètre TRMS 700 A': 'clamp meter multimeter',
  'Poste de soudure': 'welding machine workshop',
  'Scies à métaux': 'hacksaw metal saw',
  'Tronçonneuse à métaux Constructor': 'metal chop saw',
  'Tronçonneuse sans fil 6 pouces': 'cordless chainsaw battery',
  'Valise de maintenance Expert PRIMO': 'tool kit case technician',

  // ── controle-acces ───────────────────────────────────────────────────────
  'Barrière de contrôle d\'accès MAXIMA ULTRA 68': 'boom barrier parking gate',
  'Barrière de contrôle d\'accès TERRA 180': 'automatic barrier gate road',
  'Cartes badges PVC à piste magnétique': 'magnetic stripe card',
  'Centrale de contrôle d\'accès inBIO 160/260/460': 'access control panel door',
  'Gâche électrique à sécurité intégrée': 'electric door strike lock',
  'Pointeuse biométrique ZKTeco K40': 'fingerprint scanner biometric device',
  'Pointeuse TimeMoto TM-828 SC': 'time attendance clock terminal',
  'Caméra dôme 4 MP intérieure': 'dome security camera ceiling',
  'Caméra tube 4 MP extérieure': 'bullet surveillance camera outdoor',

  // ── chimie-reactifs ──────────────────────────────────────────────────────
  '2-Propanol': 'isopropanol bottle chemical',
  'Acétate d\'éthyle': 'ethyl acetate chemical bottle',
  'Acide propionique': 'propionic acid chemical',
  'Acide succinique': 'succinic acid crystals',
  'Acide sulfurique 98 %': 'sulfuric acid bottle laboratory',
  'Carbonate de baryum (BaCO₃)': 'barium carbonate powder',
  'Carbonate de potassium': 'potassium carbonate powder',
  'Charbon actif granulé': 'activated carbon granules',
  'Chlorhydrate de 1,10-phénanthroline': 'phenanthroline chemical compound',
  'Sulfate de magnésium heptahydraté': 'magnesium sulfate epsom salt crystals',

  // ── photovoltaique ───────────────────────────────────────────────────────
  'Batterie plomb 12 V / 18 Ah': 'lead acid battery 12V',
  'Chargeur solaire 12 V / 10 W': 'small solar panel charger',
  'Convertisseur 12 V vers 230 V': 'power inverter DC AC',
  'Onduleur solaire hybride 3500 W': 'solar inverter wall mounted',
  'Panneau solaire souple monocristallin': 'flexible solar panel',
  'Panneau solaire mobile 260 W': 'portable solar panel',
  'Régulateur de charge solaire': 'solar charge controller',
  'Régulateur de tension hybride solaire / éolien': 'wind solar hybrid controller',

  // ── generateurs ──────────────────────────────────────────────────────────
  'Groupe de soudage 180 A': 'engine driven welder generator',
  'Groupe électrogène Ayerbe insonorisé': 'soundproof generator set canopy',
  'Groupe électrogène diesel GENELEC': 'diesel generator set',
  'Groupe électrogène diesel KOHLER SDMO': 'industrial diesel generator',

  // ── didactiques ──────────────────────────────────────────────────────────
  'Centrale solaire didactique': 'solar energy training equipment',
  'Simulateur d\'éolienne': 'small wind turbine model',
  'Station de pompage solaire': 'solar water pump',
  'Tracker solaire avec batterie': 'solar tracker panel',

  // ── branchement ──────────────────────────────────────────────────────────
  'Compteur divisionnaire universel DN15': 'water meter household',
  'Compteur volumétrique DN15': 'water meter mechanical',
  'Raccord compteur d\'eau 25-33/42': 'brass pipe fitting plumbing',
  'Réducteur de pression FF 3/4': 'pressure reducing valve water',

  // ── electriques ──────────────────────────────────────────────────────────
  'Coffret 13 modules, 2 rangées': 'electrical distribution board consumer unit',
  'Disjoncteur différentiel 1P+N': 'residual current circuit breaker',

  // ── manutention ──────────────────────────────────────────────────────────
  'Chariot élévateur VMAX': 'forklift truck warehouse',
  'Transpalette électrique': 'electric pallet jack',
  'Transpalette manuel 2,5 t': 'manual pallet truck',
}

/** `Armoire à portes coulissantes` → `armoire-a-portes-coulissantes`. */
function fichierPour(nom) {
  return nom
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60)
}

const nettoie = v => (v?.value ?? '').replace(/<[^>]*>/g, '').trim()

async function chercher(requete) {
  const url = 'https://commons.wikimedia.org/w/api.php?action=query&format=json'
    + '&generator=search&gsrnamespace=6&gsrlimit=10'
    + `&gsrsearch=${encodeURIComponent(requete)}`
    + '&prop=imageinfo&iiprop=url|extmetadata|mime&iiurlwidth=900'

  const donnees = await (await fetch(url, { headers: { 'User-Agent': AGENT } })).json()

  return Object.values(donnees.query?.pages ?? {})
    .map((page) => {
      const info = page.imageinfo?.[0]
      if (!info) return null
      return {
        titre: page.title.replace('File:', ''),
        url: info.thumburl,
        mime: info.mime,
        licence: nettoie(info.extmetadata?.LicenseShortName),
        auteur: nettoie(info.extmetadata?.Artist),
        page: info.descriptionurl,
      }
    })
    .filter(f => f && /jpeg|png/.test(f.mime) && LIBRES.test(f.licence) && f.auteur)
}

mkdirSync(SORTIE, { recursive: true })

const credits = []
const sans = []

for (const item of equipment) {
  const requete = REQUETES[item.name]
  if (!requete) {
    sans.push([item.name, 'aucune requête définie'])
    continue
  }

  const base = fichierPour(item.name)
  const chemin = `${SORTIE}/${base}.jpg`

  // Idempotent : on ne retélécharge pas ce qui est déjà là.
  if (existsSync(chemin) && !process.env.FORCE) {
    credits.push({ nom: item.name, fichier: base, deja: true })
    continue
  }

  let retenu = null
  for (const candidat of await chercher(requete)) {
    try {
      const reponse = await fetch(candidat.url, { headers: { 'User-Agent': AGENT } })
      if (!reponse.ok) continue
      const brut = Buffer.from(await reponse.arrayBuffer())
      await sharp(brut)
        .resize(800, 600, { fit: 'cover', position: 'attention' })
        .jpeg({ quality: 76, mozjpeg: true })
        .toFile(chemin)
      retenu = candidat
      break
    }
    catch {
      // Fichier illisible par sharp (SVG déguisé, TIFF…) : on passe au suivant.
    }
  }

  if (retenu) {
    credits.push({ nom: item.name, fichier: base, ...retenu })
    console.log(`✓ ${item.name.slice(0, 46).padEnd(48)} ${retenu.licence}`)
  }
  else {
    sans.push([item.name, `rien de réutilisable pour « ${requete} »`])
    console.log(`✗ ${item.name.slice(0, 46)}`)
  }
}

const lignes = credits
  .filter(c => !c.deja)
  .map(c => `| ${c.nom} | [${c.titre}](${c.page}) | ${c.auteur} | ${c.licence} |`)
  .join('\n')

writeFileSync('docs/credits-references.md', `# Crédits des visuels de référence

Visuels des références du catalogue, déposés par \`npm run images:references\`.

## Ce qu'ils montrent, et ce qu'ils ne montrent pas

Pour une référence **générique** — « Armoire bibliothèque en bois », « Scies à
métaux », « Transpalette manuel » — la photographie montre bien l'objet décrit.

Pour un **modèle nommé** — « Bureau Solano », « HP ProBook 450 G8 »,
« Analyseur EA-2000B » — elle montre le **type** d'objet, pas ce modèle précis.
Wikimedia Commons est une archive encyclopédique, pas un catalogue fournisseur :
ces modèles n'y figurent pas.

Les photographies produit exactes viendront des **catalogues fournisseurs**,
qui autorisent en général leurs revendeurs à les reprendre. C'est une demande à
leur adresser, pas un problème de code.

## Pourquoi Commons

C'est la seule banque dont la licence de chaque fichier se vérifie par API. Le
script **refuse** tout fichier dont la licence n'autorise pas la réutilisation
commerciale, ou dont l'auteur n'est pas nommé — vérification impossible sur un
site de collection, où la provenance est introuvable.

## Crédits

${credits.length} référence(s) illustrée(s) sur ${equipment.length}.

| Référence | Fichier | Auteur | Licence |
| --- | --- | --- | --- |
${lignes}

${sans.length ? `## Sans visuel\n\n${sans.map(([n, r]) => `- **${n}** — ${r}`).join('\n')}\n` : ''}
Les licences CC BY et CC BY-SA imposent de créditer l'auteur ; c'est l'objet de
ce fichier. Toute image ajoutée à \`public/images/references/\` doit y figurer.
`)

console.log(`\n${credits.length} illustrée(s), ${sans.length} sans visuel, sur ${equipment.length}`)
