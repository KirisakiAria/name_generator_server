const speakeasy = require('speakeasy')
const JWT = require('../utils/jwt')
const Router = require('@koa/router')
const AdminModel = require('../model/Admin')
const router = new Router({ prefix: '/admin' })
const encrypt = require('../utils/encryption')

router.post('/login', async ctx => {
  try {
    const { username, password, authCode } = ctx.request.body
    const user = await AdminModel.findOne({ username })
    if (user) {
      const verified = speakeasy.totp.verify({
        secret: user.secretCode,
        encoding: 'base32',
        token: authCode,
      })
      if (!verified) {
        return (ctx.body = {
          code: '3009',
          message: '暗号错误',
        })
      }
      if (user.password === encrypt(password)) {
        const jwt = new JWT({
          user: username,
          role: 1,
        })
        const token = jwt.generateToken()
        ctx.body = {
          code: '1000',
          message: '请求成功',
          data: {
            avatar: user.avatar,
            username: user.username,
            uid: user.uid,
            token,
          },
        }
      } else {
        ctx.body = {
          code: '3001',
          message: '帐号或密码错误',
        }
      }
    } else {
      ctx.body = {
        code: '3001',
        message: '帐号或密码错误',
      }
    }
  } catch (err) {
    console.log(err)
    ctx.body = {
      code: '9000',
      message: '请求错误',
    }
  }
})

module.exports = router
