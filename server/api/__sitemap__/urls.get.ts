/**
 * Articles de la rubrique Conseils, pour le sitemap.
 *
 * `@nuxtjs/sitemap` liste les routes pré-rendues, mais pas les pages issues
 * d'une collection de contenu : un article publié n'apparaîtrait donc pas
 * avant qu'un moteur ne l'ait découvert par un lien. Cette source lui donne
 * la liste, avec la date de dernière modification — celle qui décide si un
 * moteur revient lire ou non.
 */
import { queryCollection } from '@nuxt/content/server'

export default defineSitemapEventHandler(async (event) => {
  const articles = await queryCollection(event, 'conseils')
    .order('publishedAt', 'DESC')
    .all()

  return articles.map(article => ({
    loc: article.path,
    lastmod: article.updatedAt ?? article.publishedAt,
    changefreq: 'monthly' as const,
    priority: 0.7,
    images: [{ loc: article.image, title: article.title }],
  }))
})
