import { expect, test } from '@playwright/test'
import { loginAdmin } from './helpers'

test('admin puede crear un producto publicado y aparece en el catálogo', async ({ page }) => {
  const stamp = Date.now().toString(36)
  const name = `Blusa e2e ${stamp}`

  await loginAdmin(page)
  await page.goto('/admin/products/new')
  await expect(page.getByRole('heading', { name: 'Nuevo producto' })).toBeVisible()

  await page.getByPlaceholder('Ej. Vestido midi').fill(name)
  await expect(page.locator('select').filter({ hasText: 'Playeras' })).toBeVisible()
  await page.locator('select').filter({ hasText: 'Elige una categoría' }).selectOption({ label: 'Playeras' })
  await page.locator('select').filter({ hasText: 'Publicado' }).selectOption({ label: 'Publicado' })
  await page.getByPlaceholder('Ej. 150').fill('400')
  await page.getByPlaceholder('Ej. VESTIDO', { exact: true }).fill(`E2E${stamp}`)

  await expect(page.getByText('XS', { exact: true })).toBeVisible()
  await page.getByRole('button', { name: 'Negro', exact: true }).click()
  await expect(page.getByRole('status').filter({ hasText: 'Negro se agregó' })).toBeVisible()

  await page.getByRole('button', { name: 'Armar combinaciones' }).click()
  await expect(page.getByRole('heading', { name: /Combinaciones \(5\)/ })).toBeVisible()

  const createResponse = page.waitForResponse(
    (response) =>
      response.url().includes('/api/admin/products') &&
      response.request().method() === 'POST',
  )
  await page.getByRole('button', { name: 'Guardar', exact: true }).click()
  expect((await createResponse).ok()).toBeTruthy()

  await expect(page).toHaveURL(/\/admin\/products\/.+\/edit/)
  await expect(page.getByRole('heading', { name: 'Editar producto' })).toBeVisible()

  await page.goto(`/?q=${encodeURIComponent(name)}`)
  await expect(page.getByRole('heading', { name, exact: true })).toBeVisible()
})
