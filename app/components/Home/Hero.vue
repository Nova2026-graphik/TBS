<script setup lang="ts">
import type { Branch } from '#shared/types'

/**
 * Hero d'accueil : cinq diapositives défilent, cinq secondes chacune.
 *
 * La première présente **TBS Distribution**, la maison qui réunit les quatre
 * branches ; les quatre suivantes présentent chaque branche. Sans elle, un
 * visiteur qui arrivait pendant la rotation ne voyait jamais que « TBS Agro Business »
 * ou « TBS Événementiel » : l'ensemble n'était nommé nulle part au-dessus de la
 * ligne de flottaison, alors que c'est la promesse du site — un seul
 * interlocuteur pour quatre métiers.
 *
 * Ce qui tourne : la photo de fond, le sur-titre, **le titre**, la
 * description, la couleur d'accent et la destination du premier appel à
 * l'action. Chaque diapositive annonce ce qu'elle fait.
 *
 * Le `<h1>` reste unique dans le plan du document — c'est son contenu qui
 * change, pas son rang. La diapositive de tête porte la formule générale,
 * celle que les moteurs indexent puisqu'elle sort du rendu serveur.
 *
 * Trois contraintes ont dicté la mise en œuvre :
 *
 *  - **LCP.** La première image est préchargée ; les quatre autres n'entrent
 *    dans le DOM qu'après l'événement `load` de la page. Un `loading="lazy"`
 *    n'aurait rien réglé : les cinq images étant dans la fenêtre, elles
 *    partiraient toutes en même temps et se disputeraient la bande passante
 *    avec l'image qui, elle, doit s'afficher tout de suite.
 *  - **WCAG 2.2.2.** Un contenu qui défile seul au-delà de cinq secondes doit
 *    pouvoir être arrêté. Le compte ne porte pas sur une diapositive mais sur
 *    la rotation, qui ne s'arrête jamais d'elle-même : l'exigence tient donc
 *    à cinq secondes comme à quinze. Pause au survol, au focus clavier, quand
 *    l'onglet passe en arrière-plan, et par un bouton explicite.
 *  - **`prefers-reduced-motion`.** La rotation est alors *désactivée*, pas
 *    accélérée. La réduction globale de `main.css` ramène les durées à
 *    0,01 ms, ce qui ferait sauter le contenu d'un cliché à l'autre toutes
 *    les cinq secondes — exactement ce que le réglage cherche à éviter.
 */
const props = defineProps<{ branches: Branch[] }>()

const { t, te } = useI18n()

/** Durée d'affichage d'une diapositive. */
const DUREE_MS = 5_000

/** Cadence du minuteur : 50 pas par diapositive, assez fin pour une barre fluide. */
const PAS_MS = 100

/**
 * Photo et couleur de la diapositive de tête.
 *
 * `hero-reception.jpg` est déjà l'image de référence de la maison — celle du
 * JSON-LD `LocalBusiness` et des cartes de partage produites par
 * `npm run icons:generate`. La crème, elle, n'appartient à aucune branche :
 * le segment de la maison ne se confond donc avec aucun des quatre autres,
 * là où l'or aurait doublé celui des Équipements.
 */
const IMAGE_MAISON = '/images/hero-reception.jpg'
const COULEUR_MAISON = 'var(--color-cream)'

const sizesFull = SIZES_FULL
const densitiesFull = DENSITIES_FULL

const section = ref<HTMLElement | null>(null)

interface Diapositive {
  key: string
  name: string
  tagline: string
  description: string
  /** Couleur d'accent : filet du sur-titre et remplissage du segment. */
  color: string
  image: string
  imageAlt: string
  /** Destination du premier appel à l'action. */
  to: string
}

/**
 * La maison d'abord, puis les branches dans leur ordre d'affichage — pas
 * celui de la base.
 */
const diapositives = computed<Diapositive[]>(() => [
  {
    key: 'maison',
    name: t('hero.house.name'),
    tagline: t('hero.house.tagline'),
    description: t('hero.lead'),
    color: COULEUR_MAISON,
    image: IMAGE_MAISON,
    imageAlt: t('hero.imageAlt'),
    to: '/services',
  },
  ...[...props.branches]
    .sort((a, b) => a.index - b.index)
    .map(branche => ({
      key: branche.slug,
      name: branche.name,
      tagline: branche.tagline,
      description: accroche(branche.slug, branche.description),
      color: brandColor(branche.color),
      image: branche.image,
      imageAlt: branche.imageAlt,
      to: `/services?branche=${versUrl(branche.slug)}`,
    })),
])

