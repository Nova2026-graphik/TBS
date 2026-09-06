import { defineCollection, defineContentConfig, z } from '@nuxt/content'

/**
 * Rubrique Conseils.
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
export default defineContentConfig({
  collections: {
    conseils: defineCollection({
      type: 'page',
      source: 'conseils/*.md',
      schema: z.object({
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
      }),
    }),
  },
})
