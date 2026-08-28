import { describe, expect, it } from 'vitest'
import { filterProducts, productHasOptions } from './catalog'
import type { Product } from '../types'

function product(partial: Partial<Product> & Pick<Product, 'id' | 'name' | 'slug'>): Product {
  return {
    shortDescription: '',
    description: '',
    categoryId: 'cat-1',
    basePriceCents: 10000,
    status: 'PUBLISHED',
    isFeatured: false,
    isNew: false,
    hasVariants: false,
    trackInventory: true,
    stock: 10,
    minStock: 2,
    images: [],
    extras: [],
    attributes: [],
    variants: [],
    ...partial,
  }
}

describe('catalog filters', () => {
  const catalog = [
    product({
      id: '1',
      name: 'Playera negra',
      slug: 'playera-negra',
      categoryId: 'playeras',
      shortDescription: 'Algodón',
      hasVariants: true,
      variants: [
        {
          id: 'v1',
          sku: 'A',
          stock: 3,
          minStock: 1,
          attributes: [],
        },
      ],
    }),
    product({
      id: '2',
      name: 'Pantalón denim',
      slug: 'pantalon-denim',
      categoryId: 'pantalones',
      status: 'SOLD_OUT',
      stock: 0,
    }),
    product({
      id: '3',
      name: 'Gorra',
      slug: 'gorra',
      categoryId: 'accesorios',
      extras: [{ id: 'e1', name: 'Bordado', priceCents: 500 }],
    }),
  ]

  it('detecta productos con opciones', () => {
    expect(productHasOptions(catalog[0]!)).toBe(true)
    expect(productHasOptions(catalog[2]!)).toBe(true)
    expect(productHasOptions(catalog[1]!)).toBe(false)
  })

  it('filtra por búsqueda, categoría y disponibilidad', () => {
    const shirts = filterProducts(catalog, {
      query: 'playera',
      categoryId: 'playeras',
      availability: 'available',
    })
    expect(shirts).toHaveLength(1)
    expect(shirts[0]?.slug).toBe('playera-negra')

    const soldOut = filterProducts(catalog, {
      query: '',
      categoryId: '',
      availability: 'soldout',
    })
    expect(soldOut.length).toBeGreaterThan(0)
    expect(soldOut.every((item) => item.status !== 'PUBLISHED' || item.stock === 0)).toBe(true)
  })
})
