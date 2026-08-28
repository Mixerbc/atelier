import { Router } from 'express'
import { requireAuth } from '../lib/auth.js'
import { AppError } from '../lib/errors.js'
import { cartesianProduct, routeParam, toSlug } from '../lib/helpers.js'
import { prisma } from '../lib/prisma.js'
import { validateBody } from '../lib/validate.js'
import {
  attributeSchema,
  attributeValueSchema,
  categorySchema,
  ensurePaletteSchema,
  generateVariantsSchema,
  productSchema,
  settingsSchema,
  stockAdjustSchema,
} from '../schemas/index.js'
import { storageService, upload } from '../services/storage.js'

export const adminRouter = Router()
adminRouter.use(requireAuth)

const productInclude = {
  category: true,
  images: { orderBy: { sortOrder: 'asc' as const } },
  extras: true,
  attributes: { include: { attribute: { include: { values: true } } } },
  variants: {
    include: {
      attributes: { include: { attributeValue: { include: { attribute: true } } } },
    },
  },
} as const

adminRouter.get('/dashboard', async (_req, res, next) => {
  try {
    const start = new Date()
    start.setHours(0, 0, 0, 0)
    const [
      publishedCount,
      soldOutCount,
      lowStockVariants,
      newOrders,
      todayOrders,
      salesAgg,
      topItems,
    ] = await Promise.all([
      prisma.product.count({ where: { deletedAt: null, status: 'PUBLISHED' } }),
      prisma.product.count({ where: { deletedAt: null, status: 'SOLD_OUT' } }),
      prisma.productVariant
        .findMany({
          where: { isActive: true, product: { deletedAt: null } },
          take: 100,
          include: {
            product: true,
            attributes: { include: { attributeValue: { include: { attribute: true } } } },
          },
        })
        .then((rows) => rows.filter((v) => v.stock <= v.minStock).slice(0, 20)),
      prisma.order.count({ where: { status: 'NEW' } }),
      prisma.order.findMany({
        where: { createdAt: { gte: start }, status: { not: 'CANCELLED' } },
      }),
      prisma.order.aggregate({
        where: { status: { not: 'CANCELLED' } },
        _sum: { totalCents: true },
      }),
      prisma.orderItem.groupBy({
        by: ['productName'],
        _sum: { quantity: true, lineTotalCents: true },
        orderBy: { _sum: { quantity: 'desc' } },
        take: 5,
      }),
    ])

    res.json({
      publishedProducts: publishedCount,
      soldOutProducts: soldOutCount,
      lowStockVariants,
      newOrders,
      ordersToday: todayOrders.length,
      salesTodayCents: todayOrders.reduce((s, o) => s + o.totalCents, 0),
      totalSalesCents: salesAgg._sum.totalCents ?? 0,
      topProducts: topItems,
    })
  } catch (error) {
    next(error)
  }
})

adminRouter.get('/categories', async (_req, res, next) => {
  try {
    res.json(
      await prisma.category.findMany({
        where: { deletedAt: null },
        orderBy: { sortOrder: 'asc' },
      }),
    )
  } catch (error) {
    next(error)
  }
})

adminRouter.post('/categories', validateBody(categorySchema), async (req, res, next) => {
  try {
    const data = req.body as {
      name: string
      slug?: string
      description?: string
      imageUrl?: string | null
      sortOrder?: number
      isActive?: boolean
    }
    const category = await prisma.category.create({
      data: {
        name: data.name,
        slug: data.slug || toSlug(data.name),
        description: data.description ?? '',
        imageUrl: data.imageUrl ?? null,
        sortOrder: data.sortOrder ?? 0,
        isActive: data.isActive ?? true,
      },
    })
    res.status(201).json(category)
  } catch (error) {
    next(error)
  }
})

