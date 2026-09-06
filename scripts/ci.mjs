/**
 * Rejoue localement la vérification d'intégration continue.
 *
 * `.github/workflows/ci.yml` est correct, mais GitHub Actions ne démarre
 * aucune exécution sur ce dépôt : les 66 exécutions enregistrées, tous
 * workflows confondus, échouent au démarrage sans produire de journal. Tant
 * que ce n'est pas débloqué côté compte, ce script est le filet — il enchaîne
 * exactement les mêmes étapes que le travail `qualite`.
 *
 *   npm run ci
 *
 * S'arrête à la première étape en échec et renvoie un code non nul, pour
 * pouvoir servir de crochet `pre-push`.
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

function duration(startedAt) {
  return `${((Date.now() - startedAt) / 1000).toFixed(1)} s`
}

const results = []
let failed = null

for (const step of STEPS) {
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
