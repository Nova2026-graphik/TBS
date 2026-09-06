<script setup lang="ts">
import type { Branch } from '#shared/types'

/**
 * Hero d'accueil : les quatre branches défilent, quinze secondes chacune.
 *
 * Ce qui tourne : la photo de fond, le sur-titre, la description, la couleur
 * d'accent et la destination du premier appel à l'action. Ce qui ne tourne
 * pas : le `<h1>`. C'est l'ancrage de référencement de la page, et le plan du
 * document n'a pas à changer toutes les quinze secondes.
 *
 * Trois contraintes ont dicté la mise en œuvre :
 *
 *  - **LCP.** La première image est préchargée ; les trois autres n'entrent
 *    dans le DOM qu'après l'événement `load` de la page. Un `loading="lazy"`
 *    n'aurait rien réglé : les quatre images étant dans la fenêtre, elles
 *    partiraient toutes en même temps et se disputeraient la bande passante
 *    avec l'image qui, elle, doit s'afficher tout de suite.
 *  - **WCAG 2.2.2.** Un contenu qui défile seul au-delà de cinq secondes doit
 *    pouvoir être arrêté : pause au survol, au focus clavier, quand l'onglet
 *    passe en arrière-plan, et par un bouton explicite.
 *  - **`prefers-reduced-motion`.** La rotation est alors *désactivée*, pas
 *    accélérée. La réduction globale de `main.css` ramène les durées à
 *    0,01 ms, ce qui ferait sauter le contenu d'un cliché à l'autre toutes
 *    les quinze secondes — exactement ce que le réglage cherche à éviter.
 */
const props = defineProps<{ branches: Branch[] }>()

/** Durée d'affichage d'une branche. */
const DUREE_MS = 15_000

/** Cadence du minuteur : 150 pas par branche, assez fin pour une barre fluide. */
const PAS_MS = 100

const sizesFull = SIZES_FULL
const densitiesFull = DENSITIES_FULL

const section = ref<HTMLElement | null>(null)

/** Ordre d'affichage : celui des branches, pas celui de la base. */
const branches = computed(() => [...props.branches].sort((a, b) => a.index - b.index))

const actif = ref(0)
const courante = computed(() => branches.value[actif.value])

/**
 * Description la plus longue, rendue en double invisible pour réserver la
 * hauteur du bloc. Sans elle, le pied du hero remonterait et redescendrait à
 * chaque branche — un décalage de mise en page toutes les quinze secondes,
 * là où le site affiche aujourd'hui un CLS de 0.
 */
const gabarit = computed(() =>
  branches.value.reduce(
    (plus, b) => (b.description.length > plus.length ? b.description : plus),
    '',
  ),
)

/** Écoulé sur la branche courante, en millisecondes. */
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
  () => branches.value.length > 1 && mouvementReduit.value !== 'reduce',
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
 * progression et le changement de branche lisent ainsi la même horloge. Un
 * `useIntervalFn` de quinze secondes qu'on met en pause repartirait de zéro à
 * la reprise, et la barre se désynchroniserait aussitôt.
 */
useIntervalFn(() => {
  if (!rotationAutomatique.value || enPause.value) return

  ecoule.value += PAS_MS
  if (ecoule.value >= DUREE_MS) suivante()
}, PAS_MS)

function suivante() {
  aller((actif.value + 1) % branches.value.length)
}

function aller(index: number) {
  actif.value = index
  ecoule.value = 0
}

