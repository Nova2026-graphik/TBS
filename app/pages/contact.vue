<script setup lang="ts">
const info = useSiteInfo()

// `devis_ouvert` : le trafic qui atteint réellement le formulaire.
const { track } = useAnalytics()
onMounted(() => track(ANALYTICS_EVENTS.devisOuvert))

/**
 * La carte OpenStreetMap ne se charge qu'à la demande.
 *
 * Chargée d'office, elle envoyait l'adresse IP et le navigateur du visiteur à
 * un tiers avant la moindre action de sa part — sur une page dont l'objet est
 * précisément de recueillir des données personnelles. Ici, rien ne part tant
 * que la personne n'a pas cliqué.
 */
const mapVisible = ref(false)

/**
 * Cadrage de la carte.
 *
 * Avec les coordonnées de l'entrepôt en configuration, la carte se centre
 * dessus avec un marqueur et un lien d'itinéraire. Sans elles, on retombe sur
 * un cadre de quartier : approximatif, mais annoncé comme tel — l'inverse
 * d'un point précis et faux. Cf. `app/utils/businessLocation.ts`.
 */
const coords = parseCoordinates(info.geoLatitude, info.geoLongitude)

const QUARTIER_EMBED
  = 'https://www.openstreetmap.org/export/embed.html?bbox=1.13%2C6.20%2C1.25%2C6.28&layer=mapnik'
const QUARTIER_LINK = 'https://www.openstreetmap.org/#map=13/6.24/1.19'

const mapEmbed = coords ? mapEmbedUrl(coords) : QUARTIER_EMBED
const mapLink = coords ? mapLinkUrl(coords) : QUARTIER_LINK
const itineraire = coords ? directionsUrl(coords) : null

usePageSeo({
  title: 'Contact — demander un devis',
  description:
    'Une réception à équiper, un lot de fournitures, une étude ou une campagne agricole : précisez la branche concernée, un conseiller TBS vous rappelle sous 24 heures. Agôè-Démakpoè, Lomé.',
  path: '/contact',
})

useBreadcrumbSchema([{ name: 'Contact', path: '/contact' }])
</script>

<template>
  <div>
    <UiPageHero
      eyebrow="Contact"
      title="Demander"
      accent="un devis"
      lead="Une réception à équiper, un lot de fournitures, une étude ou une campagne agricole : précisez la branche concernée, un conseiller vous rappelle et vous envoie une proposition sous 24 heures."
    />

    <section class="u-gutter u-section grid gap-[clamp(2.5rem,5vw,5rem)] bg-white lg:grid-cols-[1.35fr_1fr]">
      <div v-reveal>
        <ContactForm />
      </div>

      <aside v-reveal="100" class="flex flex-col gap-8">
        <div class="bg-sand p-[clamp(1.5rem,3vw,2.25rem)]">
          <h2 class="u-eyebrow">
            <span class="u-rule" />
            Nous joindre
          </h2>

          <dl class="mt-7 divide-y divide-ink/10 border-t border-ink/10">
            <div class="py-4">
              <dt class="text-[0.6875rem] uppercase tracking-[0.18em] text-ink-mute">Téléphone</dt>
              <dd class="mt-2 flex flex-col gap-1">
                <a
                  :href="`tel:${info.phonePrimary}`"
                  class="text-[0.9375rem] text-ink transition-colors hover:text-gold"
                >{{ info.phoneDisplay }}</a>
                <a
                  :href="`tel:${info.phoneSecondary}`"
                  class="text-[0.9375rem] text-ink transition-colors hover:text-gold"
                >{{ info.phoneSecondaryDisplay }}</a>
              </dd>
            </div>

            <div class="py-4">
              <dt class="text-[0.6875rem] uppercase tracking-[0.18em] text-ink-mute">WhatsApp</dt>
              <dd class="mt-2">
                <a
                  :href="info.whatsappUrl"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="text-[0.9375rem] text-ink transition-colors hover:text-gold"
                >Écrire sur WhatsApp</a>
              </dd>
            </div>

            <div class="py-4">
              <dt class="text-[0.6875rem] uppercase tracking-[0.18em] text-ink-mute">E-mail</dt>
              <dd class="mt-2">
                <a
                  :href="`mailto:${info.email}`"
                  class="break-all text-[0.9375rem] text-ink transition-colors hover:text-gold"
                >{{ info.email }}</a>
              </dd>
            </div>

            <div class="py-4">
              <dt class="text-[0.6875rem] uppercase tracking-[0.18em] text-ink-mute">Adresse</dt>
              <dd class="mt-2 text-[0.9375rem] text-ink">Agôè - Démakpoè<br>Lomé, Togo</dd>
            </div>

            <div class="py-4">
              <dt class="text-[0.6875rem] uppercase tracking-[0.18em] text-ink-mute">Horaires</dt>
              <dd class="mt-2 text-[0.9375rem] text-ink">
                <span v-for="slot in info.hours" :key="slot.days" class="block">
                  {{ slot.days }} : {{ slot.time }}
                </span>
              </dd>
            </div>
          </dl>
        </div>

        <!-- Carte : rien n'est chargé avant que la personne ne le demande. -->
        <div class="relative aspect-4/3 overflow-hidden bg-shell">
          <iframe
            v-if="mapVisible"
            title="Localisation de TBS Distribution à Agôè-Démakpoè, Lomé"
            :src="mapEmbed"
            loading="lazy"
            referrerpolicy="no-referrer"
            sandbox="allow-scripts allow-same-origin allow-popups"
            class="size-full border-0"
          />

          <div v-else class="flex size-full flex-col items-center justify-center gap-4 p-6 text-center">
            <svg viewBox="0 0 24 24" class="size-8 text-gold" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true">
              <path d="M12 21s7-6.2 7-11a7 7 0 1 0-14 0c0 4.8 7 11 7 11Z" />
              <circle cx="12" cy="10" r="2.5" />
            </svg>
            <p class="text-[0.9375rem] leading-[1.6] text-ink-soft">
              {{ info.address }}
            </p>
            <div class="flex flex-wrap items-center justify-center gap-3">
              <UiButton variant="ghost" @click="mapVisible = true">Afficher la carte</UiButton>
              <!-- L'itinéraire n'apparaît que si la destination est connue :
                   un lien qui mène au centre d'un quartier de 13 km ne rend
                   service à personne. -->
              <UiButton
                v-if="itineraire"
                variant="ghost"
                :href="itineraire"
                target="_blank"
                rel="noopener noreferrer"
              >
                Itinéraire
              </UiButton>
            </div>
            <p class="max-w-[34ch] text-xs leading-[1.6] text-ink-mute">
              L'affichage envoie une requête à OpenStreetMap, qui reçoit alors
              votre adresse IP.
              <a
                :href="mapLink"
                target="_blank"
                rel="noopener noreferrer"
                class="underline underline-offset-2 hover:text-ink"
              >Ouvrir sur openstreetmap.org</a>
            </p>
          </div>
        </div>
      </aside>
    </section>
  </div>
</template>
