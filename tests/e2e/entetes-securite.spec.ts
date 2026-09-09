import { expect, test } from '@playwright/test'

/**
 * En-têtes de sécurité sur les documents.
 *
 * L'issue #1 les avait posés dans un plugin Nitro, et le contrôle s'était
 * arrêté là. En production, mesure faite : les routes `/api/**` les portaient
 * toutes, les pages HTML n'en portaient aucune — elles sont pré-rendues au
 * build et servies par le CDN, sans jamais traverser Nitro.
 *
 * Rien ne l'avait vu parce que rien ne regardait les en-têtes d'une réponse.
 * C'est ce que fait ce parcours.
 */
const ATTENDUS = {
  'x-content-type-options': 'nosniff',
  'referrer-policy': 'strict-origin-when-cross-origin',
  'x-frame-options': 'DENY',
  'cross-origin-opener-policy': 'same-origin',
} as const

test.describe('en-têtes de sécurité', () => {
  test('chaque page en porte le jeu complet', async ({ page }) => {
    for (const chemin of ['/', '/galerie', '/contact', '/en/']) {
      const reponse = await page.goto(chemin)
      const entetes = reponse?.headers() ?? {}

      for (const [nom, valeur] of Object.entries(ATTENDUS)) {
        expect(entetes[nom], `${chemin} → ${nom}`).toBe(valeur)
      }

      expect(entetes['permissions-policy'], chemin).toContain('geolocation=()')
      expect(entetes['strict-transport-security'], chemin).toContain('max-age=')
    }
  })

  test('la politique de contenu accompagne les documents', async ({ page }) => {
    const reponse = await page.goto('/')
    const csp = reponse?.headers()['content-security-policy-report-only']
      ?? reponse?.headers()['content-security-policy']

    expect(csp).toBeTruthy()
    // Le cadrage est interdit deux fois : par en-tête et par directive.
    expect(csp).toContain('frame-ancestors \'none\'')
    expect(csp).toContain('object-src \'none\'')
    // La carte de la page contact est la seule origine tierce encadrable.
    expect(csp).toContain('frame-src https://www.openstreetmap.org')
  })

  test('les images gardent leur cache et leurs protections', async ({ page }) => {
    const reponse = await page.goto('/images/hero-reception.jpg')
    const entetes = reponse?.headers() ?? {}

    expect(entetes['x-content-type-options']).toBe('nosniff')
    expect(entetes['cache-control']).toContain('max-age=')

    // La CSP, elle, n'est pas vérifiée ici : les deux runtimes ne traitent pas
    // les règles de la même façon. Nitro les **fusionne** — une image reçoit
    // donc aussi celles de `/**` — quand la table de routage de Vercel
    // **s'arrête** à la première qui correspond. Ce parcours tourne sur Nitro ;
    // le comportement Vercel se lit dans `.vercel/output/config.json`, et c'est
    // là qu'il a été vérifié. Dans les deux cas un navigateur ignore une CSP
    // servie avec une image : la divergence est sans effet.
  })
})
