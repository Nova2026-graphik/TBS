# Sources de conception

Ce dossier conserve les documents d'origine du projet. Il n'est **pas** compilé
par Nuxt : c'est de la documentation de provenance, utile pour retrouver d'où
vient telle couleur, tel texte ou telle photo.

## `maquette-source.html`

La maquette validée, six pages, telle que fournie (12,8 Mo).

C'est un **bundle auto-extractible** : le fichier ne contient pas directement du
HTML lisible, mais trois îlots de données que son script de démarrage
déballe côté navigateur.

| Balise | Contenu |
| --- | --- |
| `<script type="__bundler/manifest">` | 51 ressources en base64 — 34 images, 13 polices woff2, 4 scripts |
| `<script type="__bundler/template">` | Le markup réel, encodé en chaîne JSON (188 Ko) |
| `<script type="__bundler/ext_resources">` | Correspondance URL CDN → identifiant de ressource |

Le markup utilise le format `x-dc` (Claude Design canvas) : composant unique,
styles en ligne, navigation entre pages pilotée par `this.state.page`, et
directives `sc-if` / `sc-camel-on-click`.

Pour l'ouvrir : double-cliquer le fichier dans un navigateur, le script se
charge du reste.

**Ce qui en a été extrait :**

- les 34 photographies → `public/images/` (renommées selon leur usage) ;
- l'intégralité des textes → `server/data/content.ts` et
  `shared/utils/siteData.ts` ;
- la palette et la typographie → `app/assets/css/main.css` (bloc `@theme`) ;
- la structure des six pages → `app/pages/`.

Les écarts assumés entre cette maquette et le site livré sont listés dans le
README à la racine, section « Ce qui a été modifié par rapport à la maquette ».

## `identite/`

Les plaquettes commerciales TBS, source de vérité pour la raison sociale, les
coordonnées et la liste des métiers.

| Fichier | Ce qu'il atteste |
| --- | --- |
| `plaquette-tbs-recto-verso.jpeg` | Logo, coordonnées, huit domaines d'intervention |
| `plaquette-tbs-services.jpeg` | Même liste de services, visuels par métier |

Coordonnées confirmées par ces documents et reprises dans
`nuxt.config.ts` (`runtimeConfig.public`) :

- **(+228) 90 10 85 10** et **(+228) 97 80 08 80**
- **tbstogo228@gmail.com**
- **Agôè - Démakpoè**, Lomé — Togo

> À noter : la plaquette la plus ancienne imprime « DISTRIBUTIOIN » (coquille).
> Le site utilise partout l'orthographe correcte, **TBS Distribution S.A.R.L**.

## Ce qui n'a volontairement pas été versionné

- Les deux maquettes antérieures (`TBS Site.html`, `TBS Site 6 Pages -
  offline.html`) : quasi-doublons de celle-ci, pour 43 Mo supplémentaires.
- `H_50139650.pdf` : document dont le contenu n'a pas pu être lu (polices
  intégrées) et dont l'intitulé évoque une pièce administrative. À ajouter
  s'il relève bien du projet.
- Un logo « SINA » présent dans le dossier de travail : autre marque, sans
  rapport avec TBS.
