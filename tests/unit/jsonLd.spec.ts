import { describe, expect, it } from 'vitest'
import { serialiserJsonLd } from '#shared/utils/jsonLd'

/**
 * Le JSON-LD voyage dans le corps d'un `<script type="application/ld+json">`.
 * Un `<` non échappé y ferme la balise : ce que le `FAQPage` tire de la base
 * — éditable sans redéploiement — deviendrait du balisage exécuté.
 */
describe('sérialisation JSON-LD', () => {
  it('échappe `<`, pour qu\'une chaîne ne puisse pas fermer la balise', () => {
    const sortie = serialiserJsonLd({ reponse: 'Voir </script><img src=x onerror=alert(1)>' })

    expect(sortie).not.toContain('</script>')
    expect(sortie).not.toContain('<img')
    expect(sortie).toContain('\\u003c')
  })

  it('n\'échappe pas que le premier `<`', () => {
    const sortie = serialiserJsonLd(['<a>', '<b>', '<c>'])

    expect(sortie).not.toContain('<')
    expect(sortie.match(/\\u003c/g)).toHaveLength(3)
  })

  it('échappe aussi dans les clés, pas seulement dans les valeurs', () => {
    const sortie = serialiserJsonLd({ '</script>': 'valeur' })

    expect(sortie).not.toContain('</script>')
  })

  it('reste du JSON valide, et de mêmes données', () => {
    const donnees = {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      'mainEntity': [
        { question: 'Livrez-vous hors de Lomé ?', answer: 'Oui — voir <conditions>.' },
      ],
    }

    expect(JSON.parse(serialiserJsonLd(donnees))).toEqual(donnees)
  })

  it('laisse intact ce qui n\'a pas besoin d\'être échappé', () => {
    const donnees = { nom: 'TBS Distribution S.A.R.L', ville: 'Agôè-Démakpoè, Lomé' }

    expect(serialiserJsonLd(donnees)).toBe(JSON.stringify(donnees))
  })
})
