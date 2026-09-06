/**
 * Contrôle de types, avec une exception nommée.
 *
 * `nuxt typecheck` ne relève aucune erreur dans le code du projet, mais échoue
 * sur un fichier de `node_modules` : `@nuxt/image` 1.11 et les types `@unhead`
 * livrés avec Nuxt 4 ne s'accordent pas sur `NuxtPicture.vue`. Le composant
 * n'est pas utilisé ici et le build n'est pas affecté.
 *
 * Ni `skipLibCheck` ni un `exclude` de tsconfig ne couvrent ce cas :
 * `skipLibCheck` ne vaut que pour les `.d.ts`, et le composant est tiré
 * transitivement par les types de composants globaux. D'où ce filtre.
 *
 * Le principe est celui d'une dérogation qui se périme toute seule : le
 * script échoue sur **toute autre** erreur, et il échoue **aussi** le jour où
 * l'erreur tolérée disparaît — c'est alors le signal de supprimer l'exception
 * et ce script avec elle. Une exception muette qui survit à son motif est
 * exactement ce qui finit par masquer de vraies erreurs.
 */
import { spawn } from 'node:child_process'
import process from 'node:process'

/**
 * L'unique erreur tolérée. Elle est reconnue par trois éléments conjoints —
 * fichier, code, signature — et non par son numéro de ligne, qui bouge au
 * moindre correctif amont sans que le problème change.
 */
const EXCEPTION = {
  fichier: 'NuxtPicture.vue',
  code: 'error TS2537',
  signature: 'ResolvableArray<ResolvableLink>',
  motif: '@nuxt/image 1.11 contre les types @unhead de Nuxt 4 — composant inutilisé ici',
  levee: 'Mettre à jour @nuxt/image (2.x corrige la signature), puis supprimer ce script.',
}

const LIGNE_ERREUR = /error TS\d+/

function estTolérée(ligne) {
  return (
    ligne.includes(EXCEPTION.fichier)
    && ligne.includes(EXCEPTION.code)
    && ligne.includes(EXCEPTION.signature)
  )
}

const enfant = spawn('nuxt', ['typecheck'], { shell: true })

let sortie = ''

for (const flux of [enfant.stdout, enfant.stderr]) {
  flux.on('data', (morceau) => {
    const texte = String(morceau)
    sortie += texte
    // La sortie reste intégralement visible : le filtre porte sur le verdict,
    // pas sur ce qu'on donne à lire.
    process.stderr.write(texte)
  })
}

enfant.on('close', () => {
  const erreurs = sortie.split(/\r?\n/).filter(ligne => LIGNE_ERREUR.test(ligne))
  const tolérées = erreurs.filter(estTolérée)
  const bloquantes = erreurs.filter(ligne => !estTolérée(ligne))

  if (bloquantes.length) {
    console.error(`\n✖ ${bloquantes.length} erreur(s) de type dans le projet :\n`)
    for (const ligne of bloquantes) console.error(`  ${ligne.trim()}`)
    process.exit(1)
  }

  if (!tolérées.length) {
    console.error(
      '\n✖ L\'exception tolérée par scripts/typecheck.mjs n\'apparaît plus.\n'
      + `  ${EXCEPTION.levee}\n`
      + '  Supprimez l\'exception et rendez `typecheck` à `nuxt typecheck`.\n',
    )
    process.exit(1)
  }

  console.error(
    `\n✔ Aucune erreur de type dans le projet.\n`
    + `  1 exception tolérée : ${EXCEPTION.fichier} — ${EXCEPTION.motif}\n`
    + `  Levée : ${EXCEPTION.levee}\n`,
  )
  process.exit(0)
})
