import { test, expect } from '@playwright/test';
import tags from "../test_data/tags.json"

test.beforeEach(async ({ page }) => {
  await page.route('https://conduit-api.bondaracademy.com/api/tags', async route => {
    await route.fulfill({
      body: JSON.stringify(tags)
    })
  })
  await page.route('*/**/api/articles*', async route => {
    const response = await route.fetch()
    const responseBody = await response.json()
    responseBody.articles[0].title = "This is title"
    responseBody.articles[0].description = "This is description"
    await route.fulfill({
      body: JSON.stringify(responseBody)
    })
  })

  await page.goto('https://conduit.bondaracademy.com/')
  await page.waitForTimeout(1000)
})
test('has title', async ({ page }) => {
  await expect(page.locator('.navbar-brand')).toHaveText('conduit')
  await expect(page.locator('app-article-list h1').first()).toContainText('This is title')
  await expect(page.locator('app-article-list p').first()).toContainText('This is description')
})