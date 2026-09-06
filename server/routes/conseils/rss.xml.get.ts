/**
 * Flux RSS de la rubrique Conseils.
 *
 * Un flux coûte trente lignes et rend deux services : il permet à un lecteur
 * fidèle de suivre sans revenir, et il donne aux agrégateurs professionnels —
 * ceux que lisent les acheteurs institutionnels — une prise sur le contenu.
 *
 * Le flux est servi dynamiquement plutôt que pré-rendu : il se régénère à
 * chaque publication sans dépendre d'une étape de build.
 */
import { queryCollection } from '@nuxt/content/server'

function echapper(valeur: string | null | undefined): string {
  return String(valeur ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

export default defineEventHandler(async (event) => {
  const { public: cfg } = useRuntimeConfig()
  const base = cfg.siteUrl

  const tous = await queryCollection(event, 'conseils')
    .order('publishedAt', 'DESC')
    .all()

  /**
   * Une frontmatter invalide donne un document aux champs nuls. Le flux
   * l'ignore plutôt que de rendre une 500 : un article mal formé ne doit pas
   * emporter la page de tous les autres.
   */
  const articles = tous.filter(article => article.title && article.publishedAt)

  const entrees = articles.map(article => `    <item>
      <title>${echapper(article.title)}</title>
      <link>${base}${article.path}</link>
      <guid isPermaLink="true">${base}${article.path}</guid>
      <description>${echapper(article.description)}</description>
      <category>${echapper(article.category)}</category>
      <pubDate>${new Date(article.publishedAt).toUTCString()}</pubDate>
    </item>`).join('\n')

  setHeader(event, 'content-type', 'application/rss+xml; charset=utf-8')
  setHeader(event, 'cache-control', 'public, max-age=3600')

  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>Conseils — ${echapper(cfg.siteName)}</title>
    <link>${base}/conseils</link>
    <description>Repères chiffrés pour organiser, équiper et chiffrer : réception, équipements, appels d'offres et agro-industrie au Togo.</description>
    <language>fr</language>
    <atom:link href="${base}/conseils/rss.xml" rel="self" type="application/rss+xml"/>
${entrees}
  </channel>
</rss>`
})
