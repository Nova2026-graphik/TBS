import type { Ref } from 'vue'

/**
 * Focus d'un dialogue modal : déplacé à l'ouverture, **piégé** tant qu'il est
 * ouvert, **rendu** à la fermeture.
 *
 * Trois dialogues partagent ce comportement — la visionneuse, la fiche
 * rapide, la feuille du bas — et deux d'entre eux ne piégeaient pas le
 * focus : Tab quittait la fenêtre et parcourait la page masquée derrière,
 * sans que rien ne se voie. WAI-ARIA demande que Tab boucle dans un dialogue
 * modal ; c'est ici que la boucle est écrite, une fois.
 *
 * Le retour du focus compte autant que le piège : sans lui, fermer la
 * visionneuse laisse le focus sur `<body>`, et l'utilisateur au clavier
 * repart du haut de la page au lieu de la vignette qu'il venait d'ouvrir.
 *
 * Le verrouillage du défilement fait partie du lot : un dialogue ouvert sur
 * une page qui défile derrière est un dialogue qu'on perd.
 */
const FOCUSABLE = [
  'a[href]', 'button:not([disabled])', 'input:not([disabled])',
  'select:not([disabled])', 'textarea:not([disabled])', '[tabindex]:not([tabindex="-1"])',
].join(',')

export function useDialogueFocus(dialogue: Ref<HTMLElement | null>, ouvert: Ref<boolean>) {
  /** L'élément qui avait le focus avant l'ouverture, pour le lui rendre. */
  let precedent: HTMLElement | null = null

  function focusables(): HTMLElement[] {
    const racine = dialogue.value
    if (!racine) return []
    return [...racine.querySelectorAll<HTMLElement>(FOCUSABLE)]
      .filter(el => el.offsetParent !== null || el === racine)
  }

  function piege(event: KeyboardEvent) {
    if (event.key !== 'Tab' || !dialogue.value) return
    const liste = focusables()
    if (!liste.length) {
      event.preventDefault()
      dialogue.value.focus()
      return
    }
    const premier = liste[0]!
    const dernier = liste[liste.length - 1]!
    const actif = document.activeElement

    if (event.shiftKey && (actif === premier || actif === dialogue.value)) {
      event.preventDefault()
      dernier.focus()
    }
    else if (!event.shiftKey && actif === dernier) {
      event.preventDefault()
      premier.focus()
    }
  }

  watch(ouvert, async (valeur) => {
    if (import.meta.server) return
    if (valeur) {
      precedent = document.activeElement as HTMLElement | null
      document.documentElement.style.overflow = 'hidden'
      document.addEventListener('keydown', piege)
      await nextTick()
      dialogue.value?.focus()
    }
    else {
      document.documentElement.style.overflow = ''
      document.removeEventListener('keydown', piege)
      // `?.focus` : l'élément d'origine peut avoir disparu — une carte
      // retirée par un filtre — et il n'y a alors rien à rendre.
      precedent?.focus?.()
      precedent = null
    }
  })

  onBeforeUnmount(() => {
    if (import.meta.server) return
    document.documentElement.style.overflow = ''
    document.removeEventListener('keydown', piege)
  })
}
