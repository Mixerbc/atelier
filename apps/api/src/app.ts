import cookieParser from 'cookie-parser'
import cors from 'cors'
import express from 'express'
import helmet from 'helmet'
import path from 'node:path'
import { env, isProd } from './config/env.js'
import { errorHandler, notFound } from './lib/errors.js'
import { adminRouter } from './routes/admin.js'
import { authRouter } from './routes/auth.js'
import { ordersRouter } from './routes/orders.js'
import { storeRouter } from './routes/store.js'

export function createApp() {
  const app = express()
  app.set('trust proxy', 1)
  app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }))
  app.use(
    cors({
      origin: env.CORS_ORIGIN.split(',').map((v) => v.trim()),
      credentials: true,
    }),
  )
  app.use(express.json({ limit: '1mb' }))
  app.use(cookieParser())
  app.use('/uploads', express.static(path.resolve(env.UPLOAD_DIR), { maxAge: isProd ? '7d' : 0 }))

  app.get('/api/health', (_req, res) => res.json({ ok: true }))
  app.use('/api/auth', authRouter)
  app.use('/api/store', storeRouter)
  app.use('/api/orders', ordersRouter)
  app.use('/api/admin', adminRouter)
  app.use(notFound)
  app.use(errorHandler)
  return app
}
