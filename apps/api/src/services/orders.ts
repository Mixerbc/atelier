import type { Prisma } from '@prisma/client'
import type { z } from 'zod'
import { AppError } from '../lib/errors.js'
import { generateFolio } from '../lib/helpers.js'
import { prisma } from '../lib/prisma.js'
import type { createOrderSchema } from '../schemas/index.js'
import { assertCanSell, colorAndSize, resolveUnitPrice, variantLabel } from './pricing.js'

type Input = z.infer<typeof createOrderSchema>

const include = {
  images: { orderBy: { sortOrder: 'asc' as const } },
  extras: true,
  variants: {
    include: {
      attributes: {
        include: { attributeValue: { include: { attribute: true } } },
      },
    },
  },
} satisfies Prisma.ProductInclude

export async function createOrderFromCart(input: Input) {
  const settings = await prisma.businessSettings.findUnique({ where: { id: 'default' } })
  if (!settings) throw new AppError(500, 'Configuración del negocio no encontrada')

  if (input.deliveryType === 'DELIVERY') {
    if (input.address.trim().length < 8) throw new AppError(400, 'Dirección incompleta')
    if (!input.zone.trim()) throw new AppError(400, 'Selecciona una zona')
  }

  return prisma.$transaction(async (tx) => {
    const lines: Array<{
      productId: string
      variantId: string | null
      productName: string
      variantLabel: string
      sku: string | null
      colorName?: string
      sizeName?: string
      imageUrl: string | null
      unitPriceCents: number
      quantity: number
      lineTotalCents: number
      notes: string
      extrasJson: Prisma.InputJsonValue
      attributesSnapshot: Prisma.InputJsonValue
    }> = []
    const movements: Array<{
      productId: string
      variantId: string | null
      previousStock: number
      delta: number
      finalStock: number
    }> = []
    let subtotalCents = 0

    for (const item of input.items) {
      const product = await tx.product.findUnique({ where: { id: item.productId }, include })
      if (!product) throw new AppError(400, 'Producto no encontrado')
      const variant = item.variantId
        ? (product.variants.find((v) => v.id === item.variantId) ?? null)
        : null
      assertCanSell(product, variant, item.quantity)

      const extras = product.extras.filter((e) => item.extraIds.includes(e.id) && e.isActive)
      const unitPriceCents = resolveUnitPrice(product, variant, extras)
      const lineTotalCents = unitPriceCents * item.quantity
      subtotalCents += lineTotalCents

      const imageUrl =
        variant?.imageUrl ??
        product.images.find((i) => i.isPrimary)?.url ??
        product.images[0]?.url ??
        null
      const { colorName, sizeName } = colorAndSize(variant ?? undefined)
      const attributesSnapshot =
        variant?.attributes.map((row) => ({
          attribute: row.attributeValue.attribute.name,
          value: row.attributeValue.name,
          slug: row.attributeValue.attribute.slug,
        })) ?? []

      lines.push({
        productId: product.id,
        variantId: variant?.id ?? null,
        productName: product.name,
        variantLabel: variantLabel(variant ?? undefined),
        sku: variant?.sku ?? product.sku,
        colorName,
        sizeName,
        imageUrl,
        unitPriceCents,
        quantity: item.quantity,
        lineTotalCents,
        notes: item.notes,
        extrasJson: extras.map((e) => ({ id: e.id, name: e.name, priceCents: e.priceCents })),
        attributesSnapshot,
      })

      if (product.trackInventory) {
        if (variant) {
          const previousStock = variant.stock
          const finalStock = previousStock - item.quantity
          if (finalStock < 0) throw new AppError(400, `Stock insuficiente: ${product.name}`)
          await tx.productVariant.update({ where: { id: variant.id }, data: { stock: finalStock } })
          movements.push({
            productId: product.id,
            variantId: variant.id,
            previousStock,
            delta: -item.quantity,
            finalStock,
          })
        } else {
          const previousStock = product.stock
          const finalStock = previousStock - item.quantity
          if (finalStock < 0) throw new AppError(400, `Stock insuficiente: ${product.name}`)
          await tx.product.update({
            where: { id: product.id },
            data: { stock: finalStock, status: finalStock === 0 ? 'SOLD_OUT' : product.status },
          })
          movements.push({
            productId: product.id,
            variantId: null,
            previousStock,
            delta: -item.quantity,
            finalStock,
          })
        }
      }
    }

    if (subtotalCents < settings.minimumOrderCents) {
      throw new AppError(400, 'No se alcanza el pedido mínimo')
    }

    const shippingCents = input.deliveryType === 'DELIVERY' ? settings.deliveryFeeCents : 0
    const totalCents = subtotalCents + shippingCents

    if (input.paymentMethod === 'CASH') {
      if (!input.cashAmountCents || input.cashAmountCents < totalCents) {
        throw new AppError(400, 'El efectivo debe cubrir el total')
      }
    }
    if (input.paymentMethod === 'OTHER' && !input.paymentNote?.trim()) {
      throw new AppError(400, 'Describe el otro método de pago')
    }

    const customer = await tx.customer.create({
      data: {
        fullName: input.customer.fullName.trim(),
        phone: input.customer.phone.replace(/\D/g, ''),
      },
    })

    const order = await tx.order.create({
      data: {
        folio: generateFolio(),
        customerId: customer.id,
        deliveryType: input.deliveryType,
        address: input.deliveryType === 'DELIVERY' ? input.address.trim() || null : null,
        zone: input.deliveryType === 'DELIVERY' ? input.zone.trim() : null,
        references: input.references.trim() || null,
        mapsUrl: input.deliveryType === 'DELIVERY' ? input.mapsUrl?.trim() || null : null,
        paymentMethod: input.paymentMethod,
        cashAmountCents: input.paymentMethod === 'CASH' ? input.cashAmountCents : null,
        changeCents:
          input.paymentMethod === 'CASH' && input.cashAmountCents
            ? input.cashAmountCents - totalCents
            : null,
        paymentNote: input.paymentNote?.trim() || '',
        subtotalCents,
        shippingCents,
        totalCents,
        notes: input.notes.trim(),
        items: {
          create: lines.map((line) => ({
            productId: line.productId,
            variantId: line.variantId,
            productName: line.productName,
            variantLabel: line.variantLabel,
            sku: line.sku,
            colorName: line.colorName,
            sizeName: line.sizeName,
            imageUrl: line.imageUrl,
            unitPriceCents: line.unitPriceCents,
            quantity: line.quantity,
            lineTotalCents: line.lineTotalCents,
            notes: line.notes,
            extrasJson: line.extrasJson,
            attributesSnapshot: line.attributesSnapshot,
          })),
        },
      },
      include: { customer: true, items: true },
    })

    if (movements.length) {
      await tx.inventoryMovement.createMany({
        data: movements.map((m) => ({
          productId: m.productId,
          variantId: m.variantId,
          orderId: order.id,
          previousStock: m.previousStock,
          delta: m.delta,
          finalStock: m.finalStock,
          reason: 'SALE',
          note: `Venta ${order.folio}`,
        })),
      })
    }

    return order
  })
}

