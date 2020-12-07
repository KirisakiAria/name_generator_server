const fs = require('fs')
const path = require('path')
const moment = require('moment')
const Router = require('@koa/router')
const AlipaySdk = require('alipay-sdk')
const AliPayForm = require('alipay-sdk/lib/form')
const UserModel = require('../model/User')
const PlanModel = require('../model/Plan')
const SMSModel = require('../model/SMS')
const JWT = require('../utils/jwt')
//const config = require('../config/config')
const router = new Router({ prefix: '/user' })
const encrypt = require('../utils/encryption')
const {
  verifyAppBaseInfo,
  verifyAdminLogin,
  verifyUserLogin,
} = require('../utils/verify')

const filterStartTime = value => {
  if (!value) {
    return '无'
  } else {
    return moment(value).format('YYYY-MM-DD hh:mm:ss')
  }
}

const filterEndTime = value => {
  if (!value) {
    return '无'
  } else if (value > 0) {
    return moment(value).format('YYYY-MM-DD hh:mm:ss')
  } else {
    return '永久'
  }
}

router.post('/login', verifyAppBaseInfo, async ctx => {
  try {
    const writerStream = fs.createWriteStream(
      process.cwd() + '/logs/login.log',
      {
        flags: 'a',
      },
    )
    writerStream.on('error', err => {
      console.log(err.stack)
    })
    const clientIp = ctx.req.connection.remoteAddress
    const { tel, password } = ctx.request.body
    const user = await UserModel.findOne({ tel })
    if (user && user.password === encrypt(password)) {
      const jwt = new JWT({
        user: tel,
        role: 2,
      })
      const token = jwt.generateToken()
      writerStream.write(
        `用户：${tel} IP：${clientIp} 在${moment().format(
          'YYYY-MM-DD HH:mm:ss',
        )} 登录\n`,
        'UTF8',
      )
      writerStream.end()
      ctx.body = {
        code: '1000',
        message: '请求成功',
        data: {
          tel: user.tel,
          avatar: user.avatar,
          username: user.username,
          uid: user.uid,
          vip: user.vip,
          vipStartTime: filterStartTime(user.vipStartTime),
          vipEndTime: filterEndTime(user.vipEndTime),
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
  } catch (err) {
    console.log(err)
    ctx.body = {
      code: '9000',
      message: '请求错误',
    }
  }
})

router.post('/register', verifyAppBaseInfo, async ctx => {
  try {
    const writerStream = fs.createWriteStream(
      process.cwd() + '/logs/register.log',
      {
        flags: 'a',
      },
    )

    writerStream.on('error', err => {
      console.log(err.stack)
    })
    const clientIp = ctx.req.connection.remoteAddress
    const { tel, password, authCode } = ctx.request.body
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
        const count = await UserModel.countDocuments()
        const newUser = new UserModel({
          uid: count + 1,
          tel,
          password: encrypt(password),
          avatar: '/avatar/avatar.png',
          date: moment().format('YYYY-MM-DD'),
          username: '彼岸自在',
          vipStartTime: 0,
          vipEndTime: 0,
          vip: false,
        })
        await newUser.save()
        writerStream.write(
          `用户：${tel} IP：${clientIp} 在${moment().format(
            'YYYY-MM-DD HH:mm:ss',
          )} 注册\n`,
          'UTF8',
        )
        writerStream.end()
        ctx.body = {
          code: '1000',
          message: '注册成功',
        }
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

router.post('/getdata', verifyAppBaseInfo, verifyUserLogin, async ctx => {
  try {
    const { tel } = ctx.request.body
    const jwt = new JWT(ctx.request.header.authorization)
    const res = jwt.verifyToken()
    if (res.user === tel) {
      const user = await UserModel.findOne({ tel })
      if (user) {
        const jwt = new JWT({
          user: tel,
          role: 2,
        })
        const token = jwt.generateToken()
        ctx.body = {
          code: '1000',
          message: '请求成功',
          data: {
            tel: user.tel,
            avatar: user.avatar,
            username: user.username,
            uid: user.uid,
            vip: user.vip,
            vipStartTime: filterStartTime(user.vipStartTime),
            vipEndTime: filterEndTime(user.vipEndTime),
            date: user.date,
            token,
          },
        }
      } else {
        ctx.body = {
          code: '3008',
          message: '无此用户信息，请重新登录',
        }
      }
    } else {
      ctx.body = {
        code: '3007',
        message: '登录状态失效，请重新登录',
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

router.post('/changepassword', verifyAppBaseInfo, async ctx => {
  try {
    const writerStream = fs.createWriteStream(
      process.cwd() + '/logs/change_password.log',
      {
        flags: 'a',
      },
    )

    writerStream.on('error', err => {
      console.log(err.stack)
    })
    const clientIp = ctx.req.connection.remoteAddress
    const { tel, password, authCode } = ctx.request.body
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
          { $set: { password: encrypt(password) } },
        )
        if (result.ok == 1 && result.nModified == 1) {
          writerStream.write(
            `用户：${tel} IP：${clientIp} 在${moment().format(
              'YYYY-MM-DD HH:mm:ss',
            )} 修改密码\n`,
            'UTF8',
          )
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
  } catch (err) {
    console.log(err)
    ctx.body = {
      code: '9000',
      message: '请求错误',
    }
  }
})

router.get('/history', verifyAppBaseInfo, verifyUserLogin, async ctx => {
  try {
    const jwt = new JWT(ctx.request.header.authorization)
    const res = jwt.verifyToken()
    if (res.user) {
      const { page } = ctx.request.query
      const user = await UserModel.findOne({ tel: res.user })
      if (user?.vip) {
        ctx.body = {
          code: '1000',
          message: '请求成功',
          data: {
            list: user.history.slice(page * 15, page * 15 + 15),
          },
        }
      } else if (!user?.vip) {
        const list = user.history.slice(0, 30)
        ctx.body = {
          code: '1000',
          message: '请求成功',
          data: {
            list: list.slice(page * 15, page * 15 + 15),
          },
        }
      } else {
        ctx.body = {
          code: '3008',
          message: '无此用户信息，请重新登录',
        }
      }
    } else {
      ctx.body = {
        code: '3007',
        message: '登录状态失效，请重新登录',
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

router.get('/favourite', verifyAppBaseInfo, verifyUserLogin, async ctx => {
  try {
    const jwt = new JWT(ctx.request.header.authorization)
    const res = jwt.verifyToken()
    if (res.user) {
      const { page } = ctx.request.query
      const user = await UserModel.findOne({ tel: res.user })
      if (user?.vip) {
        ctx.body = {
          code: '1000',
          message: '请求成功',
          data: {
            list: user.favourites.slice(page * 15, page * 15 + 15),
          },
        }
      } else if (!user?.vip) {
        const list = user.favourites.slice(0, 30)
        ctx.body = {
          code: '1000',
          message: '请求成功',
          data: {
            list: list.slice(page * 15, page * 15 + 15),
          },
        }
      } else {
        ctx.body = {
          code: '3008',
          message: '无此用户信息，请重新登录',
        }
      }
    } else {
      ctx.body = {
        code: '3007',
        message: '登录状态失效，请重新登录',
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

router.post('/favourite', verifyAppBaseInfo, verifyUserLogin, async ctx => {
  try {
    const { type, length, word } = ctx.request.body
    const jwt = new JWT(ctx.request.header.authorization)
    const res = jwt.verifyToken()
    if (res.user) {
      const user = await UserModel.findOne({ tel: res.user })
      if (user.favourites.length >= 500) {
        ctx.body = {
          code: '2003',
          message: '收藏网名数量已满',
        }
      } else {
        const index = user.favourites.findIndex(e => e.word === word)
        if (index == -1) {
          user.favourites.unshift({
            type,
            length,
            word,
          })
        }
        user.save()
        ctx.body = {
          code: '1000',
          message: '请求成功',
        }
      }
    } else {
      ctx.body = {
        code: '3008',
        message: '无此用户信息，请重新登录',
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

router.delete(
  '/favourite/:word',
  verifyAppBaseInfo,
  verifyUserLogin,
  async ctx => {
    try {
      const { word } = ctx.params
      const jwt = new JWT(ctx.request.header.authorization)
      const res = jwt.verifyToken()
      if (res.user) {
        const user = await UserModel.findOne({ tel: res.user })
        const index = user.favourites.findIndex(e => e.word === word)
        if (index != -1) {
          user.favourites.splice(index, 1)
        }
        user.save()
        ctx.body = {
          code: '1000',
          message: '请求成功',
        }
      } else {
        ctx.body = {
          code: '3008',
          message: '无此用户信息，请重新登录',
        }
      }
    } catch (err) {
      console.log(err)
      ctx.body = {
        code: '9000',
        message: '请求错误',
      }
    }
  },
)

router.put('/avatar', verifyAppBaseInfo, verifyUserLogin, async ctx => {
  try {
    const { tel, avatar } = ctx.request.body
    const userDoc = await UserModel.findOne({ tel })
    if (!userDoc) {
      ctx.body = {
        code: '3000',
        message: '用户不存在',
      }
    } else {
      const result = await UserModel.updateOne({ tel }, { $set: { avatar } })
      if (result.ok == 1 && result.nModified == 1) {
        ctx.body = {
          code: '1000',
          message: '修改成功',
        }
      } else {
        ctx.body = {
          code: '2000',
          message: '修改失败',
        }
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

router.put('/username', verifyAppBaseInfo, verifyUserLogin, async ctx => {
  try {
    const { tel, username } = ctx.request.body
    const userDoc = await UserModel.findOne({ tel })
    if (!userDoc) {
      ctx.body = {
        code: '3000',
        message: '用户不存在',
      }
    } else {
      const result = await UserModel.updateOne({ tel }, { $set: { username } })
      if (result.ok == 1 && result.nModified == 1) {
        ctx.body = {
          code: '1000',
          message: '修改成功',
        }
      } else {
        ctx.body = {
          code: '2000',
          message: '修改失败',
        }
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

router.get('/', verifyAdminLogin, async ctx => {
  try {
    const { searchContent, pageSize, currentPage } = ctx.request.query
    const pattern = new RegExp(searchContent, 'i')
    const condition = {
      $or: [{ tel: pattern }, { username: pattern }],
    }
    const list = await UserModel.find(condition)
      .sort({ _id: -1 })
      .skip(parseInt(pageSize) * parseInt(currentPage))
      .limit(parseInt(pageSize))
    const total = await UserModel.find(condition).countDocuments()
    ctx.body = {
      code: '1000',
      message: '请求成功',
      data: {
        list,
        total,
      },
    }
  } catch (err) {
    console.log(err)
    ctx.body = {
      code: '9000',
      message: '请求错误',
    }
  }
})

router.post('/', verifyAdminLogin, async ctx => {
  try {
    const {
      avatar,
      tel,
      username,
      password,
      vip,
      vipStartTime,
      vipEndTime,
    } = ctx.request.body
    const userDoc = await UserModel.findOne({ tel })
    if (userDoc) {
      ctx.body = {
        code: '3000',
        message: '用户已存在',
      }
    } else {
      const count = await UserModel.countDocuments()
      const newUser = new UserModel({
        uid: count + 1,
        avatar,
        tel,
        username,
        password: encrypt(password),
        vip,
        vipStartTime,
        vipEndTime,
        date: moment().format('YYYY-MM-DD'),
      })
      await newUser.save()
      ctx.body = {
        code: '1000',
        message: '添加用户成功',
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

router.put('/:id', verifyAdminLogin, async ctx => {
  try {
    const body = ctx.request.body
    const result = await UserModel.updateOne({ _id: ctx.params.id }, body)
    if (result.ok == 1 && result.nModified == 1) {
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
  } catch (err) {
    console.log(err)
    ctx.body = {
      code: '9000',
      message: '请求错误',
    }
  }
})

router.delete('/:id', verifyAdminLogin, async ctx => {
  try {
    const writerStream = fs.createWriteStream(
      process.cwd() + '/logs/user_delete.log',
      {
        flags: 'a',
      },
    )
    writerStream.on('error', err => {
      console.log(err.stack)
    })
    const clientIp = ctx.req.connection.remoteAddress
    const { tel } = ctx.request.query
    const result = await UserModel.deleteOne({ _id: ctx.params.id })
    if (result.ok == 1 && result.deletedCount == 1) {
      writerStream.write(
        `用户：${tel} IP：${clientIp} 在${moment().format(
          'YYYY-MM-DD HH:mm:ss',
        )} 被删除\n`,
        'UTF8',
      )
      writerStream.end()
      ctx.body = {
        code: '1000',
        message: '删除成功',
      }
    } else {
      ctx.body = {
        code: '2000',
        message: '删除失败',
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

router.post('/purchase', verifyAppBaseInfo, verifyUserLogin, async ctx => {
  try {
    const { tel, planId, paymentMethod } = ctx.request.body
    const jwt = new JWT(ctx.request.header.authorization)
    const res = jwt.verifyToken()
    if (res.user === tel) {
      const user = await UserModel.findOne({ tel })
      if (user) {
        const writerStream = fs.createWriteStream(
          process.cwd() + '/logs/order.log',
          {
            flags: 'a',
          },
        )
        writerStream.on('error', err => {
          console.log(err.stack)
        })
        const plan = await PlanModel.findOne({ planId })
        if (paymentMethod == '1') {
          const alipaySdk = new AlipaySdk.default({
            appId: '2021000116660806',
            signType: 'RSA2',
            privateKey: fs.readFileSync(
              path.resolve(__dirname, '../pay/pem/private_key.pem'),
              'utf-8',
            ),
            alipayRootCertPath: path.resolve(
              __dirname,
              '../pay/crt/alipayRootCert.crt',
            ),
            appCertPath: path.resolve(
              __dirname,
              '../pay/crt/appCertPublicKey.crt',
            ),
            alipayPublicCertPath: path.resolve(
              __dirname,
              '../pay/crt/alipayCertPublicKey_RSA2.crt',
            ),
            gateway: 'https://openapi.alipaydev.com/gateway.do',
          })
          const formData = new AliPayForm.default()
          /** 调用 setMethod 并传入 get，会返回可以跳转到支付页面的 url **/
          formData.setMethod('get')
          formData.addField('bizContent', {
            //Body: '订单描述',
            totalAmount: parseFloat(plan.currentPrice).toFixed(2).toString(),
            subject: '啊',
            //ProductCode: 'QUICK_MSECURITY_PAY',
            outTradeNo: '120000052',
            //extendParams: { HbFqNum: '3', HbFqSellerPercent: '100' },
          })
          /** 异步通知地址，商户外网可以post访问的异步地址，用于接收支付宝返回的支付结果，如果未收到该通知可参考该文档进行确认：https://opensupport.alipay.com/support/helpcenter/193/201602475759 **/
          //formData.addField('notifyUrl', 'https://www.baidu.com')
          const result = await alipaySdk.exec(
            'alipay.trade.app.pay',
            {},
            { formData: formData },
          )
          ctx.body = {
            code: '1000',
            message: '请求成功',
            data: result,
          }
        }
      } else {
        ctx.body = {
          code: '3008',
          message: '无此用户信息，请重新登录',
        }
      }
    } else {
      ctx.body = {
        code: '3007',
        message: '登录状态失效，请重新登录',
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

// router.post('/createOrder', verifyAppBaseInfo, verifyUserLogin, async ctx => {
//   const clientIp = ctx.req.connection.remoteAddress
//   const writerStream = fs.createWriteStream(
//       process.cwd() + '/logs/order.log',
//       {
//         flags: 'a',
//       },
//     )
//   let plan
//   user.vip = true
//   user.vipStartTime = Date.now()
//   const vipEndTime = user.vipEndTime ? user.vipEndTime : Date.now()
//   writerStream.write(
//     `用户：${tel} IP：${clientIp} 在${moment().format(
//       'YYYY-MM-DD HH:mm:ss',
//     )} 购买${plan}会员\n`,
//     'UTF8',
//   )
//   writerStream.end()
// })

module.exports = router
