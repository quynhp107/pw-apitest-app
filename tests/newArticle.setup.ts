import { test as setup, expect } from '@playwright/test';

setup('create new article', async ({ request }) => {
    const articleResponse = await request.post('https://conduit-api.bondaracademy.com/api/articles/', {
        data: {
            "article": {
                "title": "Like test article",
                "description": "test description",
                "body": "test detail",
                "tagList": ["playwright"]
            }
        }
    })
    expect(articleResponse.status()).toEqual(201)
    const articleResponseBody = await articleResponse.json()
    const slugId = articleResponseBody.article.slug
    process.env['SLUGID'] = slugId

})