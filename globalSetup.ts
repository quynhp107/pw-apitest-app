import { request, expect } from '@playwright/test'
import user from '../pw-apitest-app/.auth/user.json'
import fs from 'fs'

async function globalSetup() {
    const authFile = '.auth/user.json'
    const context = await request.newContext()

    const response = await context.post('https://conduit-api.bondaracademy.com/api/users/login', {
        data: {
            "user": {
                "email": "quynh88@gmail.com",
                "password": "quynh88"
            }
        }
    })
    const responseBody = await response.json()
    const accessToken = responseBody.user.token
    user.origins[0].localStorage[0].value = accessToken
    fs.writeFileSync(authFile, JSON.stringify(user))

    process.env['ACCESS_TOKEN'] = accessToken


    const articleResponse = await context.post('https://conduit-api.bondaracademy.com/api/articles/', {
        data: {
            "article": {
                "title": "Global like test article",
                "description": "test description",
                "body": "test detail",
                "tagList": ["playwright"]
            }
        },
        headers: {
            Authorization: `Token ${process.env.ACCESS_TOKEN}`
        }
    })
    expect(articleResponse.status()).toEqual(201)
    const articleResponseBody = await articleResponse.json()
    const slugId = articleResponseBody.article.slug
    process.env['SLUGID'] = slugId
}

export default globalSetup;