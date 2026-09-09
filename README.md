# TBS Distribution S.A.R.L — site vitrine

Site vitrine pour TBS Distribution (Agôè-Démakpoè, Lomé — Togo), réalisé en
**Nuxt 4 + TypeScript**, à partir de la maquette
`TBS Site 6 Pages - offline2.html`.

Les six pages de la maquette en font vingt-trois au pré-rendu : dix en
français — les six d'origine, les trois pages légales et l'index de la rubrique
Conseils —, les sept articles de cette rubrique, et six en anglais sous `/en/`.
L'espace de suivi des devis, `/admin`, reste hors index et hors pré-rendu.

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

## Supervision

Trois questions, trois réponses distinctes. Aucune n'exige de compte pour que
le code fonctionne : tout est inerte tant que rien n'est configuré.

### Les erreurs ne sont plus silencieuses

`server/plugins/error-reporting.ts` capte toute erreur serveur non rattrapée,
en écrit une ligne greppable, et alerte par e-mail — via le prestataire déjà
configuré pour les devis, sans compte supplémentaire.

Deux règles :

- **rien de personnel ne sort.** Le corps de la requête n'est jamais lu, la
  chaîne de requête est retirée du chemin, les en-têtes ne sont pas joints. Une
  alerte sur `/api/quotes` ne republie pas la demande ;
- **on n'inonde pas.** Une même signature ne déclenche qu'une alerte par quart
  d'heure. Les 4xx sont ignorées : une validation refusée n'apprend rien sur la
  santé du service.

Sans `NUXT_NOTIFY_EMAIL` ni prestataire d'envoi, les erreurs restent
journalisées — c'est-à-dire l'état antérieur, mais structuré.

### Audience, sans bandeau de consentement

`NUXT_PUBLIC_ANALYTICS_*` branche **Plausible** ou **Umami** (auto-hébergeable).
Tous deux fonctionnent sans cookie et sans identifiant persistant : aucune
bannière n'est requise. Vide, rien n'est chargé.

L'origine renseignée alimente aussi la CSP (`script-src`, `connect-src`) —
sans quoi le script serait bloqué et la page resterait muette sans erreur
visible. La politique de confidentialité s'ajuste elle aussi : elle nomme le
prestataire quand il y en a un, et affirme l'absence de mesure sinon.

Six événements, définis dans `shared/utils/analytics.ts` :

| Événement | Ce qu'il révèle |
| --- | --- |
| `devis_ouvert` | Trafic qui atteint réellement le formulaire |
| `devis_commence` | Premier champ rempli |
| `devis_envoye` | Conversion |
| `whatsapp_clic` · `appel_clic` | Le canal réellement préféré |
| `branche_consultee` | La branche qui intéresse |

Le rapport `devis_commence` → `devis_envoye` dit si le formulaire décourage.
Les trois derniers événements sont captés par délégation sur le document : un
seul écouteur couvre tous les liens, présents et à venir.

### Disponibilité

`GET /api/health` vérifie la dépendance qui compte :

```bash
curl -sI https://<domaine>/api/health   # 200 si tout va, 503 si la base est injoignable
```

Surveiller `/` ne dirait rien d'utile : la page d'accueil est pré-rendue et
continuerait de s'afficher alors que toute demande de devis se perd. Brancher
UptimeRobot ou Better Stack sur `/api/health`, toutes les cinq minutes, alerte
par e-mail.

La réponse ne publie ni version, ni chemin, ni message d'erreur : l'adresse est
publique par nécessité.

---

## Espace de suivi des devis

`/admin` liste les demandes, permet d'en ouvrir une, de la rappeler, d'en
changer le statut et d'y attacher une note interne. Jusqu'ici, la seule façon
de lire une demande était `npm run db:studio` depuis un poste de
développement : inutilisable par un commercial.

### Accès

Un mot de passe partagé, pas de comptes : l'écran sert deux ou trois personnes,
et gérer des utilisateurs coûterait plus cher que le problème ne vaut.

```
NUXT_ADMIN_PASSWORD=…
```

**Vide, l'espace n'existe pas** : `/admin` comme `/api/admin/*` répondent 404,
page comprise. Un déploiement qui oublie la variable n'ouvre pas un accès libre
aux demandes de devis.

Ce qui protège l'accès :

| | |
| --- | --- |
| Session | Jeton HMAC-SHA256 sur la date d'expiration, cookie `HttpOnly`, `SameSite=Strict`, `Secure` hors développement, huit heures |
| Mot de passe | Jamais stocké côté navigateur ; comparaison à temps constant |
| Force brute | Dix tentatives par heure et par adresse |
| Indexation | `noindex, nofollow`, `Disallow: /admin`, hors sitemap, hors pré-rendu |
| Mot de passe faible | Avertissement au journal sous douze caractères, ou s'il commence par un mot évident |

Changer le mot de passe déconnecte tout le monde : la clé de signature en
dérive. C'est le comportement attendu.

### Ce que l'écran montre — et ne montre pas

`ip_hash` ne sort jamais : il sert la limitation de débit, pas le suivi
commercial. Le `user_agent` n'apparaît qu'au détail, où il aide à juger un
envoi automatisé.

La **note interne** n'est jamais montrée au client, et part avec le reste à
l'anonymisation — elle peut nommer des personnes.

`handled_at` se pose tout seul dès qu'une demande quitte « nouveau » : c'est la
date qui fait foi pour la conservation, et personne ne penserait à la
renseigner à la main.

