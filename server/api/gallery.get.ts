import { getGalleryItems } from '../utils/repository'
import type { GalleryCategory } from '../../shared/types'

const CATEGORIES: GalleryCategory[] = [
  'mariage',
  'ceremonie',
  'corporate',
  'decor',
  'fourniture',
]

export default defineEventHandler(async (event) => {
  const { category } = getQuery(event)
  const { data, source } = await getGalleryItems()

  // Le filtre est appliqué ici plutôt qu'en SQL : le jeu tient en mémoire et
  // la réponse complète reste cachable pour la vue « Tout voir ».
  if (typeof category === 'string' && CATEGORIES.includes(category as GalleryCategory)) {
    return { data: data.filter((i) => i.category === category), source }
  }

  return { data, source }
})
