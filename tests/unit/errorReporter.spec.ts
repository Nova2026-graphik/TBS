import { beforeEach, describe, expect, it } from 'vitest'
import {
  ALERT_WINDOW_MS,
  buildErrorReport,
  formatAlertBody,
  formatLogLine,
  isReportable,
  resetAlertWindow,
  shouldAlert,
} from '../../server/utils/errorReporter'

beforeEach(() => {
  resetAlertWindow()
})

describe('ce qui mérite une alerte', () => {
  it('ignore les erreurs du client', () => {
    for (const code of [400, 401, 404, 422, 429, 499]) {
      expect(isReportable(code), `${code} devrait être ignoré`).toBe(false)
    }
  })

  it('alerte sur les erreurs du serveur', () => {
    for (const code of [500, 502, 503]) {
      expect(isReportable(code), `${code} devrait alerter`).toBe(true)
    }
  })

  it('alerte quand le code est inconnu — une erreur non typée est une panne', () => {
    expect(isReportable(undefined)).toBe(true)
  })
})

describe('aucune donnée personnelle ne sort', () => {
  const erreur = Object.assign(new Error('insert into quote_requests failed'), {
    statusCode: 500,
  })

  const rapport = buildErrorReport(
    erreur,
    {
      method: 'POST',
      path: '/api/quotes?nom=Kodjo+Adjovi&tel=%2B22890112233',
      statusCode: 500,
    },
    new Date('2026-09-06T21:30:00Z'),
  )

  it('retire la chaîne de requête du chemin', () => {
    expect(rapport.path).toBe('/api/quotes')
  })

  it('ne laisse fuiter ni nom ni numéro, ni dans le rapport ni dans l’alerte', () => {
    const corps = formatAlertBody(rapport, 'https://www.tbs-distribution.tg')
    const tout = JSON.stringify(rapport) + corps

    for (const fuite of ['Kodjo', 'Adjovi', '22890112233', 'nom=', 'tel=']) {
      expect(tout, `« ${fuite} » ne doit pas apparaître`).not.toContain(fuite)
    }
  })

  it('tronque la pile', () => {
    expect((rapport.stack ?? '').split('\n').length).toBeLessThanOrEqual(8)
  })

  it('écrit une ligne de journal exploitable', () => {
    expect(formatLogLine(rapport)).toBe(
      '[erreur] 500 POST /api/quotes — insert into quote_requests failed',
    )
  })
})

describe('fenêtre anti-inondation', () => {
  const t0 = 1_000_000

  it('n’alerte qu’une fois par fenêtre pour une même signature', () => {
    expect(shouldAlert('sig', t0)).toBe(true)
    expect(shouldAlert('sig', t0 + 1_000)).toBe(false)
    expect(shouldAlert('sig', t0 + ALERT_WINDOW_MS - 1)).toBe(false)
    expect(shouldAlert('sig', t0 + ALERT_WINDOW_MS + 1)).toBe(true)
  })

  it('traite deux pannes distinctes indépendamment', () => {
    expect(shouldAlert('une', t0)).toBe(true)
    expect(shouldAlert('autre', t0)).toBe(true)
  })

  it('regroupe par code, méthode, chemin et message', () => {
    const base = { method: 'GET', path: '/api/faq', statusCode: 500 }
    const a = buildErrorReport(new Error('timeout'), base)
    const b = buildErrorReport(new Error('timeout'), { ...base, path: '/api/faq?x=1' })
    const c = buildErrorReport(new Error('autre panne'), base)

    expect(a.signature).toBe(b.signature)
    expect(a.signature).not.toBe(c.signature)
  })
})