/**
 * Les trois autres images n'arrivent qu'une fois la page chargée. `load` a
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
      zoom lent repart à chaque branche, par la seule bascule de classe.
    -->
    <div class="pointer-events-none absolute inset-0">
      <template v-for="(branche, i) in branches" :key="branche.slug">
        <div
          v-if="estRendue(i)"
          class="hero-cliche absolute inset-0"
          :class="i === actif ? 'is-active' : ''"
          aria-hidden="true"
        >
          <NuxtImg
            :src="branche.image"
            :alt="i === actif ? branche.imageAlt : ''"
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
    <div
      class="pointer-events-none absolute inset-0"
      style="background: linear-gradient(180deg, rgb(62 53 36 / 0.55) 0%, rgb(62 53 36 / 0.24) 40%, rgb(62 53 36 / 0.88) 100%)"
    />

    <div class="u-gutter pointer-events-none absolute inset-0 flex flex-col justify-end gap-[clamp(1.125rem,2.6vw,2.125rem)] pb-[clamp(2.125rem,5vw,4.5rem)] pt-[clamp(2.25rem,6vw,5.75rem)]">
      <!--
        `aria-live="off"` : le bloc change tout seul, il ne doit pas être
        réannoncé en cours de lecture. Les puces, elles, nomment leur branche.
      -->
      <div class="flex items-center gap-3.5 text-white/80" aria-live="off">
        <span
          class="h-px w-8 shrink-0 transition-colors duration-700"
          :style="{ background: courante?.color ?? 'currentColor' }"
        />
        <Transition name="hero-texte" mode="out-in">
          <span :key="courante?.slug ?? 'defaut'" class="text-[0.6875rem] uppercase tracking-[0.28em]">
            {{ courante ? `${courante.name} — ${courante.tagline}` : 'Lomé — Togo' }}
          </span>
        </Transition>
      </div>

      <!-- Fixe : ancrage SEO et plan du document. -->
      <h1 class="max-w-[17em] text-display text-white">
        Équiper vos réceptions,<br>
        <span class="italic text-cream">fournir vos projets</span>
      </h1>

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
            :key="courante?.slug ?? 'defaut'"
            class="col-start-1 row-start-1 text-[clamp(0.9375rem,1.45vw,1.125rem)] leading-[1.75] text-white/85"
          >
            {{ courante?.description ?? 'TBS Distribution réunit quatre branches : Équipements, Events, Études & Conseils et Agro. Fournir, équiper, conseiller et cultiver — un seul interlocuteur, à Lomé et partout au Togo.' }}
          </p>
        </Transition>
      </div>

      <div class="pointer-events-auto flex flex-wrap gap-3">
        <UiButton :to="courante ? `/services?branche=${courante.slug}` : '/services'" variant="light" size="lg">
          Découvrir nos services
        </UiButton>
        <UiButton to="/contact" variant="outline" size="lg">Demander un devis</UiButton>
      </div>

      <!--
        Quatre segments : celui de la branche affichée se remplit sur les
        quinze secondes, et cesse de se remplir dès que la rotation est en
        pause — ce qui rend l'état visible sans avoir à l'écrire.
      -->
      <div v-if="branches.length > 1" class="pointer-events-auto flex items-center gap-3">
        <button
          v-for="(branche, i) in branches"
          :key="branche.slug"
          type="button"
          class="group flex h-11 w-14 items-center"
          :aria-label="`Afficher ${branche.name}`"
          :aria-current="i === actif ? 'true' : undefined"
          @click="aller(i)"
        >
          <span class="relative block h-0.5 w-full overflow-hidden bg-white/30 transition-colors duration-500 group-hover:bg-white/50">
            <span
              class="absolute inset-y-0 left-0 transition-[width] duration-100 ease-linear"
              :style="{
                width: i === actif ? `${progression * 100}%` : i < actif ? '0%' : '0%',
                background: branche.color,
              }"
            />
          </span>
        </button>

        <!-- WCAG 2.2.2 : l'arrêt doit être explicite, pas seulement au survol. -->
        <button
          v-if="rotationAutomatique"
          type="button"
          class="flex size-11 items-center justify-center text-white/70 transition-colors duration-500 hover:text-white"
          :aria-label="enPauseManuelle ? 'Reprendre le défilement des branches' : 'Mettre en pause le défilement des branches'"
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
 * Le zoom court sur toute la durée d'une branche plutôt que sur 2,6 s : à
 * quinze secondes d'affichage, un mouvement continu et à peine perceptible
 * tient mieux qu'une amorce qui s'arrête. Le retour à l'échelle 1 se fait
 * pendant que l'image s'efface, il ne se voit pas.
 */
.hero-cliche {
  opacity: 0;
  transform: scale(1);
  transition:
    opacity 1s var(--ease-out-expo),
    transform 16s linear;
  will-change: opacity, transform;
}

.hero-cliche.is-active {
  opacity: 1;
  transform: scale(1.06);
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
