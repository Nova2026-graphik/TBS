# TBS Distribution S.A.R.L — site vitrine

Site vitrine six pages pour TBS Distribution (Agôè-Démakpoè, Lomé — Togo),
réalisé en **Nuxt 4 + TypeScript**, à partir de la maquette
`TBS Site 6 Pages - offline2.html`.

Quatre branches : **TBS Équipements**, **TBS Events**,
**TBS Études & Conseils**, **TBS Agro**.

---

## Démarrage

```bash
npm install
npm run dev
```

Le site tourne sur <http://localhost:3000> **sans base de données** : le
contenu éditorial est servi depuis `server/data/content.ts`. La base n'est
nécessaire que pour éditer le contenu sans redéployer et pour enregistrer les
demandes de devis.

---

## Base de données recommandée : PostgreSQL (Supabase) + Drizzle ORM

### Pourquoi ce choix

| Besoin du projet | Ce que PostgreSQL apporte |
| --- | --- |
| Contenu structuré et relationnel (branches → prestations → réalisations) | Clés étrangères, `enum` natifs, index composites |
| Demandes de devis à conserver et suivre | Écritures transactionnelles, `uuid`, horodatage avec fuseau |
| Édition du contenu sans redéploiement | Une table par bloc éditorial, éditable depuis le studio |
| Équipe non technique à Lomé | Supabase fournit un back-office web prêt à l'emploi |
| Budget maîtrisé | Offre gratuite suffisante pour un site vitrine |
| Sauvegardes et export | `pg_dump` standard, aucune dépendance propriétaire |

**Supabase** est l'hébergeur recommandé : PostgreSQL managé, offre gratuite,
interface d'administration en français, stockage de fichiers pour les photos
et authentification incluse si un back-office est ajouté plus tard. Neon ou un
PostgreSQL auto-hébergé conviennent aussi — le code ne dépend que du protocole
Postgres.

**Drizzle ORM** plutôt que Prisma : schéma déclaré en TypeScript (donc typé de
bout en bout, du `SELECT` jusqu'au composant Vue), aucune étape de génération
de client, et une empreinte compatible avec les environnements serverless
(Vercel, Netlify, Cloudflare) où le démarrage à froid compte.

### Mise en place

1. Créer un projet sur <https://supabase.com> (région Europe de l'Ouest ou
   `af-south-1` pour la latence depuis le Togo).
2. Copier la **connection string** du *Transaction pooler* (port `6543`) dans
   `.env` :

```bash
cp .env.example .env
# puis renseigner DATABASE_URL
```

3. Créer les tables et injecter le contenu :

```bash
npm run db:migrate
npm run db:seed
```

4. Vérifier : `GET /api/site-content` renvoie désormais `"source": "database"`
   au lieu de `"source": "static"`.

### Scripts disponibles

| Script | Rôle |
| --- | --- |
| `npm run db:generate` | Génère une migration SQL depuis les modifications du schéma |
| `npm run db:migrate` | Applique les migrations en attente — **le seul chemin autorisé en production** |
| `npm run db:push` | Synchronise le schéma sans migration — **développement uniquement** |
| `npm run db:seed` | Injecte le contenu éditorial de référence |
| `npm run db:studio` | Ouvre Drizzle Studio pour parcourir et éditer les données |

### Migrations

`server/database/migrations/` est versionné : le SQL appliqué à la base fait
partie du dépôt, au même titre que le schéma TypeScript dont il dérive.

Toute modification de `server/database/schema.ts` se termine par :

```bash
npm run db:generate        # écrit la migration + le snapshot dans meta/
git add server/database/migrations
```

**`db:push` ne doit jamais viser la production.** Il compare le schéma à la
base et applique la différence sans rien écrire nulle part : aucune trace de
ce qui a été appliqué ni quand, aucun retour en arrière possible, et un
renommage de colonne qu'il lit comme *suppression + création* — c'est-à-dire
la perte des demandes de `quote_requests`. En développement, sur une base
jetable, il reste le chemin le plus court ; ailleurs, non.

Au déploiement, `npm run db:migrate` s'exécute **avant** la mise en service du
nouveau build, depuis le pipeline et non depuis un poste :

```bash
DATABASE_URL=… npm run db:migrate && node .output/server/index.mjs
```

