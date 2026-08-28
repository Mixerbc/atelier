import { expect, test } from '@playwright/test'
import { stubWhatsApp } from './helpers'

test('cliente puede armar el carrito y enviar el pedido por WhatsApp', async ({ page }) => {
  await stubWhatsApp(page)

  await page.goto('/producto/playera-clasica')
  await expect(page.getByRole('heading', { name: 'Playera clásica', level: 1 })).toBeVisible()

  await page.getByRole('button', { name: 'Negro' }).click()
  await page.getByRole('button', { name: 'Chica' }).click()
  await page.getByRole('button', { name: /Agregar ·/ }).click()
  await expect(page.getByRole('status').filter({ hasText: 'se agregó al carrito' })).toBeVisible()

  await page.getByRole('link', { name: /Carrito, \d+ artículos/ }).click()
  await expect(page).toHaveURL(/\/carrito/)
  await expect(page.getByRole('heading', { name: 'Carrito', level: 1 })).toBeVisible()
  await expect(page.getByRole('heading', { name: 'Playera clásica' })).toBeVisible()
  await page.getByRole('link', { name: 'Continuar con el pedido' }).click()

  await expect(page).toHaveURL(/\/checkout/)
  await page.getByLabel('Nombre completo').fill('Ana Pérez')
  await page.getByLabel('Número telefónico').fill('4241234567')
  await page.getByRole('radio', { name: 'Recoger en tienda' }).check()
  await page.getByRole('radio', { name: 'Pago móvil' }).check()

  const orderResponse = page.waitForResponse(
    (response) =>
      response.url().includes('/api/orders') &&
      response.request().method() === 'POST',
  )
  await page.getByRole('button', { name: 'Enviar pedido por WhatsApp' }).click()
  const created = await orderResponse
  expect(created.ok()).toBeTruthy()

  await expect(page).toHaveURL(/\/pedido-enviado/)
  await expect(page.getByRole('heading', { name: 'Pedido registrado' })).toBeVisible()
})
