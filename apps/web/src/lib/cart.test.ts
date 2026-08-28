import { describe, expect, it } from 'vitest'
import type { CartItem } from '../types'
import {
  addOrMergeItem,
  computeChangeCents,
  computeLineAmountCents,
  computeShippingCents,
  computeSubtotalCents,
  computeTotalCents,
  computeUnitPriceCents,
  createLineKey,
} from './cart'

function line(partial: Partial<CartItem> & Pick<CartItem, 'id' | 'lineKey' | 'productId'>): CartItem {
  return {
    name: 'Producto',
    image: '/img.svg',
    quantity: 1,
    unitPriceCents: 10000,
    variantId: null,
    colorName: null,
    sizeName: null,
    sku: null,
    extras: [],
    notes: '',
    ...partial,
  }
}

describe('cart calculations', () => {
  it('calcula el precio unitario con extras', () => {
    expect(computeUnitPriceCents(18500, [{ priceCents: 3000 }])).toBe(21500)
  })

  it('calcula importe de línea y subtotal', () => {
    const items = [
      line({ id: '1', lineKey: 'a', productId: 'tee', unitPriceCents: 21500, quantity: 2 }),
      line({ id: '2', lineKey: 'b', productId: 'pants', unitPriceCents: 4000, quantity: 1 }),
    ]
    expect(computeLineAmountCents(21500, 2)).toBe(43000)
    expect(computeSubtotalCents(items)).toBe(47000)
  })

  it('agrega envío solo en domicilio', () => {
    expect(computeShippingCents('delivery', 3500)).toBe(3500)
    expect(computeShippingCents('pickup', 3500)).toBe(0)
    expect(computeShippingCents('', 3500)).toBe(0)
  })

  it('calcula total y cambio en efectivo', () => {
    const total = computeTotalCents(44000, 3500)
    expect(total).toBe(47500)
    expect(computeChangeCents(50000, total)).toBe(2500)
  })
})

describe('cart grouping', () => {
  it('agrupa el mismo producto con las mismas opciones', () => {
    const key = createLineKey({
      productId: 'tee',
      variantId: 'var-1',
      colorName: 'Negro',
      sizeName: 'M',
      extraIds: ['extra-gift'],
      notes: 'Envolver',
    })
    const first = line({
      id: '1',
      lineKey: key,
      productId: 'tee',
      quantity: 1,
      colorName: 'Negro',
      sizeName: 'M',
      variantId: 'var-1',
    })
    const second = line({
      id: '2',
      lineKey: key,
      productId: 'tee',
      quantity: 2,
      colorName: 'Negro',
      sizeName: 'M',
      variantId: 'var-1',
    })

    const merged = addOrMergeItem([first], second)
    expect(merged).toHaveLength(1)
    expect(merged[0]?.quantity).toBe(3)
    expect(merged[0]?.id).toBe('1')
  })

  it('separa productos con color, talla, extras u observaciones distintas', () => {
    const base = {
      productId: 'tee',
      variantId: 'var-1',
      colorName: 'Negro',
      sizeName: 'M',
    }
    const withNote = createLineKey({ ...base, extraIds: [], notes: 'Envolver' })
    const withExtra = createLineKey({ ...base, extraIds: ['extra-gift'], notes: '' })
    const plain = createLineKey({ ...base, extraIds: [], notes: '' })
    const otherColor = createLineKey({
      ...base,
      colorName: 'Rojo',
      variantId: 'var-2',
      extraIds: [],
      notes: '',
    })

    expect(withNote).not.toBe(withExtra)
    expect(withNote).not.toBe(plain)
    expect(plain).not.toBe(otherColor)

    const items = addOrMergeItem(
      [
        line({ id: '1', lineKey: plain, productId: 'tee' }),
        line({ id: '2', lineKey: withNote, productId: 'tee' }),
      ],
      line({ id: '3', lineKey: withExtra, productId: 'tee' }),
    )

    expect(items).toHaveLength(3)
  })
})