### Schéma

`server/database/schema.ts` définit huit tables et trois types énumérés
(`branch_slug`, `gallery_category`, `quote_status`) :

- **Contenu** — `branches`, `rental_categories`, `service_blocks`, `domains`,
  `gallery_items`, `testimonials`, `faq_items`. Chacune porte un `position`
  (ordre d'affichage) et un `is_published` (dépublication sans suppression).
- **Transactionnel** — `quote_requests` : les demandes de devis, avec statut
  (`nouveau`, `en_cours`, `devis_envoye`, `gagne`, `perdu`, `spam`), empreinte
  IP hachée pour la limitation de débit, et horodatage de traitement.

### Dégradation gracieuse

`server/utils/repository.ts` interroge la base ; si la connexion est absente,
si une requête échoue ou si une table est vide, il retombe sur
`server/data/content.ts`. **Une panne de base ne met pas le site hors ligne** —
elle le ramène à son état statique. Les demandes de devis reçues dans cet état
sont journalisées côté serveur pour ne pas être perdues.

---

## Notification des demandes de devis

Une demande enregistrée qui n'alerte personne ne vaut rien : le site promet une
réponse sous 24 h. À réception, `server/api/quotes.post.ts` envoie donc deux
messages — une alerte à l'équipe (`NUXT_NOTIFY_EMAIL`) et un accusé de
réception au demandeur s'il a laissé une adresse.

### Mise en route

1. Ouvrir un compte chez **Resend** ou **Brevo** (l'offre gratuite suffit :
   quelques centaines de messages par mois).
2. Vérifier le domaine d'envoi (SPF + DKIM). Sans cela, les messages partent en
   indésirables — ou sont refusés.
3. Renseigner trois variables :

```
NUXT_MAIL_PROVIDER=resend        # ou brevo
NUXT_MAIL_API_KEY=re_…
NUXT_MAIL_FROM=TBS Distribution <devis@tbs-distribution.tg>
```

Le prestataire se change par configuration, sans toucher au code : les deux
API sont appelées en HTTP depuis `server/utils/mailer.ts`, sans dépendance npm
ni port SMTP — le même code tourne derrière Node, Vercel ou Cloudflare.

### Garanties

- **L'envoi ne peut jamais faire échouer une demande.** Chaque message est
  plafonné à 8 secondes, les échecs sont journalisés, la réponse reste un
  succès. La réponse porte `notified: true|false` pour le dire honnêtement.
- **Sans clé d'API, rien ne casse** : l'envoi est désactivé, la demande reste
  enregistrée et journalisée, et un avertissement le signale dans le journal.
- **Aucune donnée technique interne dans les messages** : ni `ipHash` ni
  `userAgent`, qui servent l'anti-spam et pas le commercial qui rappelle.
- **L'alerte interne répond au client.** Son `Reply-To` est l'adresse du
  demandeur : répondre depuis la boîte de l'équipe écrit directement au client.
- Sans base de données, l'alerte porte un avertissement visible — elle est
  alors la seule trace de la demande.

Les gabarits vivent dans `server/utils/quoteNotification.ts` et n'importent
rien de Nitro : ils se rendent hors serveur, ce qui permet de les relire sans
démarrer quoi que ce soit.

### Conservation et anonymisation

La politique de confidentialité annonce une conservation de
`QUOTE_RETENTION_MONTHS` mois (24) « à compter du dernier échange ». Une tâche
planifiée rend cette phrase vraie : `server/tasks/quotes/anonymise.ts` tourne
chaque nuit à 3 h et écrase nom, téléphone, e-mail, lieu, description et
éléments techniques des demandes expirées. Branche, type de demande et dates
subsistent — des statistiques sans lien avec une personne.

Aucune migration n'est nécessaire : les colonnes `NOT NULL` reçoivent un
marqueur, qui sert aussi de garde d'idempotence.

Le planificateur vient du préréglage Node. **Sur une plate-forme sans cron
intégré** — serverless, edge — la tâche ne part pas toute seule : déclencher
`quotes:anonymise` depuis le cron de la plate-forme.

---

## Architecture

```
app/
  assets/css/main.css      Design tokens (@theme Tailwind v4) + base + utilitaires
  components/
    App/                   TopBar, Header, Footer, ContactDock
    Ui/                    Button, SectionHead, Tag, StatRow, PageHero
    Home/                  Hero, Branches, Categories, Domains, Inspirations, Testimonials
    Services/              Block, Offers
    Gallery/               Lightbox
    Faq/                   Accordion
    Contact/               Form
    Shared/                ProcessSteps, CtaBanner
  composables/
    useSiteContent.ts      Chargement dédupliqué du contenu + coordonnées
    useSeo.ts              Meta par page, JSON-LD LocalBusiness / FAQPage / Breadcrumb
  pages/                   index, services, galerie, a-propos, contact, faq,
                           mentions-legales, conditions-de-location, confidentialite
  plugins/reveal.ts        Directive v-reveal (IntersectionObserver partagé, SSR-safe)
  utils/imageSizes.ts      Valeurs `sizes` pour <NuxtImg>
server/
  api/                     site-content, branches, gallery, faq (GET) · quotes (POST)
  data/content.ts          Contenu de référence — seed + repli
  database/                schema.ts, client.ts, seed.ts
  utils/mailer.ts          Envoi e-mail — Resend ou Brevo, par API HTTP
  utils/quoteNotification.ts  Alerte équipe + accusé de réception
  utils/repository.ts      Accès base avec repli statique
  utils/securityHeaders.ts Politique CSP et en-têtes — source unique de vérité
scripts/csp-hashes.mjs     Relève les empreintes CSP des scripts en ligne
shared/
  types.ts                 Types partagés client / serveur
  utils/legalData.ts       Identité légale — le seul fichier à compléter
  utils/siteData.ts        Contenu de présentation statique (process, formules, stats)
public/images/             34 photos extraites de la maquette
design/                    Maquette source + plaquettes commerciales (documentation)
```

---

## Contenu du dépôt

| Dossier | Rôle |
| --- | --- |
| `app/` | Interface Nuxt — pages, composants, styles, composables |
| `server/` | API Nitro, schéma et accès base, contenu de référence |
| `shared/` | Types et données partagés client / serveur |
| `scripts/` | Outillage hors build — relevé des empreintes CSP |
| `public/images/` | Les 34 photographies extraites de la maquette |
| `design/` | Maquette d’origine et plaquettes commerciales TBS — voir [design/README.md](design/README.md) |

Le dossier `design/` documente la provenance : d’où viennent les couleurs, les
textes et les photos. Il n’est pas compilé par Nuxt.

---

## Ce qui a été modifié par rapport à la maquette

La mise en page, la palette, la typographie et l'intégralité des textes sont
conservées. Les changements portent sur la structure, l'accessibilité et la
performance.

### Structure

- **Vraies pages plutôt qu'un state React.** La maquette affichait six écrans
  dans un composant unique piloté par `this.state.page`. Chaque page a
  désormais son URL : liens partageables, indexables, bouton « précédent »
  fonctionnel, et six pages pré-rendues au build.
- **Filtres et onglets dans l'URL.** `?branche=events`, `?filtre=mariage` —
  on peut envoyer un lien pointant directement sur une branche ou une
  catégorie.
- **Barre « Aperçu Desktop / Tablet / Mobile » supprimée.** C'était un
  artefact de prototypage : le site est réellement responsive.

### Accessibilité

- Lien d'évitement, repères sémantiques (`header`, `main`, `nav`, `footer`),
  hiérarchie de titres cohérente.
- Accordéon FAQ relié par `aria-expanded` / `aria-controls` / `role="region"`
  (la maquette masquait les réponses sans lien avec leur bouton).
- Tiroir mobile : verrouillage du défilement, fermeture à <kbd>Échap</kbd> et
  au clic extérieur, focus rendu au bouton.
- Visionneuse de galerie : `role="dialog"`, focus déplacé, navigation aux
  flèches.
- Anneau de focus visible et unique sur tous les éléments interactifs.
- `prefers-reduced-motion` respecté : le contenu reste visible, les
  animations sont neutralisées.
- **Contrastes conformes AA** (WCAG 1.4.3). Les couleurs de branche pêche et
  olive sont décoratives : lisibles en pastille, elles tombent à 2,15:1 et
  2,33:1 dès qu'on en fait du texte. `brandTextColor()`
  (`shared/utils/branchColors.ts`) donne la variante texte — même teinte,
  luminance abaissée. **Toute nouvelle couleur de texte doit passer par elle.**
- **Cibles tactiles à 24 px** (WCAG 2.5.8), y compris les puces du carrousel :
  le trait reste fin, la zone cliquable fait 44 px de haut.

### Performance

- `<NuxtImg>` : WebP, `srcset` responsive, `loading="lazy"` hors hero.
  Le hero est préchargé — c'est le LCP.
- Polices auto-hébergées par `@nuxt/fonts` (plus d'appel à Google Fonts au
  chargement).
- Vignettes de galerie filtrées **retirées du DOM** au lieu d'être masquées en
  CSS : plus d'images invisibles chargées ni de pièges au clavier.
- Contenu chargé une seule fois et partagé entre les pages
  (`useAsyncData` + `getCachedData`), réponse API mise en cache 10 min (SWR).
- Neuf pages pré-rendues, assets compressés en gzip et brotli.
- **Cache des images** : `routeRules` pose `immutable` un an sur `/_ipx/**`
  — ces URL portent format, qualité et dimensions, elles sont adressées par
  leur contenu — et trente jours sur `/images/**`.
- **Galerie progressive** : neuf vignettes au premier rendu, le reste sur
  demande. Le rendu serveur ne produit que les neuf premières.
- Qualité des vignettes à 60 : indiscernable à 300 px de large, 13 % de moins
  sur le fichier.

### SEO

- Titre, description, Open Graph, Twitter Card et URL canonique par page.
- JSON-LD `LocalBusiness` (adresse, horaires, zone desservie, offres),
  `FAQPage` et `BreadcrumbList`.
- `sitemap.xml` et `robots.txt` générés.

### Fonctionnel

- **Formulaire de devis réel** : validation client et serveur (Zod), erreurs
  sous chaque champ, états chargement / succès / erreur, champ e-mail ajouté,
  champ piège anti-robot, délai minimum de remplissage, limitation à 10
  demandes par IP et par heure, comptées en base.
- **Notification à réception** : alerte à l'équipe et accusé de réception au
  demandeur, sans jamais pouvoir faire échouer l'enregistrement.
- **Dock de contact permanent** : bouton WhatsApp flottant en bureau, barre
  Appeler / WhatsApp / Devis en mobile — les deux canaux qui convertissent le
  mieux au Togo.
- **Visionneuse de galerie** : les vignettes n'étaient pas cliquables.
- **Carrousel de témoignages** reconstruit sur `scroll-snap` natif : glissement
  au doigt, molette horizontale, et plus d'arithmétique de pourcentages à
  maintenir si le nombre de témoignages change.
- **Page 404** aux couleurs du site.
- **Icônes et cartes sociales** : jeu complet (ICO 16/32/48, PNG 96 et 180,
  192 et 512 pour Android dont une masquable, manifeste d'application) et une
  image de partage 1200 × 630 par page, fabriqués depuis le logo et les photos
  du site par `npm run icons:generate`.

### Icônes et images de partage

`public/` porte le jeu d'icônes et les cartes sociales, tous produits depuis
`public/images/logo-tbs.png` et les photos du site :

```bash
npm run icons:generate      # → scripts/generate-icons.mjs
```

| Fichier | Rôle |
| --- | --- |
| `favicon.ico` | Onglet et favoris — 16, 32 et 48 px dans un même conteneur |
| `favicon-96.png` | Onglet sur écran à forte densité |
| `apple-touch-icon.png` | Écran d'accueil iOS (180 px) — sans lui, iOS met une capture de la page |
| `icon-192.png`, `icon-512.png` | Manifeste Android |
| `icon-512-maskable.png` | Découpe Android (cercle, goutte…) : le logo tient dans la zone de sécurité |
| `site.webmanifest` | Nom, couleurs, installation, raccourcis « Devis » et « Galerie » |
| `og-image.jpg` et `og-<page>.jpg` | Partage social, 1200 × 630 |

Les fichiers sont **versionnés** : le déploiement ne dépend pas de sharp. Le
script n'est à rejouer que si le logo ou une photo change.

Toutes les cartes sociales font 1200 × 630, et `usePageSeo` déclare ces
dimensions dans `og:image:width` / `og:image:height`. Sans elles, Facebook,
LinkedIn et WhatsApp doivent télécharger l'image pour les deviner — d'où le
lien nu au premier partage. Une image d'un autre gabarit ferait mentir ces
deux nombres : passer par le script.

**Ce qui manque encore** : `favicon.svg` et `mask-icon`. Les deux demandent le
logo en vectoriel, et le dépôt n'a que le PNG de 400 × 200. Emballer ce PNG
dans un `<svg>` n'apporterait rien — mêmes pixels, aucune mise à l'échelle
gagnée. Le jour où le fichier vectoriel arrive (AI, EPS ou SVG), les deux
lignes sont à ajouter dans `nuxt.config.ts`.

## Intégration continue

`.github/workflows/ci.yml` s'exécute à chaque poussée sur `main` et sur chaque
pull request. Trois travaux, du plus rapide au plus lent :

| Travail | Étapes | Bloquant |
| --- | --- | --- |
| `qualite` | `npm ci`, lint, types, tests unitaires, build, `npm audit --audit-level=high --omit=dev` | oui |
| `parcours` | Playwright sur Chromium, les quatre parcours de bout en bout | oui |
| `performance` | Lighthouse CI sur quatre pages, trois relevés chacune | non — avertissement |

Une nouvelle poussée annule la vérification en cours sur la même branche.

Les étapes `lint`, `test` et `test:e2e` passent par `npm run --if-present` :
les scripts arrivent avec l'outillage de l'issue #16, et la CI ne doit pas
échouer sur les branches ouvertes avant lui.

### Budget de performance

`lighthouserc.json` porte les seuils. Ils sont tous en **avertissement** :
avant de bloquer une fusion sur un chiffre, il faut plusieurs relevés réels
pour connaître la dispersion d'une mesure à l'autre — le coureur GitHub est
partagé, et un écart de dix points d'un passage à l'autre n'est pas rare.

Repère mesuré à la main sur l'accueil pré-rendu : environ **274 Ko**
transférés (gzip), hors fontes — le plafond de 600 Ko laisse donc de la marge
sans être décoratif.

Le seuil d'accessibilité à 1,0 n'a de sens qu'une fois les contrastes et les
cibles tactiles corrigés ; il reste en avertissement jusque-là.

### Protection de la branche `main`

À poser une fois cette PR fusionnée, depuis un compte administrateur du dépôt :

```bash
gh api -X PUT repos/Nova2026-graphik/TBS/branches/main/protection   -F required_status_checks[strict]=true   -F 'required_status_checks[contexts][]=Lint, types, tests, build'   -F 'required_status_checks[contexts][]=Parcours de bout en bout'   -F enforce_admins=false   -F required_pull_request_reviews[required_approving_review_count]=1   -F restrictions=null
```

---

---

## Déploiement

Le build produit une sortie Nitro universelle.

```bash
npm run build          # → .output/
node .output/server/index.mjs
```

Avec une base configurée, `npm run db:migrate` précède la mise en service —
cf. [Migrations](#migrations).

**Vercel / Netlify** : connecter le dépôt, définir `DATABASE_URL` dans les
variables d'environnement, et ajouter `npm run db:migrate` à la commande de
build ; aucune autre configuration nécessaire.

**Hébergement Node classique** : servir `.output/` derrière Nginx.

**Entièrement statique** (sans formulaire de devis dynamique) :

```bash
npm run generate
```

### Variables d'environnement

Voir `.env.example`. Aucune n'est obligatoire pour faire tourner le site ;
seule `DATABASE_URL` change le comportement (base au lieu de contenu statique).

### Dépendances surchargées

`package.json` force deux paquets transitifs, faute de correctif amont — le
motif de chacun est écrit dans la clé `//overrides`, juste au-dessus :

| Paquet | Forcé en | Pourquoi |
| --- | --- | --- |
| `sharp` | `^0.35.0` | Vulnérabilités libvips ([GHSA-f88m-g3jw-g9cj](https://github.com/advisories/GHSA-f88m-g3jw-g9cj)). `ipx@2` demande `^0.32.6` ; seul `ipx@4`, encore en bêta, monte à `^0.35`. |
| `esbuild` | `^0.28.2` | Deux avis visant son serveur de développement. `@esbuild-kit/core-utils`, abandonné et tiré par `drizzle-kit`, reste bloqué sur `~0.18.20`. |

Ces deux lignes disparaîtront quand l'amont rattrapera : surveiller la sortie
stable d'`ipx@4` (`@nuxt/image@2`) et l'abandon de `@esbuild-kit` par
`drizzle-kit`. Dependabot (`.github/dependabot.yml`) signale les mises à jour
chaque lundi.

---

## Sécurité

`server/plugins/security-headers.ts` pose les en-têtes de protection sur
**toutes** les réponses : pages pré-rendues, assets et routes `/api`. La
politique elle-même vit dans `server/utils/securityHeaders.ts`.

> Un plugin Nitro, et non un middleware `server/middleware/` : Nitro enregistre
> le gestionnaire d'assets publics comme premier middleware, si bien qu'un
> middleware applicatif n'est jamais atteint pour `/`, `/contact` ou tout autre
> document pré-rendu. Le hook `request` du plugin, lui, court avant toute la
> pile.

| En-tête | Valeur | Ce qu'il empêche |
| --- | --- | --- |
| `Content-Security-Policy` | voir ci-dessous | Exécution de code injecté |
| `Strict-Transport-Security` | `max-age=31536000; includeSubDomains; preload` | Rétrogradation en HTTP |
| `X-Frame-Options` + `frame-ancestors 'none'` | `DENY` | Clickjacking sur le formulaire de devis |
| `X-Content-Type-Options` | `nosniff` | Réinterprétation d'un fichier de `/images/` |
| `Referrer-Policy` | `strict-origin-when-cross-origin` | Fuite d'URL vers les tiers |
| `Permissions-Policy` | caméra, micro, géoloc… désactivés | Accès aux capteurs |
| `Cross-Origin-Opener-Policy` | `same-origin` | Prise de contrôle par l'ouvrant |
| `Cross-Origin-Resource-Policy` | `same-origin` | Chargement des images par des tiers |

En développement, HSTS, le cadrage et la CSP sont omis : ils casseraient
l'iframe des Nuxt DevTools et le rechargement à chaud de Vite.

### Content-Security-Policy : report-only puis bloquante

Tout est auto-hébergé (polices `/_fonts`, images `/_ipx`, scripts `/_nuxt`), la
politique tient donc en `'self'` — seule exception, `frame-src` pour la carte
OpenStreetMap de la page contact.

Reste le cas des deux scripts que Nuxt sérialise dans chaque page pré-rendue
(carte d'imports et `window.__NUXT__.config`). Une CSP bloquante sans leur
empreinte coupe l'hydratation : le HTML s'affiche, plus rien ne réagit. D'où le
défaut prudent — `Content-Security-Policy-Report-Only` — et la bascule en deux
temps :

```bash
npm run build
npm run security:csp-hashes    # relève les empreintes des scripts en ligne
```

Reporter la ligne obtenue dans l'environnement de production, puis activer :

```
NUXT_SECURITY_CSP_SCRIPT_HASHES=sha256-…,sha256-…
NUXT_SECURITY_CSP_MODE=enforce
```

Les empreintes changent à chaque build qui touche la configuration publique :
`npm run security:csp-hashes` fait partie du déploiement. En attendant, le mode
report-only signale les violations dans la console du navigateur — les deux
scripts Nuxt y apparaissent, avec l'empreinte à autoriser.

### Limitation de débit et adresse du client

Le formulaire de devis accepte `NUXT_QUOTE_RATE_LIMIT_PER_HOUR` demandes par
heure et par adresse. Le compte est tenu **en base**, par un décompte des
lignes de `quote_requests` sur la dernière heure — l'index `(ip_hash,
created_at)` est là pour ça. Il vaut donc pour toutes les instances à la fois,
y compris derrière un hébergement sans serveur où chaque requête peut tomber
sur un processus neuf. Sans `DATABASE_URL`, le compte retombe en mémoire du
processus : mono-instance, et remis à zéro à chaque démarrage.

Encore faut-il savoir *qui* demande. `X-Forwarded-For` est un en-tête de
requête, écrit par le client : le lire sans proxy de confiance devant revient
à laisser un robot changer d'identité à chaque envoi. Les en-têtes de
plate-forme (`cf-connecting-ip`, `x-vercel-forwarded-for`…) ne valent que
derrière la plate-forme qui les réécrit.

`NUXT_SECURITY_TRUSTED_PROXY` nomme donc explicitement ce qui se trouve
devant :

| Valeur | En-tête lu | Quand |
| --- | --- | --- |
| `direct` (défaut) | aucun | Accès direct au serveur Node |
| `cloudflare` | `cf-connecting-ip` | Derrière Cloudflare |
| `vercel` | `x-vercel-forwarded-for` | Sur Vercel |
| `netlify` | `x-nf-client-connection-ip` | Sur Netlify |
| `x-forwarded-for` | `X-Forwarded-For` | Reverse proxy maison — préciser le nombre de sauts avec `NUXT_SECURITY_TRUSTED_PROXY_HOPS` |

Par défaut, seule l'adresse de la connexion TCP fait foi : prudent, mais faux
si un proxy se trouve devant sans être déclaré — tous les visiteurs partagent
alors le quota de l'adresse du proxy. **La valeur est à renseigner au
déploiement, en même temps que `DATABASE_URL`.**

Le piège anti-robot et le délai minimum de deux secondes restent en place :
ils couvrent le spam automatisé, là où la limitation vise l'abus délibéré.

### Génération entièrement statique

`npm run generate` ne produit aucun serveur Nitro : le plugin ne s'exécute pas.
Les en-têtes doivent alors être posés par l'hébergeur — fichier `_headers`
(Netlify, Cloudflare Pages), `add_header` (Nginx) — en reprenant les valeurs de
`server/utils/securityHeaders.ts`.

---

## Points à finaliser avec le client

1. **Carte de contact** — `app/pages/contact.vue` intègre une carte
   OpenStreetMap centrée sur Lomé. Remplacer les coordonnées du `bbox` par
   celles relevées à l'entrepôt d'Agôè-Démakpoè.
2. **Réseaux sociaux** — Facebook, Instagram et LinkedIn ne sont plus
   affichés : les liens pointaient sur `#`, ce qui ne menait nulle part.
   Renseigner une URL dans `SOCIAL_ACCOUNTS` (`shared/utils/siteData.ts`)
   suffit à réafficher l'entrée.
3. **Photographies** — les 34 images proviennent de la maquette (banque
   d'images). À remplacer par les photos des réalisations TBS ; les noms de
   fichiers de `public/images/` décrivent leur usage.
4. **Logo sur fond sombre** — le logo bichrome est posé sur une pastille
   blanche dans le footer. Une version monochrome claire serait plus élégante.
5. **Mentions légales** — les liens du bas de page sont présents mais les
   pages restent à rédiger.
6. **Notification de devis** — l'envoi est en place (voir « Notification des
   demandes de devis »). Reste à ouvrir le compte Resend ou Brevo, vérifier le
   domaine d'envoi et renseigner `NUXT_MAIL_API_KEY` en production.

---

## Vérifications

```bash
npm run typecheck
npm run build
npm audit           # doit rester à 0 vulnérabilité
```

En-têtes de sécurité, sur le build de production :

```bash
node .output/server/index.mjs
curl -sI http://127.0.0.1:3000/ | grep -iE 'content-security|strict-transport|x-content-type|x-frame|referrer-policy|permissions-policy'
```

En ligne, viser A ou A+ sur <https://securityheaders.com> (A tant que la CSP
reste en report-only, A+ une fois passée en `enforce`).

`typecheck` remonte une erreur `TS2537` dans
`node_modules/@nuxt/image/dist/runtime/components/NuxtPicture.vue` : c'est une
incompatibilité entre `@nuxt/image` et les types `@unhead` actuels, dans une
dépendance. Le composant `<NuxtPicture>` n'est pas utilisé ici et le build
n'est pas affecté. Aucune erreur ne provient du code du projet.

---

## Propriété

Site réalisé pour **TBS Distribution S.A.R.L** (Agôè-Démakpoè, Lomé — Togo).
Code, contenus éditoriaux et éléments d’identité : tous droits réservés.
Les photographies issues de la maquette proviennent d’une banque d’images et
sont destinées à être remplacées par les clichés des réalisations TBS —
le cahier de tournage est dans [`docs/reportage-photo.md`](docs/reportage-photo.md).
