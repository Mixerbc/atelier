import { describe, expect, it } from 'vitest'
import type { CartItem, Customer } from '../types'
import { buildOrder } from './order'

const customer: Customer = {
  fullName: 'Juan Pérez',
  phone: '4421234567',
  deliveryType: 'delivery',
  address: 'Calle Ejemplo 123',
  zone: 'Zakia',
  references: 'Portón negro',
  mapsUrl: '',
  paymentMethod: 'cash',
  cashAmountCents: 50000,
  paymentNote: '',
  notes: 'Favor de llamar al llegar.',
}

const items: CartItem[] = [
  {
    id: '1',
    lineKey: 'a',
    productId: 'tee-basica',
    variantId: 'var-1',
    name: 'Playera básica',
    image: '/img.svg',
    colorName: 'Negro',
    sizeName: 'M',
    sku: 'TEE-NEGRO-M',
    quantity: 2,
    unitPriceCents: 21500,
    extras: [{ id: 'extra-gift', name: 'Envoltorio', priceCents: 3000 }],
    notes: 'Envolver',
  },
]

describe('order', () => {
  it('congela nombres, precios y calcula totales del pedido', () => {
    const order = buildOrder({
      items,
      customer,
      deliveryFeeCents: 3500,
      createdAt: new Date('2026-08-23T20:35:00.000Z'),
      folio: 'PED-20260823-A7K3',
    })

    expect(order.items[0]?.name).toBe('Playera básica')
    expect(order.items[0]?.colorName).toBe('Negro')
    expect(order.items[0]?.sizeName).toBe('M')
    expect(order.items[0]?.sku).toBe('TEE-NEGRO-M')
    expect(order.items[0]?.unitPriceCents).toBe(21500)
    expect(order.items[0]?.amountCents).toBe(43000)
    expect(order.subtotalCents).toBe(43000)
    expect(order.shippingCents).toBe(3500)
    expect(order.totalCents).toBe(46500)
    expect(order.changeCents).toBe(3500)
  })
})
