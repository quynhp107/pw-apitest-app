import { test, expect } from '@playwright/test';
import tags from "../test_data/tags.json"

test.beforeEach(async ({ page }) => {
  await page.route('https://conduit-api.bondaracademy.com/api/tags', async route => {
    await route.fulfill({
      body: JSON.stringify(tags)
    })
  })


  await page.goto('https://conduit.bondaracademy.com/')
  await page.waitForTimeout(1000)
})
test.only('has title', async ({ page }) => {
  await page.route('*/**/api/articles*', async route => {
    const response = await route.fetch()
    const responseBody = await response.json()
    responseBody.articles[0].title = "This is MOC title"
    responseBody.articles[0].description = "This is MOC description"
    await route.fulfill({
      body: JSON.stringify(responseBody)
    })
  })
  await page.getByText('Global Feed').click()
  await expect(page.locator('.navbar-brand')).toHaveText('conduit')
  await expect(page.locator('app-article-list h1').first()).toContainText('This is MOC title')
  await expect(page.locator('app-article-list p').first()).toContainText('This is MOC description')
})

/**
 * use api to create article and delete article using UI
 */
test('delete article', async ({ page, request }) => {
  const articleResponse = await request.post('https://conduit-api.bondaracademy.com/api/articles/', {
    data: {
      "article": {
        "title": "test title",
        "description": "test description",
        "body": "test detail",
        "tagList": ["playwright"]
      }
    }
  })
  expect(articleResponse.status()).toEqual(201)

  await page.getByText('Global Feed').click()
  await page.getByText('test title').click()
  await page.getByRole('button', { name: 'Delete Article' }).first().click()
  await page.getByText('Global Feed').click()
  await expect(page.locator('app-article-list h1').first()).not.toContainText('test title')
})


/**
 * use UI to create article and delete article using API
 */
test('create article', async ({ page, request }) => {
  await page.getByText('New Article').click()
  await page.getByPlaceholder('Article Title').fill('test second title')
  await page.getByPlaceholder('What\'s this article about?').fill('test second description')
  await page.getByPlaceholder('Write your article (in markdown)').fill('test second detail')
  await page.getByRole('button', { name: ' Publish Article ' }).click()
  const articleResponse = await page.waitForResponse('https://conduit-api.bondaracademy.com/api/articles/')
  const articleResponseBody = await articleResponse.json()
  const slugId = articleResponseBody.article.slug


  await expect(page.locator('.article-page h1')).toContainText('test second title')
  await page.getByText('Home').click()
  await page.getByText('Global Feed').click()
  await expect(page.locator('app-article-list h1').first()).toContainText('test second title')

  const deleteArticleResponse = await request.delete(`https://conduit-api.bondaracademy.com/api/articles/${slugId}`)
  expect(deleteArticleResponse.status()).toEqual(204)
})