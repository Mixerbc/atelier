import { storeApi } from '../lib/api'
import {
  displayPriceCents,
  isProductAvailable,
  primaryImageUrl,
  productHasOptions,
} from '../lib/product'
import type { AvailabilityFilter, Category, Product } from '../types'

export async function getCategories(): Promise<Category[]> {
  return storeApi.getCategories()
}

export async function getProducts(params?: {
  q?: string
  category?: string
  featured?: boolean
}): Promise<Product[]> {
  return storeApi.getProducts(params)
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  try {
    return await storeApi.getProductBySlug(slug)
  } catch {
    return null
  }
}

export async function getFeaturedProducts(): Promise<Product[]> {
  return storeApi.getProducts({ featured: true })
}

export function filterProducts(
  items: Product[],
  filters: { query: string; categoryId: string; availability: AvailabilityFilter },
): Product[] {
  const query = filters.query.trim().toLowerCase()

  return items.filter((product) => {
    const matchesQuery =
      query.length === 0 ||
      product.name.toLowerCase().includes(query) ||
      product.shortDescription.toLowerCase().includes(query) ||
      product.description.toLowerCase().includes(query)

    const matchesCategory =
      !filters.categoryId ||
      product.categoryId === filters.categoryId ||
      product.category?.slug === filters.categoryId

    const available = isProductAvailable(product)
    const matchesAvailability =
      filters.availability === 'all' ||
      (filters.availability === 'available' && available) ||
      (filters.availability === 'soldout' && !available)

    return matchesQuery && matchesCategory && matchesAvailability
  })
}

export { displayPriceCents, isProductAvailable, primaryImageUrl, productHasOptions }
