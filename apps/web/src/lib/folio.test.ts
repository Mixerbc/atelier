import { describe, expect, it } from 'vitest'
import { formatFolioDate, generateFolio } from './folio'

describe('folio', () => {
  it('usa fecha y un token corto, sin prometer consecutivo', () => {
    const date = new Date(2026, 7, 23)
    const folio = generateFolio(date, 'A7K3')
    expect(folio).toBe('PED-20260823-A7K3')
    expect(formatFolioDate(date)).toBe('20260823')
    expect(generateFolio(date)).toMatch(/^PED-20260823-[A-Z0-9]{4}$/)
  })
})
