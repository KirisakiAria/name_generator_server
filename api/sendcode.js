const fs = require('fs')
const Router = require('@koa/router')
const UserModel = require('../model/User')
const SMSModel = require('../model/SMS')
const router = new Router({ prefix: '/sendcode' })

const code = 666666

const sendCode = async (tel, ctx) => {
  try {
    const writerStream = fs.createWriteStream(process.cwd() + '/logs/sms.log', {
      flags: 'a',
    })
    writerStream.on('error', function (err) {
      console.log(err.stack)
    })

    const clientIp = ctx.req.connection.remoteAddress
    const smsDoc = await SMSModel.findOne({ tel })
    const smsDocs = await SMSModel.find({ clientIp })
    let sameIpSendCount = 0
    smsDocs.forEach(e => {
      sameIpSendCount += e.sendCount
    })
    if (sameIpSendCount > 15) {
      writerStream.write(`IP：${clientIp} 请求了15次验证码\n`, 'UTF8')
      writerStream.end()
      return {
        code: '3005',
        message: '同一IP一天最多请求15次验证码',
      }
    } else if (smsDoc) {
      if (smsDoc.sendCount >= 5) {
        writerStream.write(`手机号：${tel} 请求了5次验证码\n`, 'UTF8')
        writerStream.end()
        console.log('同一手机号一天最多接收五次验证码')
        return {
          code: '3003',
          message: '同一手机号一天最多接收五次验证码',
        }
      } else {
        const result = await SMSModel.updateOne(
          { tel },
          {
            $inc: { sendCount: 1 },
            $set: {
              lastTime: +new Date(),
            },
          },
        )
        if (result.ok == 1) {
          return {
            code: '1000',
            message: '发送成功',
          }
        } else {
          return {
            code: '9000',
            message: '请求错误',
          }
        }
      }
    } else {
      const sms = new SMSModel({
        tel, // 手机号
        authCode: code, //验证码
        clientIp, // 客户端 ip
        sendCount: 1, // 发送次数
        lastTime: +new Date(), // 当前日期
      })
      await sms.save()
      return {
        code: '1000',
        message: '发送成功',
      }
    }
  } catch (e) {
    console.log(e)
    return {
      code: '9000',
      message: '请求错误',
    }
  }
}

router.post('/', async ctx => {
  const { tel, change } = ctx.request.body
  try {
    //有change参数代表修改密码
    if (change) {
      const user = await UserModel.findOne({ tel })
      if (!user) {
        ctx.body = {
          code: '3000',
          message: '用户不存在',
        }
      } else {
        const res = await sendCode(tel, ctx)
        ctx.body = res
      }
    } else {
      const user = await UserModel.findOne({ tel })
      if (user) {
        ctx.body = {
          code: '3000',
          message: '用户已存在',
        }
      } else {
        const res = await sendCode(tel, ctx)
        ctx.body = res
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
