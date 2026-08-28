import type { AttributeValue, Product, ProductExtra, ProductVariant } from '@prisma/client'
import { AppError } from '../lib/errors.js'
import { effectivePriceCents } from '../lib/helpers.js'

type VariantWithAttrs = ProductVariant & {
  attributes: Array<{
    attributeValue: AttributeValue & {
      attribute: { id: string; name: string; slug: string }
    }
  }>
}

export function resolveUnitPrice(
  product: Pick<Product, 'basePriceCents' | 'salePriceCents'>,
  variant?: Pick<ProductVariant, 'priceCents' | 'priceDeltaCents'> | null,
  extras: Pick<ProductExtra, 'priceCents'>[] = [],
): number {
  const base = effectivePriceCents({
    basePriceCents: product.basePriceCents,
    salePriceCents: product.salePriceCents,
    variantPriceCents: variant?.priceCents,
    priceDeltaCents: variant?.priceDeltaCents ?? 0,
  })
  return base + extras.reduce((sum, e) => sum + e.priceCents, 0)
}

export function variantLabel(variant: VariantWithAttrs | null | undefined): string {
  if (!variant) return ''
  return variant.attributes
    .map((row) => `${row.attributeValue.attribute.name}: ${row.attributeValue.name}`)
    .join(' / ')
}

export function colorAndSize(variant: VariantWithAttrs | null | undefined): {
  colorName?: string
  sizeName?: string
} {
  if (!variant) return {}
  const color = variant.attributes.find((a) => a.attributeValue.attribute.slug === 'color')
  const size = variant.attributes.find((a) => a.attributeValue.attribute.slug === 'talla')
  return {
    colorName: color?.attributeValue.name,
    sizeName: size?.attributeValue.name,
  }
}

export function assertCanSell(
  product: Product,
  variant: ProductVariant | null | undefined,
  quantity: number,
) {
  if (product.deletedAt || product.status === 'DISABLED' || product.status === 'DRAFT') {
    throw new AppError(400, `El producto ${product.name} no está disponible`)
  }
  if (product.status === 'SOLD_OUT') {
    throw new AppError(400, `El producto ${product.name} está agotado`)
  }
  if (product.hasVariants) {
    if (!variant) throw new AppError(400, `Debes seleccionar una variante de ${product.name}`)
    if (!variant.isActive) throw new AppError(400, 'La variante seleccionada no está disponible')
    if (product.trackInventory && variant.stock < quantity) {
      throw new AppError(400, `Stock insuficiente para ${product.name} (${variant.sku})`)
    }
  } else if (product.trackInventory && product.stock < quantity) {
    throw new AppError(400, `Stock insuficiente para ${product.name}`)
  }
}
