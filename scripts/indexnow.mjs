/**
 * Annonce les pages du site aux moteurs IndexNow, après chaque compilation de
 * **production**.
 *
 * IndexNow est un protocole commun à Bing, Yandex, Seznam et Naver : une seule
 * notification les prévient tous, et Bing alimente à son tour Yahoo,
 * DuckDuckGo, Ecosia et Qwant. Sans lui, ces moteurs découvrent une page
 * nouvelle au gré de leurs passages, parfois des semaines plus tard. Google
 * n'y participe pas ; pour lui, c'est la Search Console — cf. README,
 * « Référencement ».
 *
 * **Pourquoi à la compilation.** Une compilation de production, c'est une
 * mise en ligne : le seul moment où il y a quelque chose de neuf à annoncer.
 * Un envoi quotidien des mêmes adresses serait de la répétition, que le
 * protocole demande d'éviter.
 *
 * **La liste des adresses** vient des pages précalculées : elle coïncide
 * exactement avec le sitemap — vérifié : 68 pages de part et d'autre, le seul
 * écart étant `/sitemap.xml`, qui n'est qu'une redirection et qu'on écarte.
 *
 * **Le script ne fait jamais échouer la compilation.** Un moteur injoignable
 * ne doit pas empêcher une mise en ligne : tout est rattrapé, journalisé, et le
 * code de sortie reste 0.
 *
 * La clé n'est pas un secret : le protocole exige qu'elle soit publiée, à
 * `/<clé>.txt`, pour prouver que l'annonce vient bien du propriétaire du site.
 */
import { existsSync, readdirSync, statSync } from 'node:fs'
import { join, relative, sep } from 'node:path'
import process from 'node:process'
import { fileURLToPath, pathToFileURL } from 'node:url'

export const INDEXNOW_KEY = '609734aabef594d912a5b1d0d076827a'

/** Point d'entrée commun : il relaie l'annonce aux autres moteurs du protocole. */
export const INDEXNOW_ENDPOINT = 'https://api.indexnow.org/indexnow'

/** Le protocole plafonne à 10 000 adresses par envoi. */
const MAX_URLS = 10_000

/** Ce qui n'est pas une page à annoncer, même précalculé. */
function estExclu(chemin) {
  return chemin.endsWith('.xml')
    || chemin === '/admin' || chemin.startsWith('/admin/')
    || chemin === '/en/admin' || chemin.startsWith('/en/admin/')
    || chemin.startsWith('/api/')
    || chemin.startsWith('/_')
}

/**
 * Fichiers `…/index.html` relatifs au dossier statique → chemins publics.
 * `index.html` → `/`, `a-propos/index.html` → `/a-propos`.
 */
export function cheminsDepuisFichiers(fichiers) {
  const chemins = new Set()

  for (const fichier of fichiers) {
    const normalise = fichier.split(sep).join('/')
    if (normalise !== 'index.html' && !normalise.endsWith('/index.html')) continue

    const chemin = `/${normalise.slice(0, -'index.html'.length)}`.replace(/\/+$/, '') || '/'
    if (!estExclu(chemin)) chemins.add(chemin)
  }

  return [...chemins].sort()
}

/** Corps de la requête, au format attendu par le protocole. */
export function construireSoumission(chemins, origine, cle = INDEXNOW_KEY) {
  const { host, origin } = new URL(origine)
  return {
    host,
    key: cle,
    keyLocation: `${origin}/${cle}.txt`,
    urlList: chemins.slice(0, MAX_URLS).map(chemin => `${origin}${chemin}`),
  }
}

/** Tous les fichiers sous `dossier`, en chemins relatifs. */
function lister(dossier) {
  const resultats = []
  const parcourir = (courant) => {
    for (const nom of readdirSync(courant)) {
      const complet = join(courant, nom)
      if (statSync(complet).isDirectory()) parcourir(complet)
      else resultats.push(relative(dossier, complet))
    }
  }
  parcourir(dossier)
  return resultats
}

async function principal() {
  // Une prévisualisation n'est pas le site public : l'annoncer enverrait les
  // moteurs vers une adresse protégée, ou vers une version pas encore validée.
  if (process.env.VERCEL_ENV !== 'production') {
    console.info('[indexnow] compilation hors production : aucune annonce.')
    return
  }

  const racine = fileURLToPath(new URL('..', import.meta.url))
  const dossier = ['.vercel/output/static', '.output/public']
    .map(d => join(racine, d))
    .find(d => existsSync(d))

  if (!dossier) {
    console.warn('[indexnow] aucune sortie statique trouvée : rien à annoncer.')
    return
  }

  const origine = process.env.NUXT_PUBLIC_SITE_URL || 'https://www.tbstogo.com'
  const chemins = cheminsDepuisFichiers(lister(dossier))
  if (chemins.length === 0) {
    console.warn('[indexnow] aucune page précalculée : rien à annoncer.')
    return
  }

  const reponse = await fetch(INDEXNOW_ENDPOINT, {
    method: 'POST',
    headers: { 'content-type': 'application/json; charset=utf-8' },
    body: JSON.stringify(construireSoumission(chemins, origine)),
    signal: AbortSignal.timeout(10_000),
  })

  // 200 : reçu. 202 : reçu, la clé sera vérifiée plus tard — c'est le cas de
  // la toute première annonce, faite avant que le fichier de clé soit en ligne.
  if (reponse.status === 200 || reponse.status === 202) {
    console.info(`[indexnow] ${chemins.length} pages annoncées (HTTP ${reponse.status}).`)
  }
  else {
    const detail = await reponse.text().catch(() => '')
    console.warn(`[indexnow] annonce refusée (HTTP ${reponse.status}) ${detail}`.trim())
  }
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? '').href) {
  principal().catch((erreur) => {
    console.warn('[indexnow] annonce impossible :', erreur instanceof Error ? erreur.message : erreur)
  })
}
