/**
 * Directive `v-reveal` — apparition à l'entrée dans le viewport.
 *
 *   <div v-reveal>…</div>
 *   <div v-reveal="120">…</div>   <!-- 120 ms de décalage -->
 *
 * Plugin universel : `getSSRProps` pose l'attribut et le délai dès le rendu
 * serveur (sinon l'élément apparaîtrait d'abord puis « sauterait » à
 * l'hydratation), le hook `mounted` ne s'exécute que côté client.
 *
 * Un IntersectionObserver unique est partagé par toute la page — bien moins
 * coûteux qu'un observateur par élément. Si `prefers-reduced-motion` est
 * actif, la directive révèle immédiatement sans animer.
 */
const REVEALED = 'is-revealed'

export default defineNuxtPlugin((nuxtApp) => {
  let observer: IntersectionObserver | null = null

  function getObserver(): IntersectionObserver {
    if (observer) return observer
    observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue
          entry.target.classList.add(REVEALED)
          observer!.unobserve(entry.target)
        }
      },
      { rootMargin: '0px 0px -6% 0px', threshold: 0.05 },
    )
    return observer
  }

  nuxtApp.vueApp.directive<HTMLElement, number | undefined>('reveal', {
    getSSRProps(binding) {
      const delay = typeof binding.value === 'number' && binding.value > 0 ? binding.value : 0
      return {
        'data-reveal': '',
        ...(delay ? { style: `--reveal-delay:${delay}ms` } : {}),
      }
    },

    mounted(el, binding) {
      el.setAttribute('data-reveal', '')
      if (typeof binding.value === 'number' && binding.value > 0) {
        el.style.setProperty('--reveal-delay', `${binding.value}ms`)
      }

      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        el.classList.add(REVEALED)
        return
      }

      getObserver().observe(el)
    },

    unmounted(el) {
      observer?.unobserve(el)
    },
  })
})
