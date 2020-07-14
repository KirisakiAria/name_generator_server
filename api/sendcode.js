const Router = require('@koa/router')
const userModel = require('../model/User')
const router = new Router()

const sendCode = tel => {
  console.log(tel)
}

router.post('/sendcode', async ctx => {
  const { tel } = ctx.request.body
  try {
    const user = await userModel.findOne({ tel })
    if (user) {
      ctx.body = {
        code: '3000',
        message: '用户已存在',
      }
    } else {
      sendCode(tel)
      ctx.body = {
        code: '1000',
        message: '发送成功',
      }
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
