const fs = require('fs')
const Router = require('@koa/router')
const UserModel = require('../model/User')
const SMSModel = require('../model/SMS')
const JWT = require('../utils/jwt')
const timeFormatter = require('../utils/formatter').time
const router = new Router({ prefix: '/user' })

router.post('/login', async ctx => {
  const { tel, password } = ctx.request.body
  try {
    const user = await UserModel.findOne({ tel })
    if (user && user.password === password) {
      const jwt = new JWT(tel)
      const token = jwt.generateToken(tel)
      ctx.body = {
        code: '1000',
        message: '请求成功',
        data: {
          tel: user.tel,
          avatar: user.avatar,
          username: user.username,
          uid: user.uid,
          date: user.date,
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

router.post('/register', async ctx => {
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
        const count = await UserModel.count()
        const newUser = new UserModel({
          uid: count + 1,
          tel,
          password,
          avatar: '/avatar.png',
          date: timeFormatter(new Date()),
          username: '彼岸自在',
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

router.post('/changepassword', async ctx => {
  const writerStream = fs.createWriteStream(
    process.cwd() + '/logs/change_password.log',
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
    if (!userDoc) {
      ctx.body = {
        code: '3000',
        message: '用户不存在，请注册',
      }
    } else {
      const smsDoc = await SMSModel.findOne({ tel })
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
        const result = await UserModel.updateOne(
          { tel },
          { $set: { password } },
        )
        if (result.ok == 1) {
          writerStream.write(`用户${tel}在${new Date()}修改密码,`, 'UTF8')
          writerStream.end()
          ctx.body = {
            code: '1000',
            message: '修改成功',
          }
        } else {
          ctx.body = {
            code: '9000',
            message: '请求错误',
          }
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

router.put('/avatar', async ctx => {
  const { tel, avatar } = ctx.request.body
  try {
    const userDoc = await UserModel.findOne({ tel })
    if (!userDoc) {
      ctx.body = {
        code: '3000',
        message: '用户不存在',
      }
    } else {
      const result = await UserModel.updateOne({ tel }, { $set: { avatar } })
      if (result.ok == 1) {
        ctx.body = {
          code: '1000',
          message: '修改成功',
        }
      } else {
        ctx.body = {
          code: '9000',
          message: '请求错误',
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

router.put('/username', async ctx => {
  const { tel, username } = ctx.request.body
  try {
    const userDoc = await UserModel.findOne({ tel })
    if (!userDoc) {
      ctx.body = {
        code: '3000',
        message: '用户不存在',
      }
    } else {
      const result = await UserModel.updateOne({ tel }, { $set: { username } })
      if (result.ok == 1) {
        ctx.body = {
          code: '1000',
          message: '修改成功',
        }
      } else {
        ctx.body = {
          code: '9000',
          message: '请求错误',
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
