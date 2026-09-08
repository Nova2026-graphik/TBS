# Reportage photo — cahier de tournage

Les trente-trois photographies du site proviennent de la maquette : ce sont des
images de banque. Elles sont belles, et c'est le problème. La galerie annonce
« Mariage Adjovi — 620 invités, Agôè » sous un cliché pris ailleurs ; un
visiteur qui reconnaît l'image — et beaucoup les reconnaissent — perd confiance
d'un coup.

Ce document sert à commander et à réceptionner le reportage. Il n'y a rien à
coder : le remplacement se fait **fichier par fichier**, en conservant les noms.

---

## Consignes techniques

| Point | Consigne | Pourquoi |
| --- | --- | --- |
| Largeur | **2400 px minimum** | Les sources actuelles plafonnent toutes à 1400 px. Le site sert du 100vw sur le hero : au-delà de 1400, il ne peut qu'agrandir. Voir la note en fin de document. |
| Format | 3:2 paysage par défaut ; 2:3 portrait pour les six fichiers signalés | Le cadrage du site est déjà réglé sur ces proportions |
| Fichier | JPEG qualité 85+, sRGB, sans filigrane | La conversion en WebP et le redimensionnement sont automatiques |
| Lumière | Naturelle autant que possible, pas de flash direct | La charte du site est chaude et douce ; un flash frontal jure |
| Retouche | Recadrage, exposition, balance des blancs. Pas de ciel remplacé, pas de peau lissée | Ce qui doit se voir, c'est le matériel réellement livré |
| Autorisations | **Écrites**, pour toute personne reconnaissable et pour chaque client dont l'événement est montré | Sans elles, les photos ne sont pas publiables |

Livraison attendue : les fichiers nommés **exactement** comme ci-dessous,
plus les originaux non recadrés dans un dossier à part.

---

## Ce qu'il faut photographier

Une demi-journée suffit pour l'essentiel. L'ordre ci-dessous est celui de la
valeur décroissante : si le temps manque, on s'arrête en cours de liste.

### 1. Deux ou trois réceptions réellement équipées — cœur du site

| Fichier à produire | Sujet | Format |
| --- | --- | --- |
| `hero-reception.jpg` | Salle dressée, plan large, avant l'arrivée des invités | 2:3 portrait |
| `galerie-mariage-adjovi.jpg` | Le mariage annoncé en légende, vue d'ensemble | 3:2 |
| `galerie-diner-gala.jpg` | Dîner de gala, 400 couverts, plan large | 3:2 |
| `galerie-ceremonie-officielle.jpg` | Cérémonie officielle, tribune et public | 3:2 |
| `galerie-bapteme.jpg` | Baptême sous chapiteau | 3:2 |
| `galerie-soiree-blanche.jpg` | Réception de nuit, éclairage en place | 3:2 |
| `galerie-seminaire.jpg` | Séminaire, salle en configuration conférence | 3:2 |
| `galerie-vin-honneur.jpg` | Vin d'honneur en extérieur | 3:2 |
| `branche-events.jpg` | Une salle qui représente la branche Events | 3:2 |

**Le plan large avant l'arrivée des invités est le cliché le plus important du
site.** C'est celui qui montre le travail de montage, et le seul qui puisse
être pris sans autorisation individuelle.

### 2. Détails de dressage — ce qui prouve le niveau de finition

| Fichier | Sujet | Format |
| --- | --- | --- |
| `galerie-centre-de-table.jpg` | Centre de table, saison sèche | 3:2 |
| `galerie-verrerie.jpg` | Art de la table, ligne ivoire — verrerie et couverts | 3:2 |
| `events-dressage-or.jpg` | Dressage ligne or, vue rapprochée | 2:3 portrait |
| `categorie-nappage.jpg` | Nappage et chemins de table | 3:2 |
| `categorie-art-de-la-table.jpg` | Assiettes, verres, couverts en pile ordonnée | 2:3 portrait |
| `categorie-decoration.jpg` | Décoration florale ou drapé | 3:2 |

### 3. L'entrepôt d'Agôè-Démakpoè — ce qui prouve la capacité

| Fichier | Sujet | Format |
| --- | --- | --- |
| `apropos-entrepot.jpg` | Allée de stockage, matériel rangé, plan large | 3:2 |
| `categorie-mobilier.jpg` | Chaises et tables empilées, quantité visible | 3:2 |
| `categorie-tentes.jpg` | Chapiteaux pliés ou montés | 2:3 portrait |
| `categorie-son-lumiere.jpg` | Sonorisation et éclairage, matériel aligné | 2:3 portrait |

**Montrer la quantité.** Un rayonnage plein dit « 900 références » mieux que
la phrase qui l'annonce.

### 4. L'équipe — ce qui humanise

| Fichier | Sujet | Format |
| --- | --- | --- |
| `apropos-equipe.jpg` | L'équipe en plein montage de salle, en action | 2:3 portrait |
| `etudes-formation.jpg` | Session de formation ou réunion de conseil | 3:2 |
| *(nouveau)* `apropos-gerant.jpg` | Portrait du gérant, cadrage buste, fond neutre | 3:2 |

Le portrait du gérant n'a pas d'emplacement aujourd'hui : il en faudra un sur
la page À propos, ce qui demande une petite modification du gabarit. À signaler
quand la photo existera.

### 5. Livraisons Équipements — les moins crédibles aujourd'hui

| Fichier | Sujet | Format |
| --- | --- | --- |
| `equipements-informatique.jpg` | Postes informatiques livrés et installés | 3:2 |
| `equipements-laboratoire.jpg` | Équipement de laboratoire en place chez un client | 3:2 |
| `equipements-materiel-roulant.jpg` | Véhicules livrés, flotte alignée | 3:2 |
| `branche-equipements.jpg` | Plateau de bureaux équipé | 3:2 |
| `branche-etudes.jpg` | Aménagement de bureaux terminé | 2:3 portrait |

