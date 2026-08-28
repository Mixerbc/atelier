import { canUseApi, storeApi } from '../lib/api'
import { staticCategories, staticProducts } from '../data/staticCatalog'
import {
  displayPriceCents,
  isProductAvailable,
  primaryImageUrl,
  productHasOptions,
} from '../lib/product'
import type { AvailabilityFilter, Category, Product } from '../types'

function applyProductParams(
  items: Product[],
  params?: { q?: string; category?: string; featured?: boolean },
): Product[] {
  return items.filter((product) => {
    if (params?.featured && !product.isFeatured) return false
    if (params?.category) {
      const match =
        product.categoryId === params.category || product.category?.slug === params.category
      if (!match) return false
    }
    if (params?.q) {
      const q = params.q.trim().toLowerCase()
      const haystack = `${product.name} ${product.shortDescription} ${product.description}`.toLowerCase()
      if (!haystack.includes(q)) return false
    }
    return true
  })
}

export async function getCategories(): Promise<Category[]> {
  if (!canUseApi()) return staticCategories
  try {
    return await storeApi.getCategories()
  } catch {
    return staticCategories
  }
}

export async function getProducts(params?: {
  q?: string
  category?: string
  featured?: boolean
}): Promise<Product[]> {
  if (!canUseApi()) return applyProductParams(staticProducts, params)
  try {
    return await storeApi.getProducts(params)
  } catch {
    return applyProductParams(staticProducts, params)
  }
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  if (!canUseApi()) {
    return staticProducts.find((product) => product.slug === slug) ?? null
  }
  try {
    return await storeApi.getProductBySlug(slug)
  } catch {
    return staticProducts.find((product) => product.slug === slug) ?? null
  }
}

export async function getFeaturedProducts(): Promise<Product[]> {
  return getProducts({ featured: true })
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
