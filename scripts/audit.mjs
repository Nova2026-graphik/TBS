/**
 * Audit de sécurité des dépendances, avec dérogations nommées et datées.
 *
 * `npm audit --audit-level=high --omit=dev` est le bon contrôle, mais il n'a
 * aucun moyen d'écarter un avis précis. Or il en reste un que **rien ne peut
 * corriger** : le `zod` 3 que `@nuxt/content` emploie à la construction. La
 * dernière version du moteur de contenu exige toujours zod 3, et l'avis vise
 * toute cette lignée ; `npm audit` propose `@nuxt/content@2.13.4` — une
 * rétrogradation majeure pour un paquet que la production n'exécute pas. Le
 * remède serait pire que le mal.
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
    avis: 'GHSA-mrhx-c7xc-m3w5',
    paquet: 'zod',
    motif: 'Atteint par @nuxt/content → zod 3.25, appelé par `module.mjs` — '
      + 'donc **à la construction seulement**, pour traduire les schémas de '
      + '`content.config.ts`. Vérifié le 16 novembre 2026 : le seul zod de '
      + '`.output` est le 4.6.7 des dépendances directes, qui valide les '
      + 'formulaires et se trouve hors de la plage visée (< 4.6.6). Les '
      + 'schémas confiés à zod 3 viennent du dépôt, pas d\'une requête : il '
      + 'n\'y a pas d\'entrée par où pousser la collection surdimensionnée que '
      + 'l\'avis décrit.',
    leve: 'Aucun correctif dans la lignée 3 : l\'avis vise tout ce qui précède '
      + 'zod 4.6.6, et @nuxt/content 3.16.2, la dernière version, exige '
      + 'zod ^3.25.76 ; npm ne propose qu\'une rétrogradation en 2.13.4. À '
      + 'retirer dès que @nuxt/content passe à zod 4.',
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
