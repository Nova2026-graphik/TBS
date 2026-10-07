import { readFileSync, readdirSync, statSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { messageErreurServeur } from '../../app/utils/messageErreur'

/** Tous les fichiers `.ts` sous un dossier, récursivement. */
function fichiersTs(dossier: string): string[] {
  return readdirSync(dossier).flatMap((nom) => {
    const chemin = join(dossier, nom)
    if (statSync(chemin).isDirectory()) return fichiersTs(chemin)
    return chemin.endsWith('.ts') ? [chemin] : []
  })
}

/**
 * Le formulaire de devis et l'espace /admin affichent tels quels les messages
 * d'erreur du serveur — « Trop de demandes… », « Mot de passe incorrect ».
 * Lus au mauvais endroit, ils disparaissent au profit d'un texte générique.
 */
describe('messageErreurServeur', () => {
  it('lit le message renvoyé par la route', () => {
    const erreur = { data: { statusCode: 401, message: 'Session expirée' } }
    expect(messageErreurServeur(erreur)).toBe('Session expirée')
  })

  it('écarte le libellé générique de Nitro', () => {
    expect(messageErreurServeur({ data: { message: 'Server Error' } })).toBeUndefined()
  })

  it('ne lève rien sur une erreur sans corps JSON', () => {
    expect(messageErreurServeur(new TypeError('Failed to fetch'))).toBeUndefined()
    expect(messageErreurServeur({ data: '<html>504</html>' })).toBeUndefined()
    expect(messageErreurServeur(null)).toBeUndefined()
    expect(messageErreurServeur({ data: { message: '   ' } })).toBeUndefined()
  })
})

/**
 * `statusMessage` finit dans la ligne de statut HTTP, limitée à l'ASCII : h3
 * journalise un avertissement à chaque accent, et en retirera bientôt les
 * caractères. Les routes passent leurs explications par `message`.
 */
describe('erreurs des routes serveur', () => {
  it('n\'utilisent pas statusMessage', () => {
    const fautifs = fichiersTs(join(__dirname, '../../server'))
      .filter(fichier => /statusMessage\s*:/.test(readFileSync(fichier, 'utf8')))
    expect(fautifs).toEqual([])
  })
})
