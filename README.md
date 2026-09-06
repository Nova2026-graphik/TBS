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
npm run db:push
npm run db:seed
```

4. Vérifier : `GET /api/site-content` renvoie désormais `"source": "database"`
   au lieu de `"source": "static"`.

### Scripts disponibles

| Script | Rôle |
| --- | --- |
| `npm run db:generate` | Génère les fichiers de migration SQL depuis le schéma |
| `npm run db:migrate` | Applique les migrations (recommandé en production) |
| `npm run db:push` | Synchronise le schéma directement (pratique en développement) |
| `npm run db:seed` | Injecte le contenu éditorial de référence |
| `npm run db:studio` | Ouvre Drizzle Studio pour parcourir et éditer les données |

### Schéma

`server/database/schema.ts` définit neuf tables :

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
  pages/                   index, services, galerie, a-propos, contact, faq
  plugins/reveal.ts        Directive v-reveal (IntersectionObserver partagé, SSR-safe)
  utils/imageSizes.ts      Valeurs `sizes` pour <NuxtImg>
server/
  api/                     site-content, branches, gallery, faq (GET) · quotes (POST)
  data/content.ts          Contenu de référence — seed + repli
  database/                schema.ts, client.ts, seed.ts
  utils/mailer.ts          Envoi e-mail — Resend ou Brevo, par API HTTP
  utils/quoteNotification.ts  Alerte équipe + accusé de réception
  utils/repository.ts      Accès base avec repli statique
shared/
  types.ts                 Types partagés client / serveur
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

### Performance

- `<NuxtImg>` : WebP, `srcset` responsive, `loading="lazy"` hors hero.
  Le hero est préchargé — c'est le LCP.
- Polices auto-hébergées par `@nuxt/fonts` (plus d'appel à Google Fonts au
  chargement).
- Vignettes de galerie filtrées **retirées du DOM** au lieu d'être masquées en
  CSS : plus d'images invisibles chargées ni de pièges au clavier.
- Contenu chargé une seule fois et partagé entre les pages
  (`useAsyncData` + `getCachedData`), réponse API mise en cache 10 min (SWR).
- Six pages pré-rendues, assets compressés en gzip et brotli.

### SEO

- Titre, description, Open Graph, Twitter Card et URL canonique par page.
- JSON-LD `LocalBusiness` (adresse, horaires, zone desservie, offres),
  `FAQPage` et `BreadcrumbList`.
- `sitemap.xml` et `robots.txt` générés.

### Fonctionnel

- **Formulaire de devis réel** : validation client et serveur (Zod), erreurs
  sous chaque champ, états chargement / succès / erreur, champ e-mail ajouté,
  champ piège anti-robot, délai minimum de remplissage, limitation à 10
  demandes par IP et par heure.
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

---

## Déploiement

Le build produit une sortie Nitro universelle.

```bash
npm run build          # → .output/
node .output/server/index.mjs
```

**Vercel / Netlify** : connecter le dépôt, définir `DATABASE_URL` dans les
variables d'environnement, aucune autre configuration nécessaire.

**Hébergement Node classique** : servir `.output/` derrière Nginx.

**Entièrement statique** (sans formulaire de devis dynamique) :

```bash
npm run generate
```

### Variables d'environnement

Voir `.env.example`. Aucune n'est obligatoire pour faire tourner le site ;
seule `DATABASE_URL` change le comportement (base au lieu de contenu statique).

---

## Points à finaliser avec le client

1. **Carte de contact** — `app/pages/contact.vue` intègre une carte
   OpenStreetMap centrée sur Lomé. Remplacer les coordonnées du `bbox` par
   celles relevées à l'entrepôt d'Agôè-Démakpoè.
2. **Réseaux sociaux** — les liens Facebook, Instagram et LinkedIn du footer
   pointent sur `#` en attendant les URL réelles.
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
```

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
sont destinées à être remplacées par les clichés des réalisations TBS.