### 6. Agro

| Fichier | Sujet | Format |
| --- | --- | --- |
| `branche-agro.jpg` | Parcelle ou équipement agricole en usage | 3:2 |
| `agro-transformation.jpg` | Unité de transformation, matériel en fonctionnement | 3:2 |

### Dix-sept fichiers passent aussi en en-tête de page

Depuis que les en-têtes de page portent une planche-contact
(`app/components/Ui/PageHero.vue`), dix-sept de ces fichiers apparaissent une
seconde fois, en **vignette carrée d'environ 170 px**, tout en haut d'une page :

| Page | Fichiers |
| --- | --- |
| `/galerie` | `galerie-mariage-adjovi`, `galerie-ceremonie-officielle`, `galerie-diner-gala`, `galerie-verrerie` |
| `/services` | `branche-equipements`, `branche-events`, `branche-etudes`, `branche-agro` |
| `/conseils` | `events-dressage-or`, `categorie-nappage`, `categorie-art-de-la-table` |
| `/contact` | `apropos-equipe`, `apropos-entrepot`, `equipements-materiel-roulant` |
| `/faq` | `categorie-tentes`, `categorie-mobilier`, `categorie-son-lumiere` |

Une seule conséquence pour le tournage : **le sujet doit tenir dans un carré
centré**. Un plan large où l'essentiel est sur un bord passera en pleine
largeur plus bas dans la page, mais se retrouvera coupé en vignette. Cadrer en
gardant le sujet au centre, quitte à laisser de l'air autour — le recadrage
carré est automatique, il n'y a rien à livrer de plus.

### 7. Ambiances — les plus remplaçables

`ambiance-blanc-or.jpg`, `ambiance-cocktail.jpg`,
`ambiance-nuit-electrique.jpg`, `events-mobilier.jpg`,
`events-scenographie.jpg`.

Ces cinq images servent d'illustrations secondaires. Elles peuvent attendre un
second passage, ou être retirées si la matière manque — mieux vaut vingt vraies
photos que trente dont dix sont fausses.

---

## À réunir en parallèle

Ces quatre éléments valent, à eux seuls, autant que le reportage.

**Études de cas chiffrées.** « 620 invités, 3 salles, montage en 6 heures,
12 personnes » vaut mieux qu'une légende. Deux ou trois cas détaillés
transforment la galerie en argumentaire, et donnent la matière des articles de
la rubrique Conseils.

**Logos de clients**, avec accord écrit — institutions, hôtels, ONG. C'est le
signal de confiance qui manque le plus au site aujourd'hui. Un bandeau de six
logos sur l'accueil change la lecture de la page.

**Catalogue PDF.** Un acheteur institutionnel veut une pièce jointe à
transmettre en interne. C'est aussi un bon prétexte à recueillir une adresse
e-mail.

**Témoignages nommés et photographiés.** Les trois témoignages actuels sont
crédibles mais anonymes : un nom, une fonction et un visage les rendent
vérifiables.

---

## Remplacement des fichiers

Aucune intervention sur le code n'est nécessaire, à trois conditions :

1. **Conserver les noms de fichiers** à l'identique.
2. **Conserver les proportions** indiquées (paysage ou portrait). Un portrait
   remplacé par un paysage se recadre différemment et peut couper un sujet.
3. **Relire les textes alternatifs** de `server/data/content.ts` : ils décrivent
   la photo actuelle, pas la nouvelle. Une description fausse est pire
   qu'absente pour un lecteur d'écran.

Ces trois conditions ne tiennent pas toutes seules. Une promesse écrite dans
un document finit par être rompue le jour de la livraison, quand un fichier
arrive en paysage là où le site attend un portrait. Elles sont donc vérifiées :

```bash
npm run photos:check
```

Le script compare `public/images` à `docs/photos-reference.json`, qui
enregistre la géométrie attendue de chaque fichier. Il échoue si une image
manque, change d'orientation, s'écarte de ses proportions de plus de 2 % ou
perd en définition ; il signale aussi toute image citée dans le code sans
exister sur le disque. Les fichiers encore sous 2400 px sont comptés, pas
reprochés — ce sont les images de maquette, et c'est l'objet du reportage.

Après remplacement :

```bash
npm run photos:check            # noms, orientations, proportions
npm run photos:check -- --enregistrer   # une fois la livraison acceptée
npm run icons:generate          # les cartes sociales reprennent les nouvelles photos
npm run build
```

La référence n'est réenregistrée **qu'après relecture** : la régénérer sans
regarder reviendrait à valider d'avance tout ce que le script doit arrêter.

## Note sur la définition

Les trente-trois sources font **exactement 1400 px de large**. C'est la limite
haute de ce que le site peut servir : au-delà, le redimensionneur ne fait que
recopier l'original. Sur un grand écran, le hero est donc affiché en dessous de
sa taille naturelle.

Des originaux à 2400 px lèveraient cette limite. Il faudrait alors élargir
l'échelle de `image.screens` dans `nuxt.config.ts` — une ligne, à faire le jour
où les vraies photos arrivent.

## Note sur les droits

Le README indique que les photographies de la maquette « proviennent d'une
banque d'images et sont destinées à être remplacées ». Tant qu'elles sont en
ligne, il faut s'assurer que la licence couvre bien l'usage commercial du site.
Les crédits relevés dans le bundle d'origine — Lukas, Nastuh Abootalebi, Mimi
Thian, Gabriel Jimenez, Quang Nguyen Vinh — renvoient à Unsplash, dont la
licence l'autorise ; cela reste à confirmer photo par photo si le doute existe.
