/**
 * Validation d'une demande de devis.
 *
 * Le schéma et les deux gardes anti-robots vivent ici plutôt que dans le
 * gestionnaire : ce sont les règles que le formulaire doit respecter, et elles
 * s'éprouvent seules — sans serveur, sans base, sans requête à fabriquer.
 * `server/api/quotes.post.ts` n'a plus qu'à les appliquer.
 */
import { z } from 'zod'

/**
 * Délai minimum entre l'affichage du formulaire et son envoi. Un humain ne
 * remplit pas neuf champs en deux secondes ; un robot, si.
 */
export const MIN_FILL_MS = 2000

export const quoteSchema = z.object({
  name: z.string().trim().min(2, 'Nom trop court').max(160),
  phone: z
    .string()
    .trim()
    .min(6, 'Numéro invalide')
    .max(40)
    .regex(/^[\d\s+().-]+$/, 'Numéro invalide'),
  email: z.string().trim().email('E-mail invalide').max(200).optional().or(z.literal('')),
  branch: z.string().trim().min(1).max(120),
  requestType: z.string().trim().min(1).max(120),
  eventDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Date invalide')
    .optional()
    .or(z.literal('')),
  guestCount: z.coerce.number().int().min(0).max(100_000).optional(),
  location: z.string().trim().max(200).optional().or(z.literal('')),
  message: z.string().trim().min(5, 'Précisez votre besoin').max(4000),
  /**
   * Champ piège : invisible pour l'utilisateur, attirant pour les robots.
   * Accepté tel quel — c'est `looksAutomated` qui rejette, en silence. Une
   * contrainte de schéma (`max(0)`) renverrait une 422 nommant `company` dans
   * le corps de la réponse, ce qui désignerait le piège à l'attaquant. Le
   * plafond reste large mais fini : le champ ne sert pas de soute.
   */
  company: z.string().max(200).optional(),
  /** Millisecondes écoulées entre l'affichage et l'envoi du formulaire. */
  elapsedMs: z.coerce.number().min(0).optional(),
})

export type QuotePayload = z.infer<typeof quoteSchema>

/** Piège rempli, ou formulaire envoyé trop vite. */
export function looksAutomated(payload: Pick<QuotePayload, 'company' | 'elapsedMs'>): boolean {
  if (payload.company) return true
  return payload.elapsedMs !== undefined && payload.elapsedMs < MIN_FILL_MS
}

/**
 * Erreurs Zod au format compact `{ champ: message }` qu'attend le formulaire.
 */
export function formatIssues(error: z.ZodError): Record<string, string> {
  return Object.fromEntries(error.issues.map(i => [i.path.join('.'), i.message]))
}
