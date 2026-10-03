/**
 * Rassemble les migrations Drizzle en **un seul fichier SQL** à coller dans
 * la console d'un hébergeur Postgres.
 *
 * `npm run db:migrate` reste la voie normale, et ce script ne la remplace
 * pas. Il existe pour le cas où la base n'est joignable que par une console
 * web — l'éditeur SQL de Neon ou de Supabase — parce que la machine qui tient
 * le dépôt n'a pas d'accès réseau vers elle. C'était exactement la situation
 * à la mise en service : le conteneur d'où le site est développé ne peut
 * ouvrir ni le port 5432 ni l'API de l'hébergeur.
 *
 * **Le journal est écrit avec le schéma.** C'est tout l'intérêt du script :
 * poser les tables à la main sans renseigner `drizzle.__drizzle_migrations`
 * laisse la base dans un état que `db:migrate` croit vierge, et le prochain
 * appel rejoue les huit migrations sur des tables qui existent déjà — il
 * échoue, et on ne comprend pas pourquoi. Les lignes du journal sont donc
 * calculées ici exactement comme le fait `drizzle-orm` : sha256 du contenu
 * **brut** de chaque fichier, et `created_at` repris du journal.
 *
 * Tout part dans une seule transaction : un copier-coller interrompu ne
 * laisse pas une demi-base.
 *
 *   node scripts/schema-sql.mjs > schema.sql
 */
import { createHash } from 'node:crypto'
import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const MIGRATIONS = join(dirname(fileURLToPath(import.meta.url)), '../server/database/migrations')

const journal = JSON.parse(readFileSync(join(MIGRATIONS, 'meta/_journal.json'), 'utf8'))

/** Échappement d'un littéral SQL — les hachages sont hexadécimaux, mais on ne parie pas dessus. */
const litteral = valeur => `'${String(valeur).replace(/'/g, '\'\'')}'`

const morceaux = [
  '-- ───────────────────────────────────────────────────────────────────────',
  '-- TBS Distribution — schéma initial',
  '--',
  `-- Engendré par \`node scripts/schema-sql.mjs\` depuis les ${journal.entries.length} migrations`,
  '-- Drizzle du dépôt. Ne pas modifier à la main : regénérer.',
  '--',
  '-- À coller tel quel dans l\'éditeur SQL de l\'hébergeur. Le bloc inscrit',
  '-- aussi le journal des migrations, pour que `npm run db:migrate` voie',
  '-- ensuite une base à jour plutôt qu\'une base vierge.',
  '-- ───────────────────────────────────────────────────────────────────────',
  '',
  'BEGIN;',
  '',
  'CREATE SCHEMA IF NOT EXISTS "drizzle";',
  'CREATE TABLE IF NOT EXISTS "drizzle"."__drizzle_migrations" (',
  '\tid SERIAL PRIMARY KEY,',
  '\thash text NOT NULL,',
  '\tcreated_at bigint',
  ');',
  '',
]

for (const entree of journal.entries) {
  const brut = readFileSync(join(MIGRATIONS, `${entree.tag}.sql`), 'utf8')
  const hash = createHash('sha256').update(brut).digest('hex')

  // `--> statement-breakpoint` sépare les instructions pour le migrateur, qui
  // les envoie une par une ; un client SQL ordinaire lit le point-virgule.
  const sql = brut.split('--> statement-breakpoint').join('').trim()

  morceaux.push(
    `-- ── ${entree.tag} ${'─'.repeat(Math.max(0, 64 - entree.tag.length))}`,
    sql ? `${sql}\n` : '-- (migration vide — aucun changement de schéma)\n',
    'INSERT INTO "drizzle"."__drizzle_migrations" ("hash", "created_at")',
    `SELECT ${litteral(hash)}, ${entree.when}`,
    'WHERE NOT EXISTS (',
    `\tSELECT 1 FROM "drizzle"."__drizzle_migrations" WHERE "hash" = ${litteral(hash)}`,
    ');',
    '',
  )
}

morceaux.push('COMMIT;', '')

process.stdout.write(morceaux.join('\n'))
