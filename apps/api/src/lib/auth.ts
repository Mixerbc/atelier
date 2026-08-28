import argon2 from 'argon2'
import type { CookieOptions, NextFunction, Request, Response } from 'express'
import jwt from 'jsonwebtoken'
import { env, isProd } from '../config/env.js'
import { AppError } from './errors.js'
import { prisma } from './prisma.js'

export type AdminPayload = { sub: string; email: string; name: string }

declare global {
  namespace Express {
    interface Request {
      admin?: AdminPayload
    }
  }
}

export async function hashPassword(password: string) {
  return argon2.hash(password)
}

export async function verifyPassword(hash: string, password: string) {
  return argon2.verify(hash, password)
}

export function signAdminToken(payload: AdminPayload) {
  return jwt.sign(payload, env.JWT_SECRET, { expiresIn: env.JWT_EXPIRES_IN } as jwt.SignOptions)
}

export function cookieOptions(): CookieOptions {
  return {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? 'none' : 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000,
    path: '/',
  }
}

export function setAuthCookie(res: Response, token: string) {
  res.cookie(env.COOKIE_NAME, token, cookieOptions())
}

export function clearAuthCookie(res: Response) {
  res.clearCookie(env.COOKIE_NAME, { ...cookieOptions(), maxAge: 0 })
}

export async function requireAuth(req: Request, _res: Response, next: NextFunction) {
  try {
    const cookieToken =
      typeof req.cookies?.[env.COOKIE_NAME] === 'string' ? req.cookies[env.COOKIE_NAME] : null
    const headerToken = req.headers.authorization?.startsWith('Bearer ')
      ? req.headers.authorization.slice(7)
      : null
    const token = cookieToken || headerToken
    if (!token) throw new AppError(401, 'No autenticado')
    const payload = jwt.verify(token, env.JWT_SECRET) as AdminPayload
    const admin = await prisma.adminUser.findFirst({ where: { id: payload.sub, isActive: true } })
    if (!admin) throw new AppError(401, 'Sesión inválida')
    req.admin = { sub: admin.id, email: admin.email, name: admin.name }
    next()
  } catch {
    next(new AppError(401, 'Sesión inválida o expirada'))
  }
}
