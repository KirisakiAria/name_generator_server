const Router = require('@koa/router')
const JWT = require('../utils/jwt')
const config = require('../config/config')
const name = require('./name')
const user = require('./user')

const router = new Router({ prefix: `/api/${config.apiVersion}` })

//登陆状态判断
router.use(async (ctx, next) => {
  const url = ctx.request.originalUrl
  if (!url.includes('login')) {
    const jwt = new JWT(ctx.request.header.authorization)
    const res = jwt.verifyToken()
    if (res.code == '1000') {
      ctx.tel = res.tel
      await next()
    } else {
      ctx.body = {
        code: res.code,
        message: res.message,
      }
    }
  } else {
    await next()
  }
})

router.use(name.routes())
router.use(user.routes())

module.exports = router
