import fs from 'node:fs/promises'
import path from 'node:path'
import { randomUUID } from 'node:crypto'
import multer from 'multer'
import { env } from '../config/env.js'
import { AppError } from '../lib/errors.js'

const ALLOWED = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml'])

async function ensureDir() {
  const dir = path.resolve(env.UPLOAD_DIR)
  await fs.mkdir(dir, { recursive: true })
  return dir
}

export const upload = multer({
  storage: multer.diskStorage({
    destination: async (_req, _file, cb) => {
      try {
        cb(null, await ensureDir())
      } catch (error) {
        cb(error as Error, '')
      }
    },
    filename: (_req, file, cb) => {
      const ext = path.extname(file.originalname).toLowerCase() || '.bin'
      cb(null, `${Date.now()}-${randomUUID()}${ext}`)
    },
  }),
  limits: { fileSize: env.MAX_UPLOAD_BYTES },
  fileFilter: (_req, file, cb) => {
    if (!ALLOWED.has(file.mimetype)) {
      cb(new AppError(400, 'Formato de imagen no permitido'))
      return
    }
    cb(null, true)
  },
})

export const storageService = {
  upload,
  fromMulter(file: Express.Multer.File) {
    return {
      url: `/uploads/${file.filename}`,
      filename: file.filename,
      size: file.size,
      mimeType: file.mimetype,
    }
  },
}