adminRouter.put('/categories/:id', validateBody(categorySchema), async (req, res, next) => {
  try {
    const id = routeParam(req.params.id)
    const data = req.body
    const category = await prisma.category.update({
      where: { id },
      data: {
        name: data.name,
        slug: data.slug || toSlug(data.name),
        description: data.description ?? '',
        imageUrl: data.imageUrl ?? null,
        sortOrder: data.sortOrder ?? 0,
        isActive: data.isActive ?? true,
      },
    })
    res.json(category)
  } catch (error) {
    next(error)
  }
})

adminRouter.delete('/categories/:id', async (req, res, next) => {
  try {
    await prisma.category.update({
      where: { id: routeParam(req.params.id) },
      data: { deletedAt: new Date(), isActive: false },
    })
    res.json({ ok: true })
  } catch (error) {
    next(error)
  }
})

adminRouter.get('/attributes', async (_req, res, next) => {
  try {
    res.json(
      await prisma.attribute.findMany({
        include: { values: { where: { isActive: true }, orderBy: { sortOrder: 'asc' } } },
        orderBy: { sortOrder: 'asc' },
      }),
    )
  } catch (error) {
    next(error)
  }
})

adminRouter.post('/attributes', validateBody(attributeSchema), async (req, res, next) => {
  try {
    const data = req.body
    const attribute = await prisma.attribute.create({
      data: {
        name: data.name,
        slug: data.slug || toSlug(data.name),
        sortOrder: data.sortOrder ?? 0,
        isActive: data.isActive ?? true,
      },
      include: { values: true },
    })
    res.status(201).json(attribute)
  } catch (error) {
    next(error)
  }
})

adminRouter.put('/attributes/:id', validateBody(attributeSchema), async (req, res, next) => {
  try {
    const id = routeParam(req.params.id)
    const data = req.body
    res.json(
      await prisma.attribute.update({
        where: { id },
        data: {
          name: data.name,
          slug: data.slug || toSlug(data.name),
          sortOrder: data.sortOrder ?? 0,
          isActive: data.isActive ?? true,
        },
        include: { values: true },
      }),
    )
  } catch (error) {
    next(error)
  }
})

adminRouter.post(
  '/attributes/:id/values/ensure',
  validateBody(ensurePaletteSchema),
  async (req, res, next) => {
    try {
      const attributeId = routeParam(req.params.id)
      const { colors } = req.body as {
        colors: Array<{ name: string; hexCode: string }>
      }
      const values = []
      for (const [index, color] of colors.entries()) {
        const slug = toSlug(color.name)
        values.push(
          await prisma.attributeValue.upsert({
            where: { attributeId_slug: { attributeId, slug } },
            update: {
              name: color.name,
              hexCode: color.hexCode.toUpperCase(),
              isActive: true,
            },
            create: {
              attributeId,
              name: color.name,
              slug,
              hexCode: color.hexCode.toUpperCase(),
              abbreviation: color.name.slice(0, 3).toUpperCase(),
              sortOrder: index + 1,
              isActive: true,
            },
          }),
        )
      }
      res.json(values)
    } catch (error) {
      next(error)
    }
  },
)

adminRouter.post(
  '/attributes/:id/values',
  validateBody(attributeValueSchema),
  async (req, res, next) => {
    try {
      const attributeId = routeParam(req.params.id)
      const data = req.body
      const slug = data.slug || toSlug(data.name)
      const value = await prisma.attributeValue.upsert({
        where: { attributeId_slug: { attributeId, slug } },
        update: {
          name: data.name,
          abbreviation: data.abbreviation ?? undefined,
          hexCode: data.hexCode ?? undefined,
          imageUrl: data.imageUrl ?? undefined,
          isActive: true,
        },
        create: {
          attributeId,
          name: data.name,
          slug,
          abbreviation: data.abbreviation ?? null,
          hexCode: data.hexCode ?? null,
          imageUrl: data.imageUrl ?? null,
          sortOrder: data.sortOrder ?? 0,
          isActive: true,
        },
      })
      res.status(201).json(value)
    } catch (error) {
      next(error)
    }
  },
)

