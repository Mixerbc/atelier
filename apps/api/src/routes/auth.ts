import { Router } from 'express'
import rateLimit from 'express-rate-limit'
import {
  clearAuthCookie,
  requireAuth,
  setAuthCookie,
  signAdminToken,
  verifyPassword,
} from '../lib/auth.js'
import { AppError } from '../lib/errors.js'
import { prisma } from '../lib/prisma.js'
import { validateBody } from '../lib/validate.js'
import { loginSchema } from '../schemas/index.js'

export const authRouter = Router()

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Demasiados intentos de acceso' },
})

authRouter.post('/login', loginLimiter, validateBody(loginSchema), async (req, res, next) => {
  try {
    const { email, password } = req.body as { email: string; password: string }
    const admin = await prisma.adminUser.findUnique({ where: { email: email.toLowerCase() } })
    if (!admin?.isActive) throw new AppError(401, 'Credenciales inválidas')
    const ok = await verifyPassword(admin.passwordHash, password)
    if (!ok) throw new AppError(401, 'Credenciales inválidas')
    const token = signAdminToken({ sub: admin.id, email: admin.email, name: admin.name })
    setAuthCookie(res, token)
    res.json({ id: admin.id, email: admin.email, name: admin.name })
  } catch (error) {
    next(error)
  }
})

authRouter.post('/logout', (_req, res) => {
  clearAuthCookie(res)
  res.json({ ok: true })
})

authRouter.get('/me', requireAuth, async (req, res, next) => {
  try {
    const admin = await prisma.adminUser.findUnique({ where: { id: req.admin!.sub } })
    if (!admin?.isActive) throw new AppError(401, 'Sesión inválida')
    res.json({ id: admin.id, email: admin.email, name: admin.name })
  } catch (error) {
    next(error)
  }
})

