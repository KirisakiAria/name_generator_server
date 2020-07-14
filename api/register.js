const Router = require('@koa/router')
const userModel = require('../model/User')
const router = new Router()

router.post('/register', async ctx => {
  const { tel, password, authCode } = ctx.request.body
  try {
    const user = await userModel.findOne({ tel })
    if (user) {
      ctx.body = {
        code: '3000',
        message: '用户已存在',
      }
    } else {
      console.log(tel, password, authCode)
    }
  } catch (e) {
    console.log(e)
    ctx.body = {
      code: '9000',
      message: '请求错误',
    }
  }
})

module.exports = router