adminRouter.put(
  '/attribute-values/:id',
  validateBody(attributeValueSchema),
  async (req, res, next) => {
    try {
      const id = routeParam(req.params.id)
      const data = req.body
      res.json(
        await prisma.attributeValue.update({
          where: { id },
          data: {
            name: data.name,
            slug: data.slug || toSlug(data.name),
            abbreviation: data.abbreviation ?? null,
            hexCode: data.hexCode ?? null,
            imageUrl: data.imageUrl ?? null,
            sortOrder: data.sortOrder ?? 0,
            isActive: data.isActive ?? true,
          },
        }),
      )
    } catch (error) {
      next(error)
    }
  },
)

adminRouter.get('/products', async (_req, res, next) => {
  try {
    res.json(
      await prisma.product.findMany({
        where: { deletedAt: null },
        include: productInclude,
        orderBy: [{ sortOrder: 'asc' }, { updatedAt: 'desc' }],
      }),
    )
  } catch (error) {
    next(error)
  }
})

adminRouter.get('/products/:id', async (req, res, next) => {
  try {
    const product = await prisma.product.findFirst({
      where: { id: routeParam(req.params.id), deletedAt: null },
      include: productInclude,
    })
    if (!product) throw new AppError(404, 'Producto no encontrado')
    res.json(product)
  } catch (error) {
    next(error)
  }
})

async function upsertProductGraph(productId: string, data: {
  attributeIds?: string[]
  extras?: Array<{ id?: string; name: string; priceCents: number; isActive?: boolean }>
  variants?: Array<{
    id?: string
    sku: string
    priceCents?: number | null
    priceDeltaCents?: number
    stock: number
    minStock: number
    weightGrams?: number | null
    imageUrl?: string | null
    isActive?: boolean
    attributeValueIds: string[]
  }>
  images?: Array<{ id?: string; url: string; alt?: string; isPrimary?: boolean; sortOrder?: number }>
}) {
  await prisma.productAttribute.deleteMany({ where: { productId } })
  if (data.attributeIds?.length) {
    await prisma.productAttribute.createMany({
      data: data.attributeIds.map((attributeId) => ({ productId, attributeId })),
    })
  }

  await prisma.productExtra.deleteMany({ where: { productId } })
  if (data.extras?.length) {
    await prisma.productExtra.createMany({
      data: data.extras.map((extra) => ({
        productId,
        name: extra.name,
        priceCents: extra.priceCents,
        isActive: extra.isActive ?? true,
      })),
    })
  }

  await prisma.productImage.deleteMany({ where: { productId } })
  if (data.images?.length) {
    await prisma.productImage.createMany({
      data: data.images.map((image, index) => ({
        productId,
        url: image.url,
        alt: image.alt ?? '',
        isPrimary: image.isPrimary ?? index === 0,
        sortOrder: image.sortOrder ?? index,
      })),
    })
  }

  if (data.variants) {
    const existing = await prisma.productVariant.findMany({ where: { productId } })
    const keepIds = data.variants.map((v) => v.id).filter(Boolean) as string[]
    const toDelete = existing.filter((v) => !keepIds.includes(v.id))
    for (const variant of toDelete) {
      await prisma.variantAttributeValue.deleteMany({ where: { variantId: variant.id } })
      await prisma.productVariant.delete({ where: { id: variant.id } })
    }

    for (const variant of data.variants) {
      const saved = variant.id
        ? await prisma.productVariant.update({
            where: { id: variant.id },
            data: {
              sku: variant.sku,
              priceCents: variant.priceCents ?? null,
              priceDeltaCents: variant.priceDeltaCents ?? 0,
              stock: variant.stock,
              minStock: variant.minStock,
              weightGrams: variant.weightGrams ?? null,
              imageUrl: variant.imageUrl ?? null,
              isActive: variant.isActive ?? true,
            },
          })
        : await prisma.productVariant.create({
            data: {
              productId,
              sku: variant.sku,
              priceCents: variant.priceCents ?? null,
              priceDeltaCents: variant.priceDeltaCents ?? 0,
              stock: variant.stock,
              minStock: variant.minStock,
              weightGrams: variant.weightGrams ?? null,
              imageUrl: variant.imageUrl ?? null,
              isActive: variant.isActive ?? true,
            },
          })

      await prisma.variantAttributeValue.deleteMany({ where: { variantId: saved.id } })
      await prisma.variantAttributeValue.createMany({
        data: variant.attributeValueIds.map((attributeValueId) => ({
          variantId: saved.id,
          attributeValueId,
        })),
      })
    }
  }
}

