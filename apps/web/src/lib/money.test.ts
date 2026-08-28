import { describe, expect, it } from 'vitest'
import { addCents, formatMoney, fromCents, multiplyCents, parseMoneyInput, toCents } from './money'

describe('money', () => {
  it('convierte bolívares a céntimos sin errores de punto flotante', () => {
    expect(toCents(185)).toBe(18500)
    expect(toCents(35.1)).toBe(3510)
    expect(fromCents(18500)).toBe(185)
  })

  it('suma y multiplica en céntimos', () => {
    expect(addCents(18500, 3000, 4000)).toBe(25500)
    expect(multiplyCents(18500, 2)).toBe(37000)
    expect(multiplyCents(18500, 0)).toBe(0)
  })

  it('formatea bolívares venezolanos', () => {
    expect(formatMoney(47500)).toMatch(/^Bs /)
    expect(formatMoney(47500)).toContain('475')
    expect(parseMoneyInput('500')).toBe(50000)
    expect(parseMoneyInput('500.50')).toBe(50050)
  })
})
