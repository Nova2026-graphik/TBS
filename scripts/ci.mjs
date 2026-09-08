/**
 * Rejoue localement la vérification d'intégration continue.
 *
 * `.github/workflows/ci.yml` est correct, mais aucun travail ne s'exécute sur
 * ce dépôt : les exécutions sont bien créées, puis rendent `failure` en une ou
 * deux secondes sans enregistrer une seule étape. Un workflow ne contenant
 * qu'un `echo` échoue de la même façon — la cause est au niveau du compte, pas
 * du fichier. Voir le README, section « Intégration continue ». Tant que ce
 * n'est pas débloqué, ce script est le filet.
 *
 *   npm run ci                # le travail `qualite`
 *   npm run ci -- --parcours  # et les parcours Playwright par-dessus
 *
 * S'arrête à la première étape en échec et renvoie un code non nul, pour
 * pouvoir servir de crochet `pre-push`. Les parcours restent hors du chemin
 * par défaut : ils demandent un navigateur installé et doublent l'attente,
 * ce qui n'est pas un prix à payer à chaque envoi.
 */
import { spawnSync } from 'node:child_process'
import process from 'node:process'

/**
 * Étapes du travail `qualite`, dans l'ordre du workflow.
 *
 * Commandes en une seule chaîne, passées au shell : ce sont des constantes du
 * dépôt, aucune entrée extérieure n'y entre, et Node déprécie la combinaison
 * `shell: true` avec un tableau d'arguments.
 */
const STEPS = [
  { name: 'Lint', command: 'npm run lint' },
  { name: 'Types', command: 'npm run typecheck' },
  { name: 'Tests unitaires', command: 'npm run test' },
  { name: 'Build', command: 'npm run build' },
  { name: 'Audit de sécurité', command: 'npm audit --audit-level=high --omit=dev' },
]

/** Le travail `parcours` du workflow, joué seulement sur demande. */
const PARCOURS = { name: 'Parcours', command: 'npm run test:e2e' }

const steps = process.argv.includes('--parcours') ? [...STEPS, PARCOURS] : STEPS

function duration(startedAt) {
  return `${((Date.now() - startedAt) / 1000).toFixed(1)} s`
}

const results = []
let failed = null

for (const step of steps) {
  const startedAt = Date.now()
  process.stdout.write(`\n── ${step.name} ${'─'.repeat(Math.max(4, 60 - step.name.length))}\n`)

  const run = spawnSync(step.command, { stdio: 'inherit', shell: true })
  const ok = run.status === 0
  results.push({ name: step.name, ok, took: duration(startedAt) })

  if (!ok) {
    failed = step.name
    break
  }
}

console.log(`\n${'═'.repeat(64)}`)
for (const { name, ok, took } of results) {
  console.log(`  ${ok ? '✓' : '✗'} ${name.padEnd(20)} ${took}`)
}

if (failed) {
  console.log(`\n✗ Échec à l'étape « ${failed} ».`)
  process.exit(1)
}

console.log('\n✔ Toutes les vérifications passent.')
