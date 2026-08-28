import { expect, type Page } from '@playwright/test'

export const ADMIN_EMAIL = 'admin@atelier.mx'
export const ADMIN_PASSWORD = 'AtelierAdmin123!'

export async function loginAdmin(page: Page) {
  await page.goto('/admin/login')
  await page.getByLabel('Email').fill(ADMIN_EMAIL)
  await page.getByLabel('Contraseña').fill(ADMIN_PASSWORD)
  await page.getByRole('button', { name: 'Entrar' }).click()
  await page.waitForURL(/\/admin(?!\/login)/)
  await expect(page.getByRole('link', { name: 'Productos' })).toBeVisible()
}

export async function stubWhatsApp(page: Page) {
  await page.addInitScript(() => {
    Object.defineProperty(window, 'open', {
      configurable: true,
      writable: true,
      value: () => null,
    })
  })
}
