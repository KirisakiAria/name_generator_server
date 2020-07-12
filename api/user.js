const JWT = require('../utils/jwt')
const Router = require('@koa/router')
const router = new Router({ prefix: '/user' })

router.post('/login', async ctx => {
  const { tel, password } = ctx.request.body
  const jwt = new JWT({ tel, password })
  const res = jwt.generateToken()
  ctx.body = {
    code: 1000,
    data: res,
  }
})

module.exports = router
