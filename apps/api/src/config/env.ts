import 'dotenv/config'
import { z } from 'zod'

const schema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().default(4000),
  DATABASE_URL: z.string().min(1),
  JWT_SECRET: z.string().min(16),
  JWT_EXPIRES_IN: z.string().default('7d'),
  COOKIE_NAME: z.string().default('atelier_admin_token'),
  CORS_ORIGIN: z.string().default('http://localhost:5173'),
  UPLOAD_DIR: z.string().default('uploads'),
  MAX_UPLOAD_BYTES: z.coerce.number().default(2_000_000),
})

export const env = schema.parse(process.env)
export const isProd = env.NODE_ENV === 'production'
