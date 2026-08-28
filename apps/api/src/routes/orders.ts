import { Router } from 'express'
import rateLimit from 'express-rate-limit'
import { requireAuth } from '../lib/auth.js'
import { AppError } from '../lib/errors.js'
import { routeParam } from '../lib/helpers.js'
import { prisma } from '../lib/prisma.js'
import { validateBody } from '../lib/validate.js'
import { createOrderSchema, orderStatusSchema } from '../schemas/index.js'
import { createOrderFromCart, updateOrderStatus } from '../services/orders.js'

export const ordersRouter = Router()

const orderLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Demasiados pedidos en poco tiempo' },
})

ordersRouter.post('/', orderLimiter, validateBody(createOrderSchema), async (req, res, next) => {
  try {
    const order = await createOrderFromCart(req.body)
    res.status(201).json(order)
  } catch (error) {
    next(error)
  }
})

ordersRouter.get('/admin', requireAuth, async (req, res, next) => {
  try {
    const status = typeof req.query.status === 'string' ? req.query.status : undefined
    const orders = await prisma.order.findMany({
      where: status ? { status: status as never } : undefined,
      include: { customer: true, items: true },
      orderBy: { createdAt: 'desc' },
      take: 100,
    })
    res.json(orders)
  } catch (error) {
    next(error)
  }
})

ordersRouter.get('/admin/:id', requireAuth, async (req, res, next) => {
  try {
    const order = await prisma.order.findUnique({
      where: { id: routeParam(req.params.id) },
      include: { customer: true, items: true },
    })
    if (!order) throw new AppError(404, 'Pedido no encontrado')
    res.json(order)
  } catch (error) {
    next(error)
  }
})

ordersRouter.patch(
  '/admin/:id/status',
  requireAuth,
  validateBody(orderStatusSchema),
  async (req, res, next) => {
    try {
      const order = await updateOrderStatus(
        routeParam(req.params.id),
        req.body.status,
        req.admin?.sub,
      )
      res.json(order)
    } catch (error) {
      next(error)
    }
  },
)
