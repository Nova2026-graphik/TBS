import { defineCollection, defineContentConfig, z } from '@nuxt/content'

/**
 * Rubrique Conseils, en français et en anglais.
 *
 * Les articles sont des fichiers Markdown versionnés : pas de base
 * supplémentaire à exploiter, pas d'interface d'édition à maintenir, et
 * l'historique des modifications est celui du dépôt. Pour six à dix articles
 * par an, c'est le bon compromis.
 *
 * Le schéma est strict à dessein. Un article sans `description` ou sans
 * `updatedAt` passerait inaperçu à la relecture et se retrouverait en ligne
 * avec une méta-description vide ou une date fausse — deux choses que le
 * référencement paie comptant.
 */

/**
 * Le même schéma sert les deux langues.
 *
 * `category` garde ses libellés français dans les deux collections : c'est
 * une **clé de données**, pas un texte affiché — les pages la traduisent au
 * rendu. Une énumération par langue obligerait à tenir deux listes en
 * correspondance, et le filtre cesserait de fonctionner le jour où elles
 * divergeraient.
 */
const schemaConseil = z.object({
  title: z.string(),
  /** Titre court pour les listes et le fil d'Ariane. */
  shortTitle: z.string().optional(),
  description: z.string(),
  /** Première publication. */
  publishedAt: z.string(),
  /** Dernière modification de fond — alimente `dateModified` du JSON-LD. */
  updatedAt: z.string().optional(),
  /** Rubrique affichée sur la vignette. */
  category: z.enum(['Réception', 'Équipements', 'Appels d’offres', 'Agro']),
  /** Durée de lecture en minutes, annoncée avant le clic. */
  readingTime: z.number(),
  image: z.string(),
  imageAlt: z.string(),
  /** Mise en avant sur l'accueil de la rubrique. */
  featured: z.boolean().default(false),
  /**
   * L'article embarque un calculateur. Le badge « Avec calculateur » ne
   * s'affiche que sur cette donnée — pas sur le seul fait d'être à la une.
   */
  calculator: z.boolean().default(false),
})

export default defineContentConfig({
  collections: {
    conseils: defineCollection({
      type: 'page',
      source: 'conseils/*.md',
      schema: schemaConseil,
    }),

    /**
     * Version anglaise.
     *
     * `type: 'page'` tire le chemin du fichier : un article de
     * `content/en/conseils/` est servi sur `/en/conseils/<slug>`, exactement
     * la route que produit `prefix_except_default`.
     *
     * Le nom de fichier est **le même** dans les deux langues. Le segment
     * d'URL reste donc français côté anglais — comme `/en/a-propos` et
     * `/en/galerie`, déjà en place : c'est la convention du site, et elle
     * garde les deux versions appariées par leur nom de fichier.
     */
    conseilsEn: defineCollection({
      type: 'page',
      source: 'en/conseils/*.md',
      schema: schemaConseil,
    }),
  },
})