adminRouter.post('/products', validateBody(productSchema), async (req, res, next) => {
  try {
    const data = req.body
    const product = await prisma.product.create({
      data: {
        name: data.name,
        slug: data.slug || toSlug(data.name),
        shortDescription: data.shortDescription ?? '',
        description: data.description ?? '',
        categoryId: data.categoryId,
        basePriceCents: data.basePriceCents,
        salePriceCents: data.salePriceCents ?? null,
        costCents: data.costCents ?? null,
        sku: data.sku ?? null,
        brand: data.brand ?? null,
        status: data.status,
        isFeatured: data.isFeatured ?? false,
        isNew: data.isNew ?? false,
        hasVariants: data.hasVariants ?? false,
        trackInventory: data.trackInventory ?? true,
        stock: data.stock ?? 0,
        minStock: data.minStock ?? 0,
        sortOrder: data.sortOrder ?? 0,
      },
    })
    await upsertProductGraph(product.id, data)
    const full = await prisma.product.findUnique({ where: { id: product.id }, include: productInclude })
    res.status(201).json(full)
  } catch (error) {
    next(error)
  }
})

adminRouter.put('/products/:id', validateBody(productSchema), async (req, res, next) => {
  try {
    const id = routeParam(req.params.id)
    const data = req.body
    await prisma.product.update({
      where: { id },
      data: {
        name: data.name,
        slug: data.slug || toSlug(data.name),
        shortDescription: data.shortDescription ?? '',
        description: data.description ?? '',
        categoryId: data.categoryId,
        basePriceCents: data.basePriceCents,
        salePriceCents: data.salePriceCents ?? null,
        costCents: data.costCents ?? null,
        sku: data.sku ?? null,
        brand: data.brand ?? null,
        status: data.status,
        isFeatured: data.isFeatured ?? false,
        isNew: data.isNew ?? false,
        hasVariants: data.hasVariants ?? false,
        trackInventory: data.trackInventory ?? true,
        stock: data.stock ?? 0,
        minStock: data.minStock ?? 0,
        sortOrder: data.sortOrder ?? 0,
      },
    })
    await upsertProductGraph(id, data)
    res.json(await prisma.product.findUnique({ where: { id }, include: productInclude }))
  } catch (error) {
    next(error)
  }
})

adminRouter.delete('/products/:id', async (req, res, next) => {
  try {
    await prisma.product.update({
      where: { id: routeParam(req.params.id) },
      data: { deletedAt: new Date(), status: 'DISABLED' },
    })
    res.json({ ok: true })
  } catch (error) {
    next(error)
  }
})

