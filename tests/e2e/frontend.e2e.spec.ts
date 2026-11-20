import { test, expect } from '@playwright/test'

test.describe('Frontend', () => {
  test('mostra la home', async ({ page }) => {
    await page.goto('http://localhost:3000')

    await expect(page).toHaveTitle(/Mi ci metto/)
    await expect(page.locator('h1').first()).toHaveText('Ricette')
  })

  test('una ricetta che non esiste dà 404', async ({ page }) => {
    const res = await page.goto('http://localhost:3000/ricetta/non-esiste-davvero')
    expect(res?.status()).toBe(404)
  })
})
