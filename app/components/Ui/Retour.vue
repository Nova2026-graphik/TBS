<script setup lang="ts">
/**
 * Retour à la page précédente, sur toutes les pages intérieures.
 *
 * Un visiteur qui descend de la galerie vers une page de domaine, ou du
 * sommaire Conseils vers un article, n'avait que la flèche du navigateur pour
 * remonter — invisible sur un téléphone en plein écran, et inexistante quand
 * l'arrivée s'est faite par un lien partagé.
 *
 * **C'est un vrai lien, pas un bouton.** Il porte toujours un `href` vers la
 * page parente : il fonctionne sans JavaScript, s'ouvre dans un nouvel onglet
 * au clic du milieu, et un moteur d'indexation y voit un chemin de remontée.
 * Le retour par l'historique n'est qu'une amélioration posée par-dessus.
 *
 * L'historique n'est suivi que lorsqu'il mène **à l'intérieur du site** :
 * `history.state.back` n'est renseigné que par une navigation interne. Sans
 * cette garde, un visiteur venu d'un moteur de recherche serait renvoyé hors
 * du site par un bouton qui promet le contraire.
 */
const props = defineProps<{
  /**
   * Page parente, en chemin non localisé (`/galerie`). Sans elle, la parente
   * est déduite du chemin courant — cf. `PARENTS`.
   */
  parent?: string
  /** Libellé, quand « Retour » seul serait trop vague. */
  label?: string
}>()

const { t } = useI18n()
const localePath = useLocalePath()
const route = useRoute()
const router = useRouter()

/**
 * Parentes des routes à segments. Déclarées plutôt que déduites en coupant le
 * dernier segment : `/galerie/equipements/outillage` remonte à `/galerie`, et
 * non à `/galerie/equipements`, qui n'est pas une page.
 */
const PARENTS: { motif: RegExp, parent: string }[] = [
  { motif: /^\/conseils\/.+/, parent: '/conseils' },
  { motif: /^\/galerie\/.+/, parent: '/galerie' },
  { motif: /^\/admin\/.+/, parent: '/admin' },
]

/** Chemin courant débarrassé du préfixe de langue, pour la comparaison. */
const cheminNu = computed(() => route.path.replace(/^\/en(?=\/|$)/, '') || '/')

const parent = computed(() => {
  if (props.parent) return props.parent
  return PARENTS.find(p => p.motif.test(cheminNu.value))?.parent ?? '/'
})

const lien = computed(() => localePath(parent.value))

/**
 * `history.state.back` est posé par le routeur à chaque navigation interne, et
 * reste nul sur une arrivée directe. Lu à la volée plutôt que mémorisé : il
 * change à chaque navigation, et le composant survit aux changements de page.
 */
function historiqueInterne(): boolean {
  if (import.meta.server) return false
  return typeof window.history.state?.back === 'string'
}

function auClic(event: MouseEvent) {
  // Un clic du milieu, ou avec une touche de modification, ouvre le lien :
  // c'est ce que le visiteur demande, et l'historique n'a rien à y faire.
  if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return
  if (!historiqueInterne()) return

  event.preventDefault()
  router.back()
}
</script>

<template>
  <div class="u-gutter">
    <NuxtLink
      :to="lien"
      class="group -ml-1 inline-flex min-h-11 items-center gap-2 py-2 pl-1 pr-2 text-[0.6875rem] uppercase tracking-[0.16em] text-ink-mute transition-colors duration-400 hover:text-ink focus-visible:text-ink"
      @click="auClic"
    >
      <svg
        viewBox="0 0 24 24"
        class="size-3.5 transition-transform duration-400 group-hover:-translate-x-0.5"
        fill="none"
        stroke="currentColor"
        stroke-width="1.6"
        aria-hidden="true"
      >
        <path d="M15 5l-7 7 7 7" stroke-linecap="round" stroke-linejoin="round" />
      </svg>
      {{ label ?? t('common.back') }}
    </NuxtLink>
  </div>
</template>
