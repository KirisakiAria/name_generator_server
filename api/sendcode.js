const fs = require('fs')
const moment = require('moment')
const QcloudSms = require('qcloudsms_js')
const Router = require('@koa/router')
const UserModel = require('../model/User')
const SMSModel = require('../model/SMS')
const router = new Router({ prefix: '/sendcode' })
const { verifyAppBaseInfo } = require('../utils/verify')

const sendCode = (templateId, tel, ctx) => {
  return new Promise((resolve, reject) => {
    const writerStream = fs.createWriteStream(process.cwd() + '/logs/sms.log', {
      flags: 'a',
    })
    writerStream.on('error', err => {
      console.log(err.stack)
    })
    const clientIp = ctx.req.connection.remoteAddress

    const appid = 1400425828 // SDK AppID 以1400开头
    const appkey = 'aab3680f5e430c6ebfbab11460ced5ad' // 短信应用 SDK AppKey
    // 签名
    const smsSign = '大老师软件开发中心' // NOTE: 签名参数使用的是`签名内容`，而不是`签名ID`。这里的签名"腾讯云"只是示例，真实的签名需要在短信控制台申请

    const qcloudsms = QcloudSms(appid, appkey)
    const ssender = qcloudsms.SmsSingleSender()
    const code = generateCode()
    ssender.sendWithParam(
      '86',
      tel,
      templateId,
      [code],
      smsSign,
      '',
      '',
      async err => {
        if (err) {
          reject(err)
        } else {
          writerStream.write(
            `手机号：${tel} IP：${clientIp} 请求了验证码，验证码为：${code}\n`,
            'UTF8',
          )
          const smsDoc = await SMSModel.findOne({ tel })
          if (smsDoc) {
            const result = await SMSModel.updateOne(
              { tel },
              {
                $set: {
                  authCode: code,
                  lastTime: moment().add(8, 'h').format(),
                },
              },
            )
            if (result.ok != 1 || result.nModified != 1) {
              console.log(`手机号：${tel} IP：${clientIp} 验证码数据更新失败`)
            }
          } else {
            const sms = new SMSModel({
              tel, // 手机号
              authCode: code, //验证码
              clientIp, // 客户端 ip
              sendCount: 1, // 发送次数
              lastTime: moment().add(8, 'h').format(), // 当前日期
            })
            await sms.save()
          }
          resolve()
        }
      },
    )
  })
}

const generateCode = () => {
  let code = Math.floor(Math.random() * 999999).toString()
  if (code.length < 6) {
    code = '0'.repeat(6 - code.length) + code
  }
  return code
}

router.post('/', verifyAppBaseInfo, async ctx => {
  try {
    const { tel, change } = ctx.request.body
    //有change参数代表修改密码
    if (change) {
      const user = await UserModel.findOne({ tel })
      if (!user) {
        ctx.body = {
          code: '3000',
          message: '用户不存在',
        }
      } else {
        //重置密码模板id 721916
        try {
          await sendCode(721916, tel, ctx)
          ctx.body = {
            code: '1000',
            message: '验证码发送成功',
          }
        } catch {
          ctx.body = {
            code: '3003',
            message: '验证码发送失败',
          }
        }
      }
    } else {
      const user = await UserModel.findOne({ tel })
      if (user) {
        ctx.body = {
          code: '3000',
          message: '用户已存在',
        }
      } else {
        //注册模板id 722528
        try {
          await sendCode(722528, tel, ctx)
          ctx.body = {
            code: '1000',
            message: '验证码发送成功',
          }
        } catch {
          ctx.body = {
            code: '3003',
            message: '验证码发送失败',
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

module.exports = router
