const JWT = require('../utils/jwt')
const Router = require('@koa/router')
const userModel = require('../model/User')
const router = new Router({ prefix: '/login' })

router.post('/', async ctx => {
  const { tel, password } = ctx.request.body
  try {
    const user = await userModel.findOne({ tel })
    if (user && user.password === password) {
      const jwt = new JWT({ tel, password })
      const token = jwt.generateToken(tel)
      ctx.body = {
        code: '1000',
        message: '请求成功',
        data: {
          tel: user.tel,
          avatar: user.avatar || '/avatar.png',
          username: '彼岸自在',
          token,
        },
      }
    } else {
      ctx.body = {
        code: '3001',
        message: '手机号或密码错误',
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
