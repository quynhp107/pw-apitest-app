import { test, expect } from '@playwright/test';
import tags from "../test_data/tags.json"

/*test.beforeEach(async ({ page }) => {
  await page.route('https://conduit-api.bondaracademy.com/api/tags', async route => {
    await route.fulfill({
      body: JSON.stringify(tags)
    })
  })


  await page.goto('https://conduit.bondaracademy.com/')
  await page.waitForTimeout(1000)
})*/
test('has title', async ({ page }) => {
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

test('delete article', async ({ page, request }) => {
  const response = await request.post('https://conduit-api.bondaracademy.com/api/users/login', {
    data: {
      "user": {
        "email": "quynh88@gmail.com",
        "password": "quynh88"
      }
    }
  })
  const responseBody = await response.json()
  const accessToken = responseBody.user.token

  const articleResponse = await request.post('https://conduit-api.bondaracademy.com/api/articles/', {
    data: {
      "article": {
        "title": "test title ",
        "description": "test description",
        "body": "test detail",
        "tagList": ["playwright"]
      }
    },
    headers: {
      Authorization: `Token ${accessToken}`
    }
  })
  expect(articleResponse.status()).toEqual(201)

  const getArticleList = await request.get('https://conduit-api.bondaracademy.com/api/articles?limit=10&offset=0', {
    headers: {
      Authorization: `Token ${accessToken}`
    }
  })
  const getArticleListResponse = await getArticleList.json()
  const articleId = getArticleListResponse.articles[0].slug

  await request.delete(`https://conduit-api.bondaracademy.com/api/articles/${articleId}`, {
    headers: {
      Authorization: `Token ${accessToken}`
    }
  })
})