### Migration

L'espace ajoute une colonne :

```bash
npm run db:migrate      # applique 0001_large_boom_boom.sql
```

---

## Architecture

```
app/
  assets/css/main.css      Les deux chartes + design tokens (@theme Tailwind v4)
                           + base + utilitaires
  components/
    App/                   TopBar, Header, Footer, ContactDock
    Ui/                    Button, SectionHead, Tag, StatRow
    Ui/PageHero.vue        En-tête de page + planche-contact illustrée (`media`)
    Home/                  Hero, Branches, Categories, Domains, Inspirations, Testimonials
    Services/              Block, Offers
    Gallery/               Lightbox, Sectors
    Gallery/Hero.vue       En-tête propre à /galerie — planche animée, une
                           collection à la fois, la carte applique le filtre
    Faq/                   Accordion
    Contact/               Form
    Legal/                 Gabarit commun aux trois pages légales
    Admin/                 StatusBadge — espace de suivi des devis
    Shared/                ProcessSteps, CtaBanner
    content/               CalculateurMateriel — composant appelé depuis un article
  components/
    Ui/ThemeSwitch.vue     Sélecteur de charte — bandeau supérieur et tiroir mobile
  composables/
    useTheme.ts            Les deux chartes, et le basculement de l'une à l'autre
    useSiteContent.ts      Chargement dédupliqué du contenu + coordonnées
    useSiteData.ts         Blocs de présentation, assemblés depuis la langue active
    useSeo.ts              Meta par page, JSON-LD LocalBusiness / FAQPage / Breadcrumb
    useAnalytics.ts        Événements de parcours, sans cookie ni donnée personnelle
  pages/                   index, services, galerie, a-propos, contact, faq,
                           mentions-legales, conditions-de-location, confidentialite,
                           conseils/ (index + [slug]), admin/ (index + [id])
  plugins/reveal.ts        Directive v-reveal (IntersectionObserver partagé, SSR-safe)
  plugins/analytics.ts     Collecte des événements de parcours
  utils/imageSizes.ts      Valeurs `sizes` pour <NuxtImg>
  utils/businessLocation.ts    Coordonnées de l'entrepôt — carte, marqueur, itinéraire
  utils/materielReception.ts   Barème du calculateur de matériel
i18n/locales/              fr.json et en.json — les deux fichiers se correspondent
content/conseils/          Les sept articles de la rubrique, en Markdown
server/
  api/                     site-content, branches, gallery, faq, health (GET) · quotes (POST)
  api/admin/               Session et suivi des demandes — sous authentification
  api/__sitemap__/urls.get.ts  Les articles, pour qu'un ajout entre au sitemap sans build
  routes/conseils/rss.xml.get.ts   Flux RSS de la rubrique
  middleware/admin-gate.ts Barrière d'accès à /admin
  plugins/error-reporting.ts   Alerte sur erreur serveur, sans donnée personnelle
  plugins/security-headers.ts  Pose les en-têtes sur chaque réponse
  tasks/quotes/anonymise.ts    Anonymisation planifiée des demandes échues
  utils/errorReporter.ts   Mise en forme et fenêtre anti-inondation
  data/content.ts          Contenu de référence — seed + repli
  data/content.en.ts       Sa traduction : seuls les champs lisibles
  database/                schema.ts, client.ts, seed.ts, migrations/
  utils/mailer.ts          Envoi e-mail — Resend ou Brevo, par API HTTP
  utils/quoteNotification.ts  Alerte équipe + accusé de réception
  utils/quoteValidation.ts    Validation partagée des demandes
  utils/quoteRetention.ts     Durée de conservation et anonymisation
  utils/rateLimit.ts       Fenêtre glissante en base, repli mémoire
  utils/clientIp.ts        Adresse cliente — en-têtes de plate-forme vérifiés
  utils/adminSession.ts, requireAdmin.ts   Session signée de l'espace de suivi
  utils/repository.ts      Accès base avec repli statique
  utils/securityHeaders.ts Politique CSP et en-têtes — source unique de vérité
scripts/
  ci.mjs                   Rejoue localement le travail `qualite` de la CI
  typecheck.mjs            Contrôle de types, avec l'exception documentée
  csp-hashes.mjs           Relève les empreintes CSP des scripts en ligne
  generate-icons.mjs       Produit le jeu d'icônes depuis le logo
  trace-logo.mjs           Vectorise le logo (favicon.svg, mask-icon.svg)
  install-hooks.mjs        Installe le crochet de pré-envoi
tests/
  unit/                    Vitest — validation, dépôt, limiteur, IP, admin, images,
                           couleurs de branche
  e2e/                     Playwright — devis, galerie, services, navigation mobile
shared/
  types.ts                 Types partagés client / serveur
  utils/legalData.ts       Identité légale — le seul fichier à compléter
  utils/siteData.ts        Contenu de présentation statique (process, formules, stats)
  utils/analytics.ts       Noms d'événements — une seule source
  utils/adminQuotes.ts, branchColors.ts    Libellés de statut et couleurs de branche
public/images/             33 photos de la maquette + le logo
docs/reportage-photo.md    Cahier de tournage — remplacer les images de banque
design/                    Maquette source + plaquettes commerciales (documentation)
```

---

## Contenu du dépôt