export async function updateOrderStatus(orderId: string, status: string, adminUserId?: string) {
  return prisma.$transaction(async (tx) => {
    const order = await tx.order.findUnique({ where: { id: orderId }, include: { items: true } })
    if (!order) throw new AppError(404, 'Pedido no encontrado')

    if (status === 'CANCELLED' && !order.stockRestored && order.status !== 'CANCELLED') {
      for (const item of order.items) {
        if (item.variantId) {
          const variant = await tx.productVariant.findUnique({ where: { id: item.variantId } })
          if (!variant) continue
          const previousStock = variant.stock
          const finalStock = previousStock + item.quantity
          await tx.productVariant.update({ where: { id: variant.id }, data: { stock: finalStock } })
          await tx.inventoryMovement.create({
            data: {
              productId: item.productId ?? variant.productId,
              variantId: variant.id,
              orderId: order.id,
              adminUserId,
              previousStock,
              delta: item.quantity,
              finalStock,
              reason: 'CANCEL_RESTORE',
              note: `Cancelación ${order.folio}`,
            },
          })
        } else if (item.productId) {
          const product = await tx.product.findUnique({ where: { id: item.productId } })
          if (!product?.trackInventory) continue
          const previousStock = product.stock
          const finalStock = previousStock + item.quantity
          await tx.product.update({
            where: { id: product.id },
            data: {
              stock: finalStock,
              status: product.status === 'SOLD_OUT' && finalStock > 0 ? 'PUBLISHED' : product.status,
            },
          })
          await tx.inventoryMovement.create({
            data: {
              productId: product.id,
              orderId: order.id,
              adminUserId,
              previousStock,
              delta: item.quantity,
              finalStock,
              reason: 'CANCEL_RESTORE',
              note: `Cancelación ${order.folio}`,
            },
          })
        }
      }
    }

    return tx.order.update({
      where: { id: orderId },
      data: {
        status: status as never,
        stockRestored: status === 'CANCELLED' ? true : order.stockRestored,
      },
      include: { customer: true, items: true },
    })
  })
}