const actif = ref(0)
const courante = computed(() => diapositives.value[actif.value])

/**
 * Accroche de la diapositive, avec repli sur la description de la branche.
 *
 * Les descriptions de `content.ts` sont écrites pour les cartes de la section
 * « quatre branches », où l'on prend le temps de lire : jusqu'à 202
 * caractères, soit quatre lignes dans le hero. Une diapositive dure cinq
 * secondes ; il lui faut une phrase, pas un paragraphe.
 */
function accroche(cle: string, repli: string): string {
  const chemin = `hero.branchLeads.${cle}`
  return te(chemin) ? t(chemin) : repli
}

/**
 * Titre de la diapositive affichée, avec repli sur la formule générale.
 *
 * La maison n'a pas d'entrée dans `hero.branchTitles` : elle tombe donc
 * naturellement sur `hero.titleLine1/2`, la promesse d'ensemble. Une branche
 * ajoutée sans sa traduction fait de même, plutôt que d'afficher une clé i18n
 * en caractères de six centimètres.
 */
function titre(cle: string | undefined, ligne: 1 | 2): string {
  const chemin = `hero.branchTitles.${cle}.line${ligne}`
  return cle && te(chemin) ? t(chemin) : t(`hero.titleLine${ligne}`)
}

/**
 * Description la plus longue, rendue en double invisible pour réserver la
 * hauteur du bloc. Sans elle, le pied du hero remonterait et redescendrait à
 * chaque diapositive — un décalage de mise en page toutes les cinq secondes,
 * là où le site affiche aujourd'hui un CLS de 0.
 */
const gabarit = computed(() =>
  diapositives.value.reduce(
    (plus, d) => (d.description.length > plus.length ? d.description : plus),
    '',
  ),
)

/** Écoulé sur la diapositive courante, en millisecondes. */
const ecoule = ref(0)
const progression = computed(() => Math.min(ecoule.value / DUREE_MS, 1))

const enPauseManuelle = ref(false)
const focusDedans = ref(false)
const survole = useElementHover(section)
const visibilite = useDocumentVisibility()
const mouvementReduit = usePreferredReducedMotion()

/**
 * La rotation automatique n'a lieu que s'il y a de quoi tourner et que le
 * visiteur ne demande pas moins d'animation.
 */
const rotationAutomatique = computed(
  () => diapositives.value.length > 1 && mouvementReduit.value !== 'reduce',
)

const enPause = computed(
  () =>
    enPauseManuelle.value
    || survole.value
    || focusDedans.value
    || visibilite.value === 'hidden',
)

/**
 * Le minuteur tourne en continu et n'accumule que hors pause : la barre de
 * progression et le changement de diapositive lisent ainsi la même horloge.
 * Un `useIntervalFn` de cinq secondes qu'on met en pause repartirait de zéro
 * à la reprise, et la barre se désynchroniserait aussitôt.
 */
useIntervalFn(() => {
  if (!rotationAutomatique.value || enPause.value) return

  ecoule.value += PAS_MS
  if (ecoule.value >= DUREE_MS) suivante()
}, PAS_MS)

function suivante() {
  aller((actif.value + 1) % diapositives.value.length)
}

function aller(index: number) {
  actif.value = index
  ecoule.value = 0
}

/**
 * Les quatre autres images n'arrivent qu'une fois la page chargée. `load` a
 * déjà pu passer au moment de l'hydratation — d'où la vérification de
 * `readyState`, sans laquelle l'événement ne viendrait jamais.
 */
const imagesSecondaires = ref(false)

onMounted(() => {
  if (document.readyState === 'complete') {
    imagesSecondaires.value = true
    return
  }
  useEventListener(window, 'load', () => {
    imagesSecondaires.value = true
  }, { once: true })
})

/** Visible dès le rendu serveur : sans JavaScript, le hero reste lisible et fixe. */
function estRendue(index: number) {
  return index === 0 || imagesSecondaires.value
}
</script>

