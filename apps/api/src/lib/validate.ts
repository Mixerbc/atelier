import type { NextFunction, Request, Response } from 'express'
import type { ZodType } from 'zod'
import { AppError } from './errors.js'

export function validateBody<T>(schema: ZodType<T>) {
  return (req: Request, _res: Response, next: NextFunction) => {
    const parsed = schema.safeParse(req.body)
    if (!parsed.success) {
      return next(new AppError(400, 'Datos inválidos', parsed.error.flatten()))
    }
    req.body = parsed.data
    next()
  }
}
