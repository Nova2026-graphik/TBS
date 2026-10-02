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

/**
 * Message des champs obligatoires absents — ou reçus dans un autre type.
 *
 * Sans lui, Zod retombe sur son texte par défaut, en anglais (« Invalid
 * input: expected string, received undefined »), et `Contact/Form.vue`
 * l'affiche tel quel sous le champ. La validation côté client couvre les
 * quatre champs qu'elle connaît, mais pas `branch`, `requestType` ni
 * `details` : le cas est rare, pas impossible.
 *
 * Chaque contrainte garde par ailleurs son propre message — `error` ne vaut
 * que pour le contrôle de type, `.min()` et consorts restent prioritaires sur
 * le leur.
 */
const OBLIGATOIRE = { error: 'Champ obligatoire' }

export const quoteSchema = z.object({
  name: z.string(OBLIGATOIRE).trim().min(2, 'Nom trop court').max(160, 'Nom trop long'),
  phone: z
    .string(OBLIGATOIRE)
    .trim()
    .min(6, 'Numéro invalide')
    .max(40, 'Numéro trop long')
    .regex(/^[\d\s+().-]+$/, 'Numéro invalide'),
  email: z
    .string()
    .trim()
    .email('E-mail invalide')
    .max(200, 'E-mail trop long')
    .optional()
    .or(z.literal('')),
  branch: z.string(OBLIGATOIRE).trim().min(1, 'Branche manquante').max(120, 'Branche inconnue'),
  requestType: z
    .string(OBLIGATOIRE)
    .trim()
    .min(1, 'Type de demande manquant')
    .max(120, 'Type de demande inconnu'),
  eventDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Date invalide')
    .optional()
    .or(z.literal('')),
  guestCount: z.coerce
    .number({ error: 'Nombre invalide' })
    .int('Nombre entier attendu')
    .min(0, 'Nombre invalide')
    .max(100_000, 'Nombre trop grand')
    .optional(),
  location: z.string().trim().max(200, 'Lieu trop long').optional().or(z.literal('')),
  message: z
    .string(OBLIGATOIRE)
    .trim()
    .min(5, 'Précisez votre besoin')
    .max(4000, 'Message trop long'),
  /**
   * Champs propres à la branche — domaine, quantités, objet de mission,
   * culture… — sous forme « libellé : valeur ». Ils sont repliés en tête du
   * message à l'enregistrement : la base et la notification ne changent pas,
   * et l'équipe lit tout au même endroit. Bornés en nombre et en longueur.
   */
  details: z
    .record(
      z.string().trim().min(1, 'Libellé vide').max(60, 'Libellé trop long'),
      z.string().trim().max(200, 'Valeur trop longue'),
    )
    .refine(d => Object.keys(d).length <= 10, 'Trop de détails')
    .optional(),
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
