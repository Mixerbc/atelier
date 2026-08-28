import { describe, expect, it } from 'vitest'
import type { Customer } from '../types'
import { emptyCustomer, validateCustomer, validatePhone } from './validation'

const validCustomer: Customer = {
  ...emptyCustomer(),
  fullName: 'Juan Pérez',
  phone: '4421234567',
  deliveryType: 'delivery',
  address: 'Calle Ejemplo 123',
  zone: 'Zakia',
  paymentMethod: 'cash',
  cashAmountCents: 50000,
}

describe('validation', () => {
  it('acepta teléfonos de 10 dígitos aunque vengan con formato', () => {
    expect(validatePhone('4421234567')).toBeNull()
    expect(validatePhone('442-123-4567')).toBeNull()
    expect(validatePhone('44212')).toBe('El teléfono debe tener 10 dígitos')
    expect(validatePhone('')).toBe('El teléfono es obligatorio')
  })

  it('exige dirección y zona solo cuando hay envío', () => {
    const deliveryErrors = validateCustomer(
      { ...validCustomer, address: '', zone: '', mapsUrl: '' },
      { totalCents: 47500 },
    )
    expect(deliveryErrors.address).toBeTruthy()
    expect(deliveryErrors.zone).toBeTruthy()

    const pickupErrors = validateCustomer(
      { ...validCustomer, deliveryType: 'pickup', address: '', zone: '', mapsUrl: '' },
      { totalCents: 47500 },
    )
    expect(pickupErrors.address).toBeUndefined()
    expect(pickupErrors.zone).toBeUndefined()
  })

  it('acepta envío con dirección escrita y sin Google Maps', () => {
    const errors = validateCustomer(
      { ...validCustomer, mapsUrl: '' },
      { totalCents: 47500 },
    )
    expect(errors.address).toBeUndefined()
    expect(errors.mapsUrl).toBeUndefined()
  })

  it('sigue exigiendo la dirección escrita aunque haya un pin de Maps', () => {
    const errors = validateCustomer(
      {
        ...validCustomer,
        address: '',
        mapsUrl: 'https://maps.app.goo.gl/abc',
      },
      { totalCents: 47500 },
    )
    expect(errors.address).toBeTruthy()
  })

  it('valida el efectivo contra el total', () => {
    const errors = validateCustomer(
      { ...validCustomer, cashAmountCents: 20000 },
      { totalCents: 47500 },
    )
    expect(errors.cashAmountCents).toBe('El monto debe ser igual o mayor al total')
  })

  it('exige comentario cuando el pago es otro', () => {
    const errors = validateCustomer(
      { ...validCustomer, paymentMethod: 'other', paymentNote: '', cashAmountCents: null },
      { totalCents: 47500 },
    )
    expect(errors.paymentNote).toBeTruthy()
  })
})