<template>
  <section
    ref="section"
    class="relative min-h-[31.25rem] overflow-hidden bg-ink"
    style="height: min(88svh, 58.75rem)"
    @focusin="focusDedans = true"
    @focusout="focusDedans = false"
  >
    <!--
      Les images sont empilées et se croisent en fondu : l'image sortante reste
      sous l'entrante, aucun aplat de fond n'apparaît entre deux clichés. Le
      zoom lent repart à chaque diapositive, par la seule bascule de classe.
    -->
    <div class="pointer-events-none absolute inset-0">
      <template v-for="(diapo, i) in diapositives" :key="diapo.key">
        <div
          v-if="estRendue(i)"
          class="hero-cliche absolute inset-0"
          :class="i === actif ? 'is-active' : ''"
          aria-hidden="true"
        >
          <NuxtImg
            :src="diapo.image"
            :alt="i === actif ? diapo.imageAlt : ''"
            preset="hero"
            :preload="i === 0"
            :fetchpriority="i === 0 ? 'high' : 'low'"
            :sizes="sizesFull"
            :densities="densitiesFull"
            width="1920"
            height="1280"
            class="size-full object-cover"
          />
        </div>
      </template>
    </div>

    <!-- Dégradé : contraste garanti sur le texte, quel que soit le cliché. -->
    <div class="u-scrim-portrait pointer-events-none absolute inset-0" />

    <div class="u-gutter pointer-events-none absolute inset-0 flex flex-col justify-end gap-[clamp(1.125rem,2.6vw,2.125rem)] pb-[clamp(2.125rem,5vw,4.5rem)] pt-[clamp(2.25rem,6vw,5.75rem)]">
      <!--
        `aria-live="off"` : le bloc change tout seul, il ne doit pas être
        réannoncé en cours de lecture. Les puces, elles, nomment leur cible.
      -->
      <div class="flex items-center gap-3.5 text-white/80" aria-live="off">
        <span
          class="h-px w-8 shrink-0 transition-colors duration-700"
          :style="{ background: courante?.color ?? 'currentColor' }"
        />
        <Transition name="hero-texte" mode="out-in">
          <span :key="courante?.key ?? 'defaut'" class="text-[0.6875rem] uppercase tracking-[0.28em]">
            {{ courante ? `${courante.name} — ${courante.tagline}` : $t('hero.eyebrow') }}
          </span>
        </Transition>
      </div>

      <!--
        Les cinq titres sont empilés invisibles dans la même cellule : la
        rangée prend la hauteur du plus haut, et le bloc ne bouge plus d'une
        diapositive à l'autre. Réserver d'après la plus longue chaîne ne
        suffisait pas — à 1280 px, « Équiper vos réceptions, du montage à la
        reprise » se replie sur une ligne de plus que le couple le plus long
        pris ligne à ligne, et débordait de 86 px.

        Ce sont des `<p>`, pas des `<h1>` : la page doit garder exactement un
        titre de premier rang.
      -->
      <!--
        `max-w-[17em]` appartient aux éléments en `text-display`, pas à la
        grille : `em` se rapporte à la taille de police de l'élément qui le
        porte. Sur la grille, en corps de texte, la mesure valait 272 px au
        lieu de 1458 — le titre se repliait sur cinq lignes et débordait.
      -->
      <div class="grid" aria-live="off">
        <p
          v-for="diapo in diapositives"
          :key="`gabarit-${diapo.key}`"
          class="invisible col-start-1 row-start-1 max-w-[17em] text-display"
          aria-hidden="true"
        >
          {{ titre(diapo.key, 1) }}<br>
          <span class="italic">{{ titre(diapo.key, 2) }}</span>
        </p>
        <Transition name="hero-texte" mode="out-in">
          <h1
            :key="courante?.key ?? 'defaut'"
            class="col-start-1 row-start-1 max-w-[17em] text-display text-white"
          >
            {{ titre(courante?.key, 1) }}<br>
            <span class="italic text-cream">{{ titre(courante?.key, 2) }}</span>
          </h1>
        </Transition>
      </div>

      <!-- La grille superpose gabarit et texte : la hauteur ne bouge plus. -->
      <div class="grid max-w-[48ch]" aria-live="off">
        <p
          class="invisible col-start-1 row-start-1 text-[clamp(0.9375rem,1.45vw,1.125rem)] leading-[1.75]"
          aria-hidden="true"
        >
          {{ gabarit }}
        </p>
        <Transition name="hero-texte" mode="out-in">
          <p
            :key="courante?.key ?? 'defaut'"
            class="col-start-1 row-start-1 text-[clamp(0.9375rem,1.45vw,1.125rem)] leading-[1.75] text-white/85"
          >
            {{ courante?.description ?? $t('hero.lead') }}
          </p>
        </Transition>
      </div>

      <div class="pointer-events-auto flex flex-wrap gap-3">
        <UiButton :to="courante?.to ?? '/services'" variant="light" size="lg">
          {{ $t('common.discoverServices') }}
        </UiButton>
        <UiButton to="/contact" variant="outline" size="lg">{{ $t('common.quote') }}</UiButton>
      </div>

      <!--
        Cinq segments : celui de la diapositive affichée se remplit sur les
        cinq secondes, et cesse de se remplir dès que la rotation est en
        pause — ce qui rend l'état visible sans avoir à l'écrire.
      -->
      <div v-if="diapositives.length > 1" class="pointer-events-auto flex items-center gap-3">
        <button
          v-for="(diapo, i) in diapositives"
          :key="diapo.key"
          type="button"
          class="group flex h-11 w-14 items-center"
          :aria-label="$t('hero.showBranch', { branch: diapo.name })"
          :aria-current="i === actif ? 'true' : undefined"
          @click="aller(i)"
        >
          <span class="relative block h-0.5 w-full overflow-hidden bg-white/30 transition-colors duration-500 group-hover:bg-white/50">
            <span
              class="absolute inset-y-0 left-0 transition-[width] duration-100 ease-linear"
              :style="{
                width: i === actif ? `${progression * 100}%` : '0%',
                background: diapo.color,
              }"
            />
          </span>
        </button>

        <!-- WCAG 2.2.2 : l'arrêt doit être explicite, pas seulement au survol. -->
        <button
          v-if="rotationAutomatique"
          type="button"
          class="flex size-11 items-center justify-center text-white/70 transition-colors duration-500 hover:text-white"
          :aria-label="enPauseManuelle ? $t('hero.resume') : $t('hero.pause')"
          :aria-pressed="enPauseManuelle"
          @click="enPauseManuelle = !enPauseManuelle"
        >
          <svg viewBox="0 0 24 24" class="size-4" fill="currentColor" aria-hidden="true">
            <path v-if="enPauseManuelle" d="M8 5v14l11-7z" />
            <path v-else d="M7 5h3.5v14H7zM13.5 5H17v14h-3.5z" />
          </svg>
        </button>
      </div>
    </div>
  </section>