| Dossier | Rôle |
| --- | --- |
| `app/` | Interface Nuxt — pages, composants, styles, composables |
| `server/` | API Nitro, schéma et accès base, contenu de référence |
| `shared/` | Types et données partagés client / serveur |
| `i18n/locales/` | `fr.json` et `en.json` — voir [Version anglaise](#version-anglaise) |
| `content/conseils/` | Les sept articles de la rubrique Conseils, en Markdown |
| `tests/` | `unit/` (Vitest) et `e2e/` (Playwright) — voir [Qualité](#qualité) |
| `scripts/` | Outillage hors build — vérification locale, empreintes CSP, icônes, crochets |
| `docs/` | Notes de travail destinées à TBS — aujourd'hui le cahier de tournage photo |
| `public/images/` | Les 33 photographies extraites de la maquette, et le logo |
| `design/` | Maquette d’origine et plaquettes commerciales TBS — voir [design/README.md](design/README.md) |

Le dossier `design/` documente la provenance : d’où viennent les couleurs, les
textes et les photos. Il n’est pas compilé par Nuxt.

---

## Les deux chartes

Le site porte deux palettes, et un seul jeu de composants. Le visiteur passe de
l'une à l'autre depuis le sélecteur du bandeau supérieur — repris dans le
tiroir mobile, où le bandeau est masqué.

| | Charte | Ancrage |
| --- | --- | --- |
| **Principale** (défaut) | Sable & Or | La charte historique héritée du template : brun-olive profond, or, pêche, crème, olive |
| **Secondaire** | Bleu & Rouge | Le logotype : bleu `#3376ba` et rouge `#d83934`, relevés au pixel sur `public/images/logo-tbs.png` |

### Comment ça marche

Le mécanisme tient dans `app/assets/css/main.css`, en deux étages :

1. les valeurs brutes vivent dans des variables `--tbs-*` posées sur `:root`,
   que le sélecteur `:root[data-theme='logo']` réécrit ;
2. les jetons `@theme` de Tailwind ne portent plus aucune couleur, seulement
   une référence — `--color-gold: var(--tbs-accent)`.

Toutes les classes déjà écrites — `bg-gold`, `text-ink/70`, `border-cream` —
changent donc de couleur sans qu'une ligne de gabarit ne bouge. Le basculement
se réduit à un attribut sur `<html>` : pas de rechargement, pas de seconde
feuille de style, pas de composant qui ait à connaître le thème courant.

Les pages étant pré-rendues, leur HTML est identique pour tout le monde : le
serveur ne peut pas y écrire le thème retenu. L'attribut est donc posé par un
script en ligne minuscule, en tête de `<head>` (`app/app.vue`), avant le
premier rendu — sans quoi la page s'afficherait un instant en sable avant de
virer au bleu. Le choix est mémorisé dans `localStorage` : une préférence
d'affichage strictement locale, rien n'est envoyé au serveur, et la politique
de confidentialité n'a pas à en parler.

### Les contrastes, dans les deux thèmes

La charte secondaire n'est pas une teinture : elle reprend les rapports de
contraste de la première, valeur par valeur, et chaque jeton de `main.css`
porte le sien en commentaire. Le bleu et le rouge du logo sont repris tels
quels partout où ils servent d'aplat ou d'accent — ce sont eux qu'on vient
reconnaître.

Deux valeurs seulement s'en écartent, et pour la raison qui vaut déjà dans la
charte principale : le rouge de marque plafonne à 4,61:1, sous le seuil dès
qu'il passe sur fond sable, et le bleu clair de l'Agro est à 2,25:1. Comme la
pêche et l'olive, ils ont une variante texte de même teinte à luminance
abaissée. Le rouge de marque occupant par ailleurs le registre de l'alerte,
l'encadré d'avertissement des pages légales bascule sur l'ambre dans ce
thème — sans quoi il se confondrait avec la branche Events.

### Ajouter ou changer une couleur

Trois règles, et une épreuve qui les tient :

- **jamais de couleur en dur dans un gabarit.** Une valeur hexadécimale écrite
  dans une classe ou un attribut `style` échappe au basculement : la pastille
  resterait pêche sur une page devenue bleue. Passer par un jeton ;
- **une couleur ajoutée dans les données** (`shared/utils/siteData.ts`,
  `server/data/content.ts`, base) reste hexadécimale — c'est ce que lisent le
  semis, l'espace de suivi et les courriels, où aucune feuille de style n'est
  chargée. Elle doit être reportée dans les deux tables de
  `shared/utils/branchColors.ts`, qui la traduisent en jeton au rendu ;
- **toute couleur de texte passe par `brandTextColor()`**, jamais par
  `brandColor()` : c'est elle qui garantit les 4,5:1 de WCAG 1.4.3.

`tests/unit/branchColors.spec.ts` vérifie les trois liens — couverture des
couleurs de `BRANCH_TABS`, existence des jetons dans `main.css`, valeur de
repli conforme. Une couleur oubliée y échoue, là où le rendu se contenterait
d'avoir l'air un peu faux.

---

## Ce qui a été modifié par rapport à la maquette

La mise en page, la palette, la typographie et l'intégralité des textes sont
conservées. Les changements portent sur la structure, l'accessibilité et la
performance.

### Structure

- **Vraies pages plutôt qu'un state React.** La maquette affichait six écrans
  dans un composant unique piloté par `this.state.page`. Chaque page a
  désormais son URL : liens partageables, indexables, bouton « précédent »
  fonctionnel, et vingt-trois pages pré-rendues au build.
- **Filtres et onglets dans l'URL.** `?branche=events`, `?filtre=mariage` —
  on peut envoyer un lien pointant directement sur une branche ou une
  catégorie.
- **Barre « Aperçu Desktop / Tablet / Mobile » supprimée.** C'était un
  artefact de prototypage : le site est réellement responsive.
- **En-têtes de page illustrés.** La maquette ouvrait chaque page intérieure
  sur un bandeau sable et du texte, avec une moitié droite vide sous le chapô.
  `UiPageHero` accepte désormais `media` : trois ou quatre vignettes carrées,
  façon planche-contact, qui montrent de quoi la page parle avant qu'on ait lu
  une ligne — les quatre branches sur `/services`, le savoir-faire sur
  `/conseils`, l'entreprise sur `/contact`, le matériel sur `/faq`. Elles
  entrent en cascade, avec un zoom lent, et sont neutralisées sous
  `prefers-reduced-motion`.
  Les trois pages légales en reçoivent aussi, mais sur un autre principe : leur
  planche suit les temps de leur chapô — le siège, les bureaux et une
  photographie du site pour les mentions légales ; le parc, la livraison et le
  matériel en service pour les conditions de location ; le formulaire, les
  personnes et le siège pour la confidentialité. Un document qui engage la
  société n'a pas à se décorer, mais il gagne à montrer de quoi il traite.
- **La galerie, elle, ouvre sur une planche animée.** `GalleryHero` y remplace
  l'en-tête commun : un grand cadre fait défiler les collections — Mariages,
  Cérémonies, Entreprise, Décor, Fournitures — une à la fois, photo de
  couverture en fondu croisé et carte qui la nomme. **La carte est un bouton**
  et applique le filtre correspondant ; la planche suit en retour le
  `?filtre=` de l'URL et s'immobilise dès qu'un filtre est posé. Rotation de
  six secondes, donc arrêt explicite exigé par WCAG 2.2.2 : bouton de pause,
  arrêt au survol, au focus et en arrière-plan, rotation désactivée sous
  `prefers-reduced-motion`. Seule la première photo est préchargée, les quatre
  autres n'entrent dans le DOM qu'après l'événement `load`.

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
- **Vignettes d'en-tête retirées de l'arbre d'accessibilité.** Elles sont
  décoratives — les mêmes photos reviennent en pleine taille plus bas — et un
  `alt` descriptif les ferait lire deux fois (WCAG 1.1.1). `tests/e2e/heros.spec.ts`
  vérifie qu'aucune n'expose de rôle `img`.
- `prefers-reduced-motion` respecté : le contenu reste visible, les
  animations sont neutralisées.
- **Contrastes conformes AA** (WCAG 1.4.3), dans les deux chartes. Les
  couleurs de branche pêche et olive sont décoratives : lisibles en pastille,
  elles tombent à 2,15:1 et 2,33:1 dès qu'on en fait du texte.
  `brandTextColor()` (`shared/utils/branchColors.ts`) donne la variante
  texte — même teinte, luminance abaissée. **Toute nouvelle couleur de texte
  doit passer par elle** ; `brandColor()` fait le même travail pour les
  aplats. Voir « Les deux chartes ».
- **Cibles tactiles à 24 px** (WCAG 2.5.8), y compris les puces du carrousel :
  le trait reste fin, la zone cliquable fait 44 px de haut.
- **Rotation du hero arrêtable** (WCAG 2.2.2) : pause au survol, au focus
  clavier, quand l'onglet passe en arrière-plan, et par un bouton explicite.
  Sous `prefers-reduced-motion`, elle ne démarre pas.

### Performance

- `<NuxtImg>` : WebP, `srcset` responsive, `loading="lazy"` hors hero.
  Le hero est préchargé — c'est le LCP.
- **Aucun décalage sur les vignettes d'en-tête** : le cadre porte le rapport
  d'aspect, pas l'image, et la hauteur est donc réservée avant le chargement.
  Le budget CLS de la CI (0,1) reste tenu. `tests/e2e/heros.spec.ts` mesure en
  outre la largeur réellement décodée, pour attraper le `srcset` dégénéré que
  documente `app/utils/imageSizes.ts`.
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
- **Hero en cinq diapositives** : TBS Distribution ouvre le défilement, puis
  les quatre branches, cinq secondes chacune. La maquette montrait une image
  fixe ; la maison, elle, n'était nommée nulle part au-dessus de la ligne de
  flottaison.
- **Visionneuse de galerie** : les vignettes n'étaient pas cliquables.
- **Accordéon des secteurs**, au bas de la galerie : les quatre branches et
  les huit domaines, dépliés au survol comme au clavier. La maquette montrait
  des photos sans jamais dire de quel métier elles relevaient ; chaque panneau
  mène désormais aux prestations de son secteur.
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

> ### ⚠ Aucun travail ne s'exécute sur ce dépôt
>
> Les exécutions sont désormais **créées** — ce n'était pas le cas tant que le
> dépôt était privé — mais aucune n'exécute quoi que ce soit : elles passent à
> `failure` en une à deux secondes, **sans enregistrer une seule étape**. Pas
> même « Set up job ».
>
> | Exécution | Durée | Étapes |
> | --- | --- | --- |
> | `34220621882` — CI sur `main` | 4 s | 0 |
> | la même, rejouée à la main | 1 s | 0 |
> | `34222898257` — un workflow ne contenant qu'un `echo` | 2 s | 0 |
>
> La dernière ligne tranche la question. Un workflow de six lignes, sans
> dépendance, sans secret, sans cache, échoue exactement comme la CI complète :
> **ni le fichier ni le dépôt ne sont en cause**. Passer le dépôt en public n'y
> a rien changé non plus, ce qui écarte le quota de minutes des dépôts privés.
>
> Restaient deux causes, toutes deux hors du dépôt : une politique désactivant
> Actions au niveau du compte, ou un blocage de facturation.
> `gh api repos/Nova2026-graphik/TBS/actions/permissions` les départagerait,
> mais répond `403` à un compte qui n'a que le droit de pousser. Les
> annotations du *check-run*, elles, se lisent sans droit particulier — et
> elles portent le motif en clair :
>
> ```bash
> run=$(gh api "repos/Nova2026-graphik/TBS/actions/runs?per_page=1" --jq '.workflow_runs[0].id')
> job=$(gh api "repos/Nova2026-graphik/TBS/actions/runs/$run/jobs" --jq '.jobs[0].id')
> gh api "repos/Nova2026-graphik/TBS/check-runs/$job/annotations" --jq '.[0].message'
> ```
>
> > The job was not started because your account is locked due to a billing issue.
>
> C'est donc la seconde, et ce n'est plus une hypothèse. L'annotation est la
> même, au mot près, sur les exécutions de branches Dependabot sans rapport
> entre elles : c'est le compte qui est bloqué, pas ce dépôt. Le déblocage se
> fait dans **Settings → Billing** — moyen de paiement à régulariser, puis
> limite de dépense à fixer. Rien dans le dépôt n'y changera quoi que ce soit.
>
> **En attendant, `npm run ci` rejoue localement le travail `qualite`** :
>
> ```bash
> npm run ci                # lint, types, tests, build, audit
> npm run ci -- --parcours  # et les parcours Playwright par-dessus
> ```
>
> Il s'arrête à la première erreur et renvoie un code non nul — utilisable tel
> quel en crochet `pre-push`. Comptez environ trois minutes, dont deux et demie
> de build ; les parcours ajoutent autant, d'où leur mise à l'écart du chemin
> par défaut.

`.github/workflows/ci.yml` s'exécute à chaque poussée sur `main` et sur chaque
pull request. Trois travaux, du plus rapide au plus lent :

| Travail | Étapes | Bloquant |
| --- | --- | --- |
| `qualite` | `npm ci`, lint, types, tests unitaires, build, `npm audit --audit-level=high --omit=dev` | oui |
| `parcours` | Playwright sur Chromium, les quatre parcours de bout en bout | oui |
| `performance` | Lighthouse CI sur quatre pages, trois relevés chacune | non — avertissement |

Une nouvelle poussée annule la vérification en cours sur la même branche.

Aucune étape ne passe plus par `npm run --if-present`. La garde avait un sens
le temps que les branches ouvertes avant l'issue #16 rattrapent leur retard ;
elle est devenue un trou. Une étape déclarée bloquante qu'un script renommé
fait passer en silence ne bloque rien — c'est précisément ce que l'issue #17
reproche à l'état antérieur.

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

### Le crochet de pré-envoi

Tant que GitHub Actions ne démarre pas, rien ne se déclenche tout seul. Le
crochet versionné `.githooks/pre-push` comble ce vide : il rejoue `npm run ci`
avant chaque envoi.

```bash
npm run hooks:install     # git config core.hooksPath .githooks
```

L'installation est **explicite, jamais faite par `postinstall`** : un
`npm install` n'a pas à modifier en silence la configuration Git d'un poste.

| Besoin | Commande |
| --- | --- |
| Passer outre une fois | `git push --no-verify` |
| Passer outre sans toucher au crochet | `SKIP_PRE_PUSH=1 git push` |
| Désinstaller | `git config --unset core.hooksPath` |

Le crochet **se tait sur une suppression de branche** : `git push --delete`
n'envoie aucun commit, et trois minutes de build pour effacer une référence
sont trois minutes perdues. Il lit pour cela les références que Git lui passe
sur l'entrée standard, et ne rend la main sans rien faire que si toutes sont
des suppressions.

Comptez deux à trois minutes par envoi, l'essentiel étant le build. C'est le
prix d'un dépôt sans intégration continue active — et il tombera le jour où
les exécutions repartiront.


## Qualité

| Commande | Ce qu'elle vérifie |
| --- | --- |
| `npm run lint` | ESLint : règles Vue, TypeScript, accessibilité, et le formatage |
| `npm run lint:fix` | Les corrige quand c'est automatisable |
| `npm run typecheck` | Types, sur les gabarits comme sur le code |
| `npm test` | Tests unitaires (Vitest) |
| `npm run test:e2e` | Parcours de bout en bout (Playwright) |
| `npm run photos:check` | Noms, orientations et proportions de `public/images` — cf. `docs/reportage-photo.md` |

### Lint

`@nuxt/eslint` fournit la base accordée à l'arborescence du projet ; s'y
ajoutent les règles `vuejs-accessibility`, qui sont la raison principale
d'avoir un linter ici. Le contrôle de types ne dit rien d'un `alt` manquant,
d'un `label` sans champ ou d'un rôle ARIA inventé — trois erreurs invisibles à
la relecture et coûteuses une fois le site en ligne.

Le formatage passe par `@stylistic` (réglé dans `nuxt.config.ts`) plutôt que
par Prettier : une seule chaîne d'outils, une seule source de vérité.

Deux règles de mise en forme des gabarits sont désactivées, avec le motif
écrit dans `eslint.config.mjs` : elles casseraient en trois lignes tout
élément d'une ligne et n'autoriseraient qu'un attribut par ligne.

### Tests unitaires

`tests/unit/`, en environnement Node — les trois suites portent sur des
modules purs, monter un environnement Nuxt complet coûterait une minute par
exécution sans rien apprendre de neuf.

| Suite | Ce qu'elle garde |
| --- | --- |
| `quoteValidation.spec.ts` | Le schéma de la demande de devis, le champ piège et le délai minimum — y compris le fait que le piège n'apparaît jamais dans les erreurs renvoyées |
| `repository.spec.ts` | Le repli statique : base absente, requête en erreur, table vide |
| `imageSizes.spec.ts` | Les chaînes `sizes`, dont aucun jeton ne doit être nu — le bug a déjà coûté cher |
| `clientIp.spec.ts` | L'adresse du client : en-tête ignoré sans proxy déclaré, `X-Forwarded-For` lu par la droite, normalisation des formes d'une même adresse |
| `rateLimit.spec.ts` | Le quota horaire : fenêtre glissante, comptes séparés par adresse, repli en mémoire qui ne s'ouvre pas quand la base tousse |

### Tests de bout en bout

`tests/e2e/`, sur la **sortie de production** (`npm run build` puis le serveur
Nitro) et non sur le serveur de développement : le pré-rendu, l'hydratation et
les en-têtes y sont ceux du site livré.

Cinq parcours : envoi d'une demande de devis, rotation du hero d'accueil
(ordre des diapositives, cadence, arrêt), filtrage de la galerie et
visionneuse, changement de branche sur `/services` avec synchronisation de
l'URL, tiroir mobile au clavier. Aucune base n'est requise — la dégradation
gracieuse fait partie de ce qui est vérifié.

Première exécution :

```bash
npx playwright install chromium
npm run test:e2e
```

### Versions

`.nvmrc` fixe Node 24, `.editorconfig` aligne les éditeurs sur ce qu'ESLint
impose déjà.

---

## Rubrique Conseils

Le site n'avait aucune surface d'entrée au-delà des requêtes de marque. Les
requêtes qui rapportent sont longues et précises — « combien de chaises pour
300 invités », « prix location vaisselle mariage Lomé », « fournisseur
équipement laboratoire Togo appel d'offres » — et se captent avec du contenu.

### Ajouter un article

Un fichier Markdown dans `content/conseils/`. Le nom du fichier fait l'URL.

```markdown
---
title: "Titre complet, celui du <h1> et de la balise title"
shortTitle: "Titre court pour les vignettes"
description: "Une phrase — sert de méta-description et de chapô"
publishedAt: '2026-05-12'
updatedAt: '2026-05-12'
category: "Réception"        # Réception · Équipements · Appels d'offres · Agro
readingTime: 6               # minutes, annoncées avant le clic
image: "/images/…jpg"
imageAlt: "Description de la photo"
featured: false              # un seul article à la une
---
```

**Mettez toutes les valeurs entre guillemets.** Un « : » suivi d'une espace
dans une valeur non protégée fait échouer l'analyse YAML — silencieusement :
l'article se construit, mais avec des champs vides. Le schéma de
`content.config.ts` est strict pour cette raison ; il vaut mieux une erreur au
build qu'une méta-description absente en production.

`updatedAt` alimente `dateModified` du JSON-LD : c'est ce qui indique à un
moteur qu'un contenu est tenu à jour plutôt que laissé en l'état. À corriger à
chaque révision de fond.

### Le calculateur de matériel

`app/components/content/CalculateurMateriel.vue`, inséré dans un article par
`::calculateur-materiel`. C'est le seul contenu du site qui rend un service
avant la vente : on saisit un nombre d'invités, on obtient une liste chiffrée,
et un bouton la transforme en demande de devis **pré-remplie** — nombre
d'invités, inventaire complet et branche, sans rien recopier.

Les ratios vivent dans `app/utils/materielReception.ts`, pas dans le composant :
ils s'éprouvent seuls, et TBS doit pouvoir les corriger sans toucher à
l'interface. Ils sont commentés un par un — un siège par invité plus 5 %, dix
couverts par table ronde, 2,5 assiettes par convive, 1,3 m² par invité assis.

Le formulaire de devis lit `?invites=` et `?message=` au montage
(`app/components/Contact/Form.vue`), en bornant le message à la limite du
schéma serveur.

### Flux et référencement

| Élément | Où |
| --- | --- |
| JSON-LD `Article` (dont `dateModified`) | `app/pages/conseils/[slug].vue` |
| Flux RSS | `/conseils/rss.xml` — `server/routes/conseils/rss.xml.get.ts` |
| Sitemap | `server/api/__sitemap__/urls.get.ts`, déclaré dans `sitemap.sources` |

Sans cette dernière source, un article publié n'entrerait au sitemap qu'une
fois découvert par un lien.


---

## Version anglaise

Le français est la langue par défaut, l'anglais vit sous `/en/`. La stratégie
`prefix_except_default` laisse les URL françaises **inchangées** : aucune
redirection, aucun lien cassé, aucun capital de référencement perdu.

```
/                    français        /en                  anglais
/services            français        /en/services         anglais
/conseils            français uniquement
/mentions-legales    français uniquement
/admin               français uniquement
```

### Où vit le texte

| Ce qui est traduit | Où |
| --- | --- |
| Copie des pages, formulaire, navigation, pied de page | `i18n/locales/fr.json` et `en.json` |
| Contenu éditorial — branches, prestations, galerie, FAQ, témoignages | `server/data/content.ts` et `content.en.ts` |
| Blocs de présentation — étapes, formules, ambiances, chiffres | clé `data` des fichiers de langue, assemblée par `app/composables/useSiteData.ts` |

La règle est la même partout : **la structure d'un côté, le texte de l'autre**.
`content.en.ts` ne redéfinit que les champs lisibles et reprend du fichier
français les identifiants, slugs, couleurs, images et valeurs chiffrées. Deux
raisons : une valeur non textuelle dupliquée finit toujours par diverger, et le
filtrage de la galerie comme la sélection de branche passent par ces
identifiants — ils ne doivent pas changer d'une langue à l'autre, sous peine de
casser `?branche=` et `?filtre=`.

Même principe dans le formulaire de devis : les libellés des listes sont
traduits, mais **la valeur envoyée reste française**. Une demande venue de la
version anglaise atterrit dans le même bac que les autres, et le champ `branch`
de `quote_requests` reste comparable d'une ligne à l'autre.

### Ce qui n'est pas traduit, et pourquoi

**Les trois pages légales.** Elles engagent la société au regard du droit
togolais ; une traduction non relue par un juriste serait une prise de risque,
pas un service.

**La rubrique Conseils.** Ses articles visent des requêtes locales — « combien
de chaises pour 300 invités », « prix location vaisselle mariage Lomé ». Les
traduire relèverait d'une décision éditoriale à part.

**L'espace de suivi des devis.** Interne, et le doubler créerait des URL à
indexer pour des pages qui n'ont pas à l'être.

Ces pages sont déclarées `defineI18nRoute({ locales: ['fr'] })` : la version
anglaise n'existe pas, et les liens y ramènent au français.

**La détection par la langue du navigateur** est désactivée. Elle enverrait un
moteur d'indexation ou un visiteur francophone en voyage sur une version qu'il
n'a pas demandée, et rendrait le pré-rendu non déterministe. Le choix passe par
le sélecteur du bandeau supérieur, qui conserve la page en cours.

### Ajouter une chaîne

1. La clé dans `i18n/locales/fr.json` **et** `en.json` — les deux fichiers ont
   la même forme, un `diff` des clés le vérifie.
2. `{{ $t('ma.cle') }}` dans le gabarit, ou `t('ma.cle')` dans le script.
3. Pour un lien interne, `<NuxtLinkLocale>` plutôt que `<NuxtLink>`. `UiButton`
   s'en charge seul pour sa prop `to`.

### Vérifier

```bash
npm run build
grep -o '<link[^>]*alternate[^>]*>' .output/public/index.html   # hreflang + x-default
ls .output/public/__sitemap__/                                   # fr-TG.xml et en.xml
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

La politique vit dans `server/utils/securityHeaders.ts`, et elle est posée à
**deux endroits**, parce qu'une seule ne suffisait pas.

| Où | Ce que ça couvre |
| --- | --- |
| `server/plugins/security-headers.ts` | tout ce qui traverse Nitro : routes `/api`, rendu à la volée, développement |
| `routeRules` dans `nuxt.config.ts` | ce qui ne le traverse pas : les pages **pré-rendues**, servies telles quelles par le CDN |

> Le plugin seul a laissé le site sans protection pendant des semaines. Mesure
> faite en production le 8 septembre 2026 : `/api/health` portait les cinq
> en-têtes, `/` n'en portait aucun. Une page pré-rendue est écrite au build et
> servie comme un fichier ; elle n'entre jamais dans le serveur. Toute la
> surface qu'un navigateur interprète comme du HTML était donc découverte, et
> la seule surface protégée rendait du JSON.

Les deux runtimes ne traitent pas les règles de la même façon, et cela se
vérifie plutôt que se suppose :

- **Nitro les fusionne** — une image reçoit aussi celles de `/**` ;
- **la table de routage de Vercel s'arrête** à la première qui correspond, si
  bien que `/(.*)` n'est jamais atteint pour `/images/**` ou `/_ipx/**`.

D'où des en-têtes portés par chaque règle plutôt que délégués à `/**`. Le
résultat se lit en clair dans `.vercel/output/config.json` après un
`NITRO_PRESET=vercel npm run build`.

La CSP, elle, n'accompagne que les documents : un navigateur l'ignore sur une
réponse qui n'en est pas un.

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

Reste le cas des scripts en ligne : les deux que Nuxt sérialise dans chaque
page pré-rendue (carte d'imports et `window.__NUXT__.config`), et celui qui
pose le thème de couleurs avant le premier rendu (voir « Les deux chartes »).
Une CSP bloquante sans leur empreinte coupe l'hydratation, ou fait clignoter la
page : le HTML s'affiche, plus rien ne réagit. D'où le défaut prudent — `Content-Security-Policy-Report-Only` — et la bascule en deux
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
`npm run security:csp-hashes` fait partie du déploiement.

#### Où arrivent les violations

La politique désigne un point de collecte :

```
report-uri /api/csp-report
```

Sans lui, `Report-Only` était décoratif : le navigateur signalait dans la
console du visiteur, et personne ne lisait cette console. `/api/csp-report`
accepte les deux formats — l'ancien `report-uri` et la *Reporting API* — et
journalise une ligne par violation :

```
[csp] script-src a refusé inline sur https://…/contact
```

Trois précautions, parce que l'adresse est publique et que le navigateur y
poste sans que le site ne l'appelle :

- **rien n'est cru** — ce qui n'est pas un rapport est ignoré, et la réponse
  reste un 204 dans tous les cas, y compris sur un corps aberrant : distinguer
  renseignerait qui sonde l'adresse ;
- **on n'inonde pas** — une page cassée produit la même violation à chaque
  visite ; la fenêtre de `errorReporter` n'en retient qu'une par quart d'heure
  et par signature, la page n'entrant pas dans cette signature ;
- **rien de personnel ne sort** — les URL sont réduites à leur chemin, la
  chaîne de requête retirée. Elle peut porter un filtre de galerie ou un terme
  de recherche.

> `report-uri` plutôt que la *Reporting API* : celle-ci exige un en-tête
> `Reporting-Endpoints` portant une URL **absolue**, donc l'origine du site —
> laquelle est fausse en production tant que l'issue #81 n'est pas traitée. Un
> chemin relatif ne dépend de rien.

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

## Référencement local

Une recherche « location chaises Lomé » ou « fournisseur matériel bureau Agôè »
se joue dans le bloc cartographique, avant la première page de résultats. Deux
choses le nourrissent : une position exacte, et une fiche d'établissement.

### Coordonnées de l'entrepôt

Elles ne sont **pas** écrites dans le code. Elles viennent de
`NUXT_PUBLIC_GEO_LATITUDE` et `NUXT_PUBLIC_GEO_LONGITUDE`, et tant qu'elles
sont vides, rien n'est publié :

| Renseignées | JSON-LD | Carte de `/contact` |
| --- | --- | --- |
| non (défaut) | pas de `geo` | cadrage de quartier, sans marqueur ni itinéraire |
| oui | `geo` avec `GeoCoordinates` | centrée à ~450 m, marqueur, bouton « Itinéraire » |

C'est un choix : une latitude approximative dans un `LocalBusiness` est reprise
telle quelle par les moteurs, affichée comme un fait, et envoie un chauffeur à
un kilomètre du portail. L'absence se corrige ; une valeur fausse se propage.

**Relevé** — sur Google Maps, clic long sur le portail de l'entrepôt : les deux
nombres s'affichent, latitude d'abord. Une valeur hors des bornes du Togo est
ignorée avec un avertissement, l'erreur la plus courante étant d'intervertir
les deux.

Le bouton « Itinéraire » pointe vers Google Maps et non OpenStreetMap : c'est
l'application de navigation installée par défaut sur les téléphones Android,
largement majoritaires au Togo.

### Fiche d'établissement Google

Gratuite, à créer et faire valider par courrier ou téléphone. Une fois l'URL
connue, `NUXT_PUBLIC_GOOGLE_BUSINESS_URL` alimente `hasMap` et `sameAs` dans le
JSON-LD — c'est ce qui relie le site à la fiche aux yeux d'un moteur.

À renseigner sur la fiche : catégories, horaires, photos, zone desservie. Et
surtout, **aligner au caractère près** la raison sociale, l'adresse et le
téléphone entre la fiche, le site et le JSON-LD : la cohérence de ces trois
informations pèse lourd dans le classement local.

Les réseaux sociaux rejoignent `sameAs` dès que `SOCIAL_ACCOUNTS`
(`shared/utils/siteData.ts`) porte une URL — les entrées à `null` sont écartées
plutôt que publiées vides.

---

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

### Le contrôle de types, sans dérogation

`npm run typecheck` appelle `nuxt typecheck`, et rien d'autre.

Il a longtemps passé par un script intermédiaire qui tolérait **une** erreur :
`TS2537` dans `NuxtPicture.vue`, une incompatibilité entre `@nuxt/image` 1.11
et les types `@unhead` livrés avec Nuxt 4. Ni `skipLibCheck` ni un `exclude`
de tsconfig ne couvraient le cas.

Cette dérogation a été écrite pour se périmer d'elle-même : le script échouait
sur toute autre erreur, **et** le jour où l'erreur tolérée disparaissait. Elle
a tenu parole. `@nuxt/image` 2.1 corrige la signature, le script l'a signalé
au premier passage, et il a été supprimé avec elle.

> ✖ L'exception tolérée par scripts/typecheck.mjs n'apparaît plus.
>   Supprimez l'exception et rendez `typecheck` à `nuxt typecheck`.

C'est la seule forme d'exception qui vaille : une exception muette survit à son
motif et finit par masquer de vraies erreurs.

---

## Propriété

Site réalisé pour **TBS Distribution S.A.R.L** (Agôè-Démakpoè, Lomé — Togo).
Code, contenus éditoriaux et éléments d’identité : tous droits réservés.
Les photographies issues de la maquette proviennent d’une banque d’images et
sont destinées à être remplacées par les clichés des réalisations TBS —
le cahier de tournage est dans [`docs/reportage-photo.md`](docs/reportage-photo.md).
