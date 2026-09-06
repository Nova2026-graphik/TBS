import { describe, expect, it } from 'vitest'
import {
  createSessionToken,
  isAdminEnabled,
  isPasswordValid,
  MIN_PASSWORD_LENGTH,
  passwordWeakness,
  SESSION_TTL_MS,
  verifySessionToken,
} from '../../server/utils/adminSession'

const MOT_DE_PASSE = 'un-mot-de-passe-assez-long-2026'

describe('activation de l’espace', () => {
  it('reste éteint sans mot de passe — un oubli n’ouvre pas la porte', () => {
    expect(isAdminEnabled(undefined)).toBe(false)
    expect(isAdminEnabled('')).toBe(false)
  })

  it('s’allume dès qu’un mot de passe est configuré', () => {
    expect(isAdminEnabled(MOT_DE_PASSE)).toBe(true)
  })
})

describe('vérification du mot de passe', () => {
  it('accepte le bon, refuse tout le reste', () => {
    expect(isPasswordValid(MOT_DE_PASSE, MOT_DE_PASSE)).toBe(true)
    expect(isPasswordValid('', MOT_DE_PASSE)).toBe(false)
    expect(isPasswordValid(MOT_DE_PASSE.slice(0, -1), MOT_DE_PASSE)).toBe(false)
    expect(isPasswordValid(MOT_DE_PASSE.toUpperCase(), MOT_DE_PASSE)).toBe(false)
  })

  it('refuse un préfixe correct — la comparaison ne doit pas fuiter', () => {
    expect(isPasswordValid('un-mot-de-passe', MOT_DE_PASSE)).toBe(false)
  })
})

describe('jeton de session', () => {
  const maintenant = 1_800_000_000_000

  it('se vérifie lui-même', () => {
    const jeton = createSessionToken(MOT_DE_PASSE, maintenant + SESSION_TTL_MS)
    expect(verifySessionToken(jeton, MOT_DE_PASSE, maintenant)).toBe(true)
  })

  it('expire', () => {
    const jeton = createSessionToken(MOT_DE_PASSE, maintenant + 1000)
    expect(verifySessionToken(jeton, MOT_DE_PASSE, maintenant + 999)).toBe(true)
    expect(verifySessionToken(jeton, MOT_DE_PASSE, maintenant + 1001)).toBe(false)
  })

  it('ne vaut rien sous un autre mot de passe — changer le mot de passe déconnecte', () => {
    const jeton = createSessionToken(MOT_DE_PASSE, maintenant + SESSION_TTL_MS)
    expect(verifySessionToken(jeton, 'autre-mot-de-passe-long', maintenant)).toBe(false)
  })

  it('refuse une date d’expiration rallongée à la main', () => {
    const jeton = createSessionToken(MOT_DE_PASSE, maintenant + 1000)
    const signature = jeton.slice(jeton.lastIndexOf('.'))
    const forge = `${maintenant + 10 * SESSION_TTL_MS}${signature}`
    expect(verifySessionToken(forge, MOT_DE_PASSE, maintenant)).toBe(false)
  })

  it('refuse les jetons absents ou malformés', () => {
    for (const jeton of [undefined, '', 'sans-point', '.', 'abc.def']) {
      expect(verifySessionToken(jeton, MOT_DE_PASSE, maintenant), `« ${jeton} »`).toBe(false)
    }
  })
})

describe('qualité du mot de passe', () => {
  it('signale ce qui n’en est pas un', () => {
    expect(passwordWeakness('court')).toContain(String(MIN_PASSWORD_LENGTH))
    expect(passwordWeakness('admin-de-la-mort-qui-tue')).toBe('commence par un mot évident')
    expect(passwordWeakness('tbs-distribution-2026')).toBe('commence par un mot évident')
  })

  it('laisse passer un mot de passe correct', () => {
    expect(passwordWeakness(MOT_DE_PASSE)).toBeNull()
  })
})
