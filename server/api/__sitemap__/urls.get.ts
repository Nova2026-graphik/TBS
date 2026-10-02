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
  /**
   * Les deux langues. Le chemin stocké porte déjà son préfixe — un article de
   * `content/en/conseils/` est servi sur `/en/conseils/<slug>` —, il n'y a
   * donc rien à recomposer ici. Omettre la collection anglaise laisserait
   * sept pages hors du sitemap.
   */
  const [fr, en] = await Promise.all([
    queryCollection(event, 'conseils').order('publishedAt', 'DESC').all(),
    queryCollection(event, 'conseilsEn').order('publishedAt', 'DESC').all(),
  ])

  return [...fr, ...en].map(article => ({
    loc: article.path,
    lastmod: article.updatedAt ?? article.publishedAt,
    changefreq: 'monthly' as const,
    priority: 0.7,
    images: [{ loc: article.image, title: article.title }],
  }))
})
