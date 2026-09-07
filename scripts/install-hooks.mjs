/**
 * Installe les crochets Git versionnés du dépôt.
 *
 *   npm run hooks:install
 *
 * Concrètement : `git config core.hooksPath .githooks`. Une ligne, mais elle
 * mérite un script pour trois raisons — elle se documente ici plutôt que dans
 * un fil de discussion, elle dit ce qu'elle vient de faire, et elle explique
 * comment revenir en arrière.
 *
 * **Volontairement hors de `postinstall`.** Un `npm install` ne doit pas
 * modifier en silence la configuration Git d'un poste : c'est le genre de
 * surprise qu'on met une heure à comprendre quand un `git push` se met à
 * durer trois minutes. L'installation est donc explicite.
 */
import { spawnSync } from 'node:child_process'
import { existsSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import process from 'node:process'
import { fileURLToPath } from 'node:url'

const racine = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const dossier = '.githooks'

if (!existsSync(resolve(racine, dossier, 'pre-push'))) {
  console.error(`✖ ${dossier}/pre-push est introuvable. Êtes-vous à la racine du dépôt ?`)
  process.exit(1)
}

const resultat = spawnSync('git', ['config', 'core.hooksPath', dossier], {
  cwd: racine,
  stdio: 'inherit',
})

if (resultat.status !== 0) {
  console.error('✖ Impossible de configurer core.hooksPath.')
  process.exit(resultat.status ?? 1)
}

console.log(`
✔ Crochets installés — core.hooksPath = ${dossier}

  Avant chaque « git push », le crochet rejoue « npm run ci » : lint, types,
  tests unitaires, build et audit de sécurité. Comptez deux à trois minutes,
  l'essentiel étant le build.

  Passer outre ponctuellement :  git push --no-verify
  Désinstaller :                 git config --unset core.hooksPath
`)