adminRouter.post(
  '/products/:id/generate-variants',
  validateBody(generateVariantsSchema),
  async (req, res, next) => {
    try {
      const productId = routeParam(req.params.id)
      const product = await prisma.product.findUnique({ where: { id: productId } })
      if (!product) throw new AppError(404, 'Producto no encontrado')
      const { attributeValueGroups, skuPrefix, defaultStock = 0 } = req.body as {
        attributeValueGroups: string[][]
        skuPrefix: string
        defaultStock?: number
      }
      const combos = cartesianProduct(attributeValueGroups)
      const values = await prisma.attributeValue.findMany({
        where: { id: { in: attributeValueGroups.flat() } },
      })
      const byId = new Map(values.map((v) => [v.id, v]))

      const created = []
      for (const combo of combos) {
        const labels = combo.map((id) => byId.get(id)?.abbreviation || byId.get(id)?.slug || id)
        const sku = `${skuPrefix}-${labels.join('-')}`.toUpperCase()
        const existing = await prisma.productVariant.findUnique({ where: { sku } })
        if (existing) continue
        const variant = await prisma.productVariant.create({
          data: {
            productId: product.id,
            sku,
            stock: defaultStock,
            attributes: {
              create: combo.map((attributeValueId) => ({ attributeValueId })),
            },
          },
          include: {
            attributes: { include: { attributeValue: { include: { attribute: true } } } },
          },
        })
        created.push(variant)
      }

      await prisma.product.update({
        where: { id: product.id },
        data: { hasVariants: true },
      })

      res.status(201).json(created)
    } catch (error) {
      next(error)
    }
  },
)

adminRouter.patch(
  '/variants/:id/stock',
  validateBody(stockAdjustSchema),
  async (req, res, next) => {
    try {
      const variant = await prisma.productVariant.findUnique({
        where: { id: routeParam(req.params.id) },
      })
      if (!variant) throw new AppError(404, 'Variante no encontrada')
      const previousStock = variant.stock
      const finalStock = req.body.stock as number
      const updated = await prisma.productVariant.update({
        where: { id: variant.id },
        data: { stock: finalStock },
      })
      await prisma.inventoryMovement.create({
        data: {
          productId: variant.productId,
          variantId: variant.id,
          adminUserId: req.admin?.sub,
          previousStock,
          delta: finalStock - previousStock,
          finalStock,
          reason: 'MANUAL',
          note: req.body.note || 'Ajuste manual de stock',
        },
      })
      res.json(updated)
    } catch (error) {
      next(error)
    }
  },
)

adminRouter.get('/settings', async (_req, res, next) => {
  try {
    const settings = await prisma.businessSettings.findUnique({ where: { id: 'default' } })
    if (!settings) throw new AppError(404, 'Configuración no encontrada')
    res.json(settings)
  } catch (error) {
    next(error)
  }
})

adminRouter.put('/settings', validateBody(settingsSchema), async (req, res, next) => {
  try {
    const data = req.body as {
      storeName: string
      tagline?: string
      logoUrl?: string | null
      whatsappNumber: string
      address?: string
      phone?: string
      email?: string
      currency?: string
      deliveryFeeCents: number
      minimumOrderCents: number
      hoursJson?: unknown
      deliveryZonesJson?: unknown
      paymentMethodsJson?: unknown
      socialJson?: unknown
      ticketFooter?: string
      cardPaymentAvailable?: boolean
    }
    const mapped = {
      storeName: data.storeName,
      tagline: data.tagline ?? '',
      logoUrl: data.logoUrl ?? null,
      whatsappNumber: data.whatsappNumber,
      address: data.address ?? '',
      phone: data.phone ?? '',
      email: data.email ?? '',
      currency: data.currency ?? 'Bs',
      deliveryFeeCents: data.deliveryFeeCents,
      minimumOrderCents: data.minimumOrderCents,
      hoursJson: data.hoursJson ?? [],
      deliveryZonesJson: data.deliveryZonesJson ?? [],
      paymentMethodsJson: data.paymentMethodsJson ?? [],
      socialJson: data.socialJson ?? [],
      ticketFooter: data.ticketFooter ?? '',
      cardPaymentAvailable: data.cardPaymentAvailable ?? true,
    }
    const settings = await prisma.businessSettings.upsert({
      where: { id: 'default' },
      create: { id: 'default', ...mapped },
      update: mapped,
    })
    res.json(settings)
  } catch (error) {
    next(error)
  }
})

adminRouter.post('/uploads', upload.single('file'), async (req, res, next) => {
  try {
    if (!req.file) throw new AppError(400, 'Archivo requerido')
    res.status(201).json(storageService.fromMulter(req.file))
  } catch (error) {
    next(error)
  }
})
