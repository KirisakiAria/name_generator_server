const fs = require('fs')
const Router = require('@koa/router')
const UserModel = require('../model/User')
const SMSModel = require('../model/SMS')
const router = new Router({ prefix: '/register' })

router.post('/', async ctx => {
  const writerStream = fs.createWriteStream(
    process.cwd() + '/logs/register.log',
    {
      flags: 'a',
    },
  )

  writerStream.on('error', function (err) {
    console.log(err.stack)
  })

  const { tel, password, authCode } = ctx.request.body

  try {
    const userDoc = await UserModel.findOne({ tel })
    if (userDoc) {
      ctx.body = {
        code: '3000',
        message: '用户已存在，请登录',
      }
    } else {
      const smsDoc = await SMSModel.findOne({ tel })
      console.log(authCode)
      console.log(smsDoc.authCode)
      if (!smsDoc) {
        ctx.body = {
          code: '3006',
          message: '请先发送验证码',
        }
      } else if (authCode != smsDoc.authCode) {
        ctx.body = {
          code: '3002',
          message: '验证码错误',
        }
      } else {
        const newUser = new UserModel({
          tel,
          password,
          avatar: '',
          usernmae: '',
        })
        await newUser.save()
        writerStream.write(`用户${tel}在${new Date()}注册,`, 'UTF8')
        writerStream.end()
        ctx.body = {
          code: '1000',
          message: '注册成功',
        }
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