</template>

<style scoped>
/**
 * Fondu croisé et zoom lent.
 *
 * Le zoom court sur toute la durée d'une diapositive plutôt que sur 2,6 s :
 * un mouvement continu et à peine perceptible tient mieux qu'une amorce qui
 * s'arrête. L'amplitude suit la durée — 2,5 % sur six secondes avancent à la
 * même vitesse que les 6 % sur seize secondes d'avant, là où les garder
 * aurait rendu la dérive voyante. Le retour à l'échelle 1 se fait pendant que
 * l'image s'efface, il ne se voit pas.
 */
.hero-cliche {
  opacity: 0;
  transform: scale(1);
  transition:
    opacity 1s var(--ease-out-expo),
    transform 6s linear;
  will-change: opacity, transform;
}

.hero-cliche.is-active {
  opacity: 1;
  transform: scale(1.025);
}

/* Le texte suit l'image avec un léger décalage, dans l'esprit de la
   transition de page. */
.hero-texte-enter-active {
  transition:
    opacity 0.5s var(--ease-out-expo) 0.12s,
    transform 0.5s var(--ease-out-expo) 0.12s;
}

.hero-texte-leave-active {
  transition:
    opacity 0.28s var(--ease-out-expo),
    transform 0.28s var(--ease-out-expo);
}

.hero-texte-enter-from {
  opacity: 0;
  transform: translateY(12px);
}

.hero-texte-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}
</style>
