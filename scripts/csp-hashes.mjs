/**
 * Relève les empreintes CSP des scripts en ligne des pages pré-rendues.
 *
 *   npm run build
 *   npm run security:csp-hashes
 *
 * Nuxt sérialise `window.__NUXT__.config` et la carte d'imports directement
 * dans le HTML : sans leur empreinte, une CSP bloquante coupe l'hydratation.
 * Le résultat se colle dans `NUXT_SECURITY_CSP_SCRIPT_HASHES`, et se régénère
 * à chaque build puisque le contenu change avec la configuration publique.
 */
import { createHash } from 'node:crypto'
import { readFile, readdir } from 'node:fs/promises'
import { join, relative } from 'node:path'
import process from 'node:process'

const PUBLIC_DIR = '.output/public'

/** Types de `<script>` que le navigateur exécute — les seuls soumis à `script-src`. */
const EXECUTABLE_TYPES = new Set(['', 'module', 'importmap', 'text/javascript', 'application/javascript'])

const INLINE_SCRIPT = /<script([^>]*)>([\s\S]*?)<\/script>/gi
const EVENT_HANDLER = /\s(on[a-z]+)="([^"]*)"/gi

function sha256(source) {
  return `sha256-${createHash('sha256').update(source, 'utf8').digest('base64')}`
}

/** Les attributs HTML arrivent encodés ; le navigateur hache la valeur décodée. */
function decodeEntities(value) {
  return value
    .replaceAll('&#39;', "'")
    .replaceAll('&quot;', '"')
    .replaceAll('&lt;', '<')
    .replaceAll('&gt;', '>')
    .replaceAll('&amp;', '&')
}

async function htmlFiles(dir) {
  const found = []
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name)
    if (entry.isDirectory()) found.push(...(await htmlFiles(path)))
    else if (entry.name.endsWith('.html')) found.push(path)
  }
  return found
}

const pages = await htmlFiles(PUBLIC_DIR).catch(() => {
  console.error(`Aucun rendu trouvé dans ${PUBLIC_DIR}. Lancez d'abord : npm run build`)
  process.exit(1)
})

/** empreinte → pages où le script apparaît. */
const scripts = new Map()
const handlers = new Map()

for (const page of pages) {
  const html = await readFile(page, 'utf8')
  const name = relative(PUBLIC_DIR, page)

  for (const [, attributes, body] of html.matchAll(INLINE_SCRIPT)) {
    if (/\ssrc=/i.test(attributes)) continue
    const type = (attributes.match(/\stype="([^"]*)"/i)?.[1] ?? '').toLowerCase()
    if (!EXECUTABLE_TYPES.has(type)) continue
    const hash = sha256(body)
    scripts.set(hash, [...(scripts.get(hash) ?? []), name])
  }

  for (const [, attribute, value] of html.matchAll(EVENT_HANDLER)) {
    const hash = sha256(decodeEntities(value))
    handlers.set(hash, [...new Set([...(handlers.get(hash) ?? []), attribute])])
  }
}

console.log(`${pages.length} page(s) analysée(s) dans ${PUBLIC_DIR}\n`)

console.log('Scripts en ligne :')
for (const [hash, found] of scripts) console.log(`  ${hash}  (${found.length} page(s))`)

console.log('\nÀ reporter dans .env :')
console.log(`NUXT_SECURITY_CSP_SCRIPT_HASHES=${[...scripts.keys()].join(',')}`)

if (handlers.size) {
  console.log('\nAttributs gestionnaires d\'événements (script-src-attr, déjà couverts')
  console.log('par securityHeaders.ts — à mettre à jour si une empreinte diffère) :')
  for (const [hash, attributes] of handlers) console.log(`  ${hash}  ${attributes.join(', ')}`)
}
