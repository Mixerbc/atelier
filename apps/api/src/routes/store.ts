import { Router } from 'express'
import { AppError } from '../lib/errors.js'
import { routeParam } from '../lib/helpers.js'
import { prisma } from '../lib/prisma.js'
import { resolveUnitPrice } from '../services/pricing.js'

export const storeRouter = Router()

const publicProductInclude = {
  category: true,
  images: { orderBy: { sortOrder: 'asc' as const } },
  extras: { where: { isActive: true } },
  attributes: { include: { attribute: { include: { values: { where: { isActive: true }, orderBy: { sortOrder: 'asc' as const } } } } } },
  variants: {
    where: { isActive: true },
    include: {
      attributes: {
        include: { attributeValue: { include: { attribute: true } } },
      },
    },
  },
} as const

storeRouter.get('/settings', async (_req, res, next) => {
  try {
    const settings = await prisma.businessSettings.findUnique({ where: { id: 'default' } })
    if (!settings) throw new AppError(404, 'Configuración no encontrada')
    res.json(settings)
  } catch (error) {
    next(error)
  }
})

storeRouter.get('/categories', async (_req, res, next) => {
  try {
    const categories = await prisma.category.findMany({
      where: { isActive: true, deletedAt: null },
      orderBy: { sortOrder: 'asc' },
    })
    res.json(categories)
  } catch (error) {
    next(error)
  }
})

storeRouter.get('/products', async (req, res, next) => {
  try {
    const q = typeof req.query.q === 'string' ? req.query.q.trim() : ''
    const category = typeof req.query.category === 'string' ? req.query.category : ''
    const featured = req.query.featured === 'true'

    const products = await prisma.product.findMany({
      where: {
        deletedAt: null,
        status: { in: ['PUBLISHED', 'SOLD_OUT'] },
        ...(featured ? { isFeatured: true } : {}),
        ...(category ? { OR: [{ categoryId: category }, { category: { slug: category } }] } : {}),
        ...(q
          ? {
              OR: [
                { name: { contains: q } },
                { shortDescription: { contains: q } },
                { description: { contains: q } },
              ],
            }
          : {}),
      },
      include: publicProductInclude,
      orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
    })

    res.json(
      products.map((product) => ({
        ...product,
        displayPriceCents: resolveUnitPrice(product),
      })),
    )
  } catch (error) {
    next(error)
  }
})

storeRouter.get('/products/:slug', async (req, res, next) => {
  try {
    const product = await prisma.product.findFirst({
      where: {
        slug: routeParam(req.params.slug),
        deletedAt: null,
        status: { in: ['PUBLISHED', 'SOLD_OUT'] },
      },
      include: publicProductInclude,
    })
    if (!product) throw new AppError(404, 'Producto no encontrado')
    res.json({
      ...product,
      displayPriceCents: resolveUnitPrice(product),
    })
  } catch (error) {
    next(error)
  }
})
