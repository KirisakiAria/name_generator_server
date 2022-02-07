const fs = require('fs')
const path = require('path')
const moment = require('moment')
const Router = require('@koa/router')
const AlipaySdk = require('alipay-sdk')
const AliPayForm = require('alipay-sdk/lib/form')
const UserModel = require('../model/User')
const PlanModel = require('../model/Plan')
const OrderModel = require('../model/Order')
const SMSModel = require('../model/SMS')
const JWT = require('../utils/jwt')
const config = require('../config/config')
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
    return moment(value).format('YYYY-MM-DD HH:mm:ss')
  }
}

const filterEndTime = value => {
  if (!value) {
    return '无'
  } else if (value > 0) {
    return moment(value).format('YYYY-MM-DD HH:mm:ss')
  } else {
    return '永久'
  }
}

router.post('/login', verifyAppBaseInfo, async ctx => {
  try {
    const { tel, password } = ctx.request.body
    const user = await UserModel.findOne({ tel })
    if (user && user.password === encrypt(password)) {
      const jwt = new JWT({
        user: tel,
        role: 2,
      })
      const token = jwt.generateToken()
      user.lastLoginTime = moment().format('YYYY-MM-DD HH:mm:ss')
      await user.save()
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
          favourites: [],
          favouritesCouples: [],
          history: [],
          historyCouples: [],
        })
        await newUser.save()
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
        user.lastLoginTime = moment().format('YYYY-MM-DD HH:mm:ss')
        await user.save()
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
      const { page, type } = ctx.request.query
      const user = await UserModel.findOne({ tel: res.user })
      if (user) {
        let list
        if (type == 'couples') {
          list = user.historyCouples
        } else {
          list = user.history
        }
        if (!user.vip) {
          list = list.slice(0, 30)
        }
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
      const { page, type } = ctx.request.query
      const user = await UserModel.findOne({ tel: res.user })
      if (user) {
        let list
        if (type == 'couples') {
          list = user.favouritesCouples
        } else {
          list = user.favourites
        }
        if (!user.vip) {
          list = list.slice(0, 30)
        }
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
    const { type, length, word, word2 } = ctx.request.body
    const jwt = new JWT(ctx.request.header.authorization)
    const res = jwt.verifyToken()
    if (res.user) {
      const user = await UserModel.findOne({ tel: res.user })
      //有第二个词语传入说明是情侣词语
      if (word2) {
        if (user.favouritesCouples.length >= 500) {
          ctx.body = {
            code: '2003',
            message: '收藏情侣网名数量已满',
          }
        } else {
          const index = user.favouritesCouples.findIndex(
            e => e.words[0] === word,
          )
          if (index == -1) {
            user.favouritesCouples.unshift({
              type: '中国风',
              length,
              words: [word, word2],
            })
          }
          user.save()
          ctx.body = {
            code: '1000',
            message: '请求成功',
          }
        }
      } else {
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
  '/history/:word',
  verifyAppBaseInfo,
  verifyUserLogin,
  async ctx => {
    try {
      const { word } = ctx.params
      const { couples } = ctx.query
      const jwt = new JWT(ctx.request.header.authorization)
      const res = jwt.verifyToken()
      if (res.user) {
        const user = await UserModel.findOne({ tel: res.user })
        if (couples) {
          const index = user.historyCouples.findIndex(e => e.words[0] === word)
          if (index != -1) {
            user.historyCouples.splice(index, 1)
          }
          user.save()
          ctx.body = {
            code: '1000',
            message: '请求成功',
          }
        } else {
          const index = user.history.findIndex(e => e.word === word)
          if (index != -1) {
            user.history.splice(index, 1)
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
  },
)

router.delete(
  '/favourite/:word',
  verifyAppBaseInfo,
  verifyUserLogin,
  async ctx => {
    try {
      const { word } = ctx.params
      const { couples } = ctx.query
      const jwt = new JWT(ctx.request.header.authorization)
      const res = jwt.verifyToken()
      if (res.user) {
        const user = await UserModel.findOne({ tel: res.user })
        if (couples) {
          const index = user.favouritesCouples.findIndex(
            e => e.words[0] === word,
          )
          if (index != -1) {
            user.favouritesCouples.splice(index, 1)
          }
          user.save()
          ctx.body = {
            code: '1000',
            message: '请求成功',
          }
        } else {
          const index = user.favourites.findIndex(e => e.word === word)
          if (index != -1) {
            user.favourites.splice(index, 1)
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
    const { searchContent, pageSize, currentPage, sort } = ctx.request.query
    const pattern = new RegExp(searchContent, 'i')
    let sortCondition = { _id: -1 }
    const condition = {
      $or: [{ tel: pattern }, { username: pattern }],
    }
    const sortData = JSON.parse(sort)
    if (sortData.prop) {
      sortCondition = {
        [sortData.prop]: sortData.order == 'descending' ? -1 : 1,
      }
    }
    const list = await UserModel.find(condition)
      .sort(sortCondition)
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
        avatar: avatar ? avatar : '/avatar/avatar.png',
        tel,
        username,
        password: encrypt(password),
        vip,
        vipStartTime,
        vipEndTime,
        date: moment().format('YYYY-MM-DD'),
        favourites: [],
        favouritesCouples: [],
        history: [],
        historyCouples: [],
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

router.post('/pay', verifyAppBaseInfo, verifyUserLogin, async ctx => {
  try {
    const { tel, planId, paymentMethod } = ctx.request.body
    const jwt = new JWT(ctx.request.header.authorization)
    const res = jwt.verifyToken()
    if (res.user === tel) {
      const user = await UserModel.findOne({ tel })
      if (user) {
        const plan = await PlanModel.findOne({ planId })
        const outTradeNo = Date.now() + tel + Math.round(Math.random() * 10000)
        const body = `「彼岸自在」VIP会员 期限：${plan.title}`
        const totalAmount = parseFloat(plan.currentPrice).toFixed(2).toString()
        if (paymentMethod == '1') {
          const alipaySdk = new AlipaySdk.default({
            appId: config.alipayAppId,
            privateKey: fs.readFileSync(
              path.resolve(__dirname, '../pay/pem/private_key.pem'),
              'utf-8',
            ),
            alipayPublicKey:
              'MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAwwg4dLRqOqiTVs/IjUZUqggMRK6vdkPKQxTZVeklFhDwufY8ut4W2SQBnJyi7+A3HKAI7PxZfB7qFam4OkyVVjog2KWYVM6Gyuz8l5Uzn+SPL/jCl6N+zpka199WCA/wm4sCtjQte4vShrLJoyOwXOC08h4uuzXx/7sjHRZSk1XCHznIKa+ZnZmYx1tpx+FFfLvBHHErvNcJ3qS+46H4hOrfhFMPqvfWTc0YBEj2//IzsafP3x8o10q++3A/BhU4WBps3R6xOkuIr6chhYC3XS0VpO6+hzajdkxS1F+zjnFbInpECMhOxClIJ6QEKh5swFDElz+2EoCZ5kKNvvKOsQIDAQAB',
            alipayRootCertPath: path.resolve(
              __dirname,
              '../pay/crt/alipayRootCert.crt',
            ),
            appCertPath: path.resolve(
              __dirname,
              '../pay/crt/appCertPublicKey_2021002115614424.crt',
            ),
            alipayPublicCertPath: path.resolve(
              __dirname,
              '../pay/crt/alipayCertPublicKey_RSA2.crt',
            ),
          })
          const formData = new AliPayForm.default()
          /** 调用 setMethod 并传入 get，会返回可以跳转到支付页面的 url **/
          formData.setMethod('get')
          formData.addField('bizContent', {
            outTradeNo,
            body,
            totalAmount,
            subject: body,
            productCode: 'QUICK_MSECURITY_PAY',
            // enablePayChannels:
            //   'balance,moneyFund,bankPay,debitCardExpress,creditCard,credit_group,coupon',
            // extendParams: {
            //   hbFqNum: '3',
            //   hbFqSellerPercent: '0',
            // },
          })
          /** 异步通知地址，商户外网可以post访问的异步地址，用于接收支付宝返回的支付结果，如果未收到该通知可参考该文档进行确认：https://opensupport.alipay.com/support/helpcenter/193/201602475759 **/
          //formData.addField('notifyUrl', 'https://www.baidu.com')
          const result = await alipaySdk.exec(
            'alipay.trade.app.pay',
            {},
            { formData: formData },
          )
          const order = new OrderModel({
            orderNo: outTradeNo,
            body,
            tel,
            price: totalAmount,
            time: Date.now(),
            paymentMethod,
            status: false,
          })
          await order.save()
          ctx.body = {
            code: '1000',
            message: '请求成功',
            data: result.replace('https://openapi.alipay.com/gateway.do?', ''),
          }
        } else if (paymentMethod == '3') {
          const order = new OrderModel({
            orderNo: outTradeNo,
            body,
            tel,
            price: totalAmount,
            time: Date.now(),
            paymentMethod,
            status: false,
          })
          await order.save()
          ctx.body = {
            code: '1000',
            message: '请求成功',
            orderNo: outTradeNo,
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

router.post('/pay/success', verifyAppBaseInfo, verifyUserLogin, async ctx => {
  try {
    const { tel, orderNo, planId } = ctx.request.body
    const jwt = new JWT(ctx.request.header.authorization)
    const res = jwt.verifyToken()
    if (res.user === tel) {
      const user = await UserModel.findOne({ tel })
      if (user) {
        user.vip = true
        user.vipStartTime = Date.now()
        const vipStartTime = user.vipEndTime
          ? user.vipEndTime
          : user.vipStartTime
        switch (planId) {
          case '1':
            user.vipEndTime = vipStartTime + 2678400000
            break
          case '2':
            user.vipEndTime = vipStartTime + 8035200000
            break
          case '3':
            user.vipEndTime = vipStartTime + 16070400000
            break
          case '4':
            user.vipEndTime = vipStartTime + 31536000000
            break
          case '5':
            user.vipEndTime = -1
            break
        }
        await user.save()
        const order = await OrderModel.findOne({ orderNo })
        order.status = true
        await order.save()
        ctx.body = {
          code: '1000',
          message: '支付成功',
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

router.post(
  '/pay/success/huawei',
  verifyAppBaseInfo,
  verifyUserLogin,
  async ctx => {
    try {
      const { tel, orderNo, token, expirationDate } = ctx.request.body
      const jwt = new JWT(ctx.request.header.authorization)
      const res = jwt.verifyToken()
      if (res.user === tel) {
        const user = await UserModel.findOne({ tel })
        if (user) {
          user.vip = true
          user.huaweiPayToken = token
          user.vipStartTime = Date.now()
          user.vipEndTime = expirationDate
          await user.save()
          const order = await OrderModel.findOne({ orderNo })
          order.status = true
          order.huaweiPayToken = token
          await order.save()
          ctx.body = {
            code: '1000',
            message: '支付成功',
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
  },
)

router.post('/verifyvip', verifyAppBaseInfo, verifyUserLogin, async ctx => {
  try {
    const { tel, expirationDate, token } = ctx.request.body
    const jwt = new JWT(ctx.request.header.authorization)
    const res = jwt.verifyToken()
    if (res.user === tel) {
      const user = await UserModel.findOne({ tel })
      if (user) {
        const order = await OrderModel.find({ tel }).sort({ _id: -1 }).limit(1)
        if (token) {
          user.huaweiPayToken = token
          if (order.length) {
            order[0].huaweiPayToken = token
          }
        }
        if (order.length) {
          order[0].status = true
          await order[0].save()
        }
        user.vipEndTime = expirationDate
        const date = Date.now()
        if (user.vipEndTime == -1) {
          user.vip = true
        } else if (date < expirationDate) {
          user.vip = true
        } else {
          user.vip = false
        }
        await user.save()
        ctx.body = {
          code: '1000',
          message: '验证成功',
          data: {
            vip: user.vip,
            vipEndTime: filterEndTime(user.vipEndTime),
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

router.post('/refund', verifyAdminLogin, async ctx => {
  try {
    const { tel } = ctx.request.body
    const user = await UserModel.findOne({ tel })
    if (user) {
      ctx.body = {
        code: '1000',
        message: '发起退款成功',
      }
    } else {
      ctx.body = {
        code: '3008',
        message: '暂无此用户信息',
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
