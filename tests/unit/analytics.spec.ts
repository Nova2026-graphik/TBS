import { describe, expect, it } from 'vitest'
import {
  ANALYTICS_EVENTS,
  analyticsDestination,
  analyticsProviderName,
  analyticsScriptUrl,
  isAnalyticsEnabled,
  VERCEL_ANALYTICS_SCRIPT,
} from '../../shared/utils/analytics'

describe('activation de la mesure d’audience', () => {
  const complet = { provider: 'plausible', host: 'https://plausible.io', siteId: 'tbs.tg' }

  it('reste éteinte tant que tout n’est pas renseigné', () => {
    expect(isAnalyticsEnabled(undefined)).toBe(false)
    expect(isAnalyticsEnabled({})).toBe(false)
    expect(isAnalyticsEnabled({ ...complet, provider: '' })).toBe(false)
    expect(isAnalyticsEnabled({ ...complet, host: '' })).toBe(false)
    expect(isAnalyticsEnabled({ ...complet, siteId: '' })).toBe(false)
  })

  it('refuse un prestataire inconnu plutôt que de charger n’importe quoi', () => {
    expect(isAnalyticsEnabled({ ...complet, provider: 'google-analytics' })).toBe(false)
  })

  it('s’allume sur les prestataires sans cookie', () => {
    expect(isAnalyticsEnabled(complet)).toBe(true)
    expect(isAnalyticsEnabled({ ...complet, provider: 'umami' })).toBe(true)
  })

  it('n’attend ni hôte ni identifiant pour Vercel, servi par le site lui-même', () => {
    expect(isAnalyticsEnabled({ provider: 'vercel', host: '', siteId: '' })).toBe(true)
  })
})

describe('URL du script', () => {
  it('suit la convention de chaque prestataire', () => {
    expect(
      analyticsScriptUrl({ provider: 'plausible', host: 'https://plausible.io', siteId: 'x' }),
    ).toBe('https://plausible.io/js/script.js')

    expect(
      analyticsScriptUrl({ provider: 'umami', host: 'https://stats.example.tg', siteId: 'x' }),
    ).toBe('https://stats.example.tg/script.js')
  })

  it('charge Vercel depuis le domaine du site, quel que soit l’hôte renseigné', () => {
    expect(VERCEL_ANALYTICS_SCRIPT).toBe('/_vercel/insights/script.js')
    expect(analyticsScriptUrl({ provider: 'vercel', host: '', siteId: '' })).toBe(VERCEL_ANALYTICS_SCRIPT)
    expect(
      analyticsScriptUrl({ provider: 'vercel', host: 'https://plausible.io', siteId: 'x' }),
    ).toBe(VERCEL_ANALYTICS_SCRIPT)
  })

  it('tolère une barre oblique finale dans l’hôte', () => {
    expect(
      analyticsScriptUrl({ provider: 'plausible', host: 'https://plausible.io/', siteId: 'x' }),
    ).toBe('https://plausible.io/js/script.js')
  })
})

describe('politique de confidentialité', () => {
  it('nomme chaque prestataire, et la destination des mesures', () => {
    expect(analyticsProviderName('plausible')).toBe('Plausible')
    expect(analyticsProviderName('umami')).toBe('Umami')
    expect(analyticsProviderName('vercel')).toBe('Vercel Web Analytics')

    expect(analyticsDestination({ provider: 'vercel', host: '', siteId: '' })).toBe('vercel.com')
    expect(
      analyticsDestination({ provider: 'umami', host: 'https://stats.example.tg', siteId: 'x' }),
    ).toBe('https://stats.example.tg')
  })
})

describe('noms d’événements', () => {
  it('reste figé : le code et le tableau de bord doivent parler la même langue', () => {
    expect(Object.values(ANALYTICS_EVENTS)).toEqual([
      'devis_ouvert',
      'devis_commence',
      'devis_envoye',
      'whatsapp_clic',
      'appel_clic',
      'branche_consultee',
    ])
  })
})
