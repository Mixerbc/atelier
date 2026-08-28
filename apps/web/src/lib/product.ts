import type { AttributeValue, Product, ProductVariant } from '../types'
import { mediaUrl } from './api'

export function primaryImageUrl(product: Pick<Product, 'images'>): string {
  const primary = product.images?.find((image) => image.isPrimary) ?? product.images?.[0]
  return mediaUrl(primary?.url)
}

export function galleryImageUrls(product: Pick<Product, 'images'>): string[] {
  const images = [...(product.images ?? [])].sort((a, b) => {
    if (Boolean(a.isPrimary) !== Boolean(b.isPrimary)) return a.isPrimary ? -1 : 1
    return (a.sortOrder ?? 0) - (b.sortOrder ?? 0)
  })
  const urls: string[] = []
  for (const image of images) {
    if (!image.url || urls.includes(image.url)) continue
    urls.push(image.url)
  }
  return urls
}

export function displayPriceCents(
  product: Pick<Product, 'basePriceCents' | 'salePriceCents' | 'displayPriceCents'>,
): number {
  if (typeof product.displayPriceCents === 'number') return product.displayPriceCents
  if (product.salePriceCents != null && product.salePriceCents > 0) return product.salePriceCents
  return product.basePriceCents
}

export function isOnSale(
  product: Pick<Product, 'basePriceCents' | 'salePriceCents'>,
): boolean {
  return (
    product.salePriceCents != null &&
    product.salePriceCents > 0 &&
    product.salePriceCents < product.basePriceCents
  )
}

export function salePercent(
  product: Pick<Product, 'basePriceCents' | 'salePriceCents'>,
): number | null {
  if (!isOnSale(product) || !product.salePriceCents) return null
  return Math.round((1 - product.salePriceCents / product.basePriceCents) * 100)
}

export function remainingStock(
  product: Pick<Product, 'hasVariants' | 'trackInventory' | 'stock' | 'variants'>,
): number {
  if (!product.trackInventory) return 99
  if (product.hasVariants) {
    return (product.variants ?? [])
      .filter((variant) => variant.isActive !== false)
      .reduce((sum, variant) => sum + Math.max(0, variant.stock), 0)
  }
  return Math.max(0, product.stock)
}

export function isProductAvailable(
  product: Pick<Product, 'status' | 'hasVariants' | 'trackInventory' | 'stock' | 'variants'>,
): boolean {
  if (product.status !== 'PUBLISHED') return false
  if (!product.trackInventory) return true
  if (product.hasVariants) {
    return (product.variants ?? []).some((variant) => variant.isActive !== false && variant.stock > 0)
  }
  return product.stock > 0
}

export function productTags(product: Pick<Product, 'isNew' | 'isFeatured'>): Array<'nuevo' | 'popular'> {
  const tags: Array<'nuevo' | 'popular'> = []
  if (product.isNew) tags.push('nuevo')
  if (product.isFeatured) tags.push('popular')
  return tags
}

export function productHasOptions(
  product: Pick<Product, 'hasVariants' | 'extras' | 'variants'>,
): boolean {
  return Boolean(product.hasVariants || product.variants?.length || product.extras?.length)
}

export function getAttributeValues(product: Product, slug: string): AttributeValue[] {
  const used = new Map<string, AttributeValue>()
  for (const variant of product.variants ?? []) {
    if (variant.isActive === false) continue
    for (const row of variant.attributes ?? []) {
      if (row.attributeValue.attribute.slug !== slug) continue
      used.set(row.attributeValue.id, row.attributeValue)
    }
  }
  if (used.size > 0) {
    return [...used.values()].sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0))
  }
  const link = product.attributes?.find((row) => row.attribute.slug === slug)
  return link?.attribute.values ?? []
}

export function findVariant(
  variants: ProductVariant[],
  colorId: string | null,
  sizeId: string | null,
): ProductVariant | undefined {
  return variants.find((variant) => {
    const values = variant.attributes.map((row) => row.attributeValue)
    const colorOk =
      !colorId || values.some((v) => v.id === colorId && v.attribute.slug === 'color')
    const sizeOk = !sizeId || values.some((v) => v.id === sizeId && v.attribute.slug === 'talla')
    return colorOk && sizeOk
  })
}

export function variantColorSize(variant: ProductVariant | null | undefined): {
  colorName: string | null
  sizeName: string | null
} {
  if (!variant) return { colorName: null, sizeName: null }
  const color = variant.attributes.find((a) => a.attributeValue.attribute.slug === 'color')
  const size = variant.attributes.find((a) => a.attributeValue.attribute.slug === 'talla')
  return {
    colorName: color?.attributeValue.name ?? null,
    sizeName: size?.attributeValue.name ?? null,
  }
}

export function resolveVariantUnitPrice(
  product: Pick<Product, 'basePriceCents' | 'salePriceCents'>,
  variant?: Pick<ProductVariant, 'priceCents' | 'priceDeltaCents'> | null,
  extras: Array<{ priceCents: number }> = [],
): number {
  const base =
    variant?.priceCents != null
      ? variant.priceCents
      : (product.salePriceCents ?? product.basePriceCents) + (variant?.priceDeltaCents ?? 0)
  return base + extras.reduce((sum, extra) => sum + extra.priceCents, 0)
}

export function isVariantSellable(
  product: Pick<Product, 'trackInventory' | 'status'>,
  variant: ProductVariant | undefined,
): boolean {
  if (product.status !== 'PUBLISHED') return false
  if (!variant || variant.isActive === false) return false
  if (!product.trackInventory) return true
  return variant.stock > 0
}

export function isLowStock(
  product: Pick<Product, 'trackInventory'>,
  stock: number,
  minStock: number,
): boolean {
  if (!product.trackInventory) return false
  return stock > 0 && stock <= minStock
}
