/**
 * Audit de sécurité des dépendances, avec dérogations nommées et datées.
 *
 * `npm audit --audit-level=high --omit=dev` est le bon contrôle, mais il n'a
 * aucun moyen d'écarter un avis précis. Or il en reste un que **rien ne peut
 * corriger** : `node-forge` est en 1.4.0, la dernière version publiée, et
 * l'avis la vise toujours. `npm audit` propose `nuxt@3.15.1` — une
 * rétrogradation majeure du cadriciel pour un paquet que la production
 * n'exécute pas. Le remède serait pire que le mal.
 *
 * Sans dérogation, l'étape échoue à chaque exécution et on prend l'habitude
 * de la lire en diagonale ; c'est ainsi qu'un vrai avis passe inaperçu. Avec
 * une dérogation muette, l'exception survit à son motif. D'où la forme
 * retenue, la même que celle qu'avait prise la dérogation de `typecheck` :
 *
 *   - tout avis `high` ou `critical` hors liste **échoue** ;
 *   - une dérogation dont l'avis **a disparu** échoue aussi, et demande sa
 *     propre suppression.
 *
 * L'exception se périme donc d'elle-même le jour où l'amont corrige.
 *
 *   node scripts/audit.mjs
 */
import { spawnSync } from 'node:child_process'
import process from 'node:process'

/** Gravités qui bloquent. `moderate` et en dessous sont signalées, pas bloquantes. */
const BLOQUANTES = new Set(['high', 'critical'])

/**
 * Avis connus, examinés, et acceptés — avec le motif qui les justifie.
 *
 * Y ajouter une entrée est une décision, pas une formalité : il faut pouvoir
 * écrire pourquoi l'avis ne touche pas la production, et ce qu'on attend pour
 * le lever.
 */
const DEROGATIONS = [
  {
    avis: 'GHSA-86w9-cpqp-85rv',
    paquet: 'node-forge',
    motif: 'Atteint par nuxt → @nuxt/cli → listhen, qui ne sert qu\'au serveur '
      + 'de développement (certificat auto-signé de `nuxt dev --https`). Absent '
      + 'de `.output`, donc jamais exécuté en production.',
    leve: 'Aucun correctif amont : 1.4.0 est la dernière version publiée et '
      + 'reste visée. À retirer dès qu\'une version corrigée paraît, ou que '
      + '`listhen` cesse d\'en dépendre.',
  },
]

const resultat = spawnSync('npm', ['audit', '--omit=dev', '--json'], {
  encoding: 'utf8',
  shell: process.platform === 'win32',
})

if (!resultat.stdout) {
  console.error('✗ `npm audit` n\'a rien renvoyé.')
  console.error(resultat.stderr || '(aucune sortie d\'erreur)')
  process.exit(1)
}

let rapport
try {
  rapport = JSON.parse(resultat.stdout)
}
catch {
  console.error('✗ Sortie de `npm audit` illisible :')
  console.error(resultat.stdout.slice(0, 500))
  process.exit(1)
}

/** Aplatit le rapport en une liste d'avis : un par identifiant GHSA. */
function avisDuRapport(vulnerabilities = {}) {
  const avis = new Map()

  for (const [paquet, entree] of Object.entries(vulnerabilities)) {
    for (const via of entree.via ?? []) {
      // Une chaîne désigne un autre paquet du rapport, pas un avis.
      if (typeof via !== 'object') continue

      const identifiant = (via.url ?? '').split('/').pop()
      if (!identifiant) continue

      avis.set(identifiant, {
        identifiant,
        paquet,
        gravite: via.severity,
        titre: via.title,
        url: via.url,
      })
    }
  }

  return [...avis.values()]
}

const avis = avisDuRapport(rapport.vulnerabilities)
const derogees = new Set(DEROGATIONS.map(d => d.avis))

const bloquants = avis.filter(a => BLOQUANTES.has(a.gravite) && !derogees.has(a.identifiant))
const signales = avis.filter(a => !BLOQUANTES.has(a.gravite) && !derogees.has(a.identifiant))
const perimees = DEROGATIONS.filter(d => !avis.some(a => a.identifiant === d.avis))
const actives = DEROGATIONS.filter(d => avis.some(a => a.identifiant === d.avis))

for (const d of actives) {
  console.log(`○ ${d.paquet} — ${d.avis} : dérogation active`)
  console.log(`  ${d.motif}`)
}

for (const a of signales) {
  console.log(`· ${a.paquet} — ${a.gravite} : ${a.titre}`)
}

for (const a of bloquants) {
  console.log(`✗ ${a.paquet} — ${a.gravite} : ${a.titre}`)
  console.log(`  ${a.url}`)
}

for (const d of perimees) {
  console.log(`✖ L'avis ${d.avis} (${d.paquet}) n'apparaît plus.`)
  console.log('  Supprimez sa dérogation en tête de scripts/audit.mjs.')
}

console.log()

if (bloquants.length) {
  const s = bloquants.length > 1 ? 'x' : ''
  console.error(`✗ ${bloquants.length} avis bloquant${s} hors dérogation.`)
  process.exit(1)
}

if (perimees.length) {
  console.error('✗ Dérogation périmée : son motif a disparu.')
  process.exit(1)
}

const detail = [
  `${actives.length} dérogation${actives.length > 1 ? 's' : ''}`,
  `${signales.length} avis non bloquant${signales.length > 1 ? 's' : ''}`,
].join(', ')

console.log(`✔ Aucun avis bloquant (${detail}).`)
