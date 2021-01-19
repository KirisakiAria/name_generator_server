const Router = require('@koa/router')
const moment = require('moment')
const KeyModel = require('../model/Key')
const UserModel = require('../model/User')
const JWT = require('../utils/jwt')
const {
  verifyAppBaseInfo,
  verifyUserLogin,
  verifyAdminLogin,
} = require('../utils/verify')

const router = new Router({ prefix: '/key' })

router.post('/activate', verifyAppBaseInfo, verifyUserLogin, async ctx => {
  try {
    const { code, tel } = ctx.request.query
    const jwt = new JWT(ctx.request.header.authorization)
    const res = jwt.verifyToken()
    if (res.user === tel) {
      const user = await UserModel.findOne({ tel })
      if (user) {
        const key = await UserModel.findOne({ code })
        if (key && !key.activated) {
          key.userTel = tel
          key.activated = true
          key.activationTime = moment().format('YYYY-MM-DD HH:mm:ss')
          await key.save()
          user.vip = true
          user.vipStartTime = Date.now()
          const vipStartTime = user.vipEndTime
            ? user.vipEndTime
            : user.vipStartTime
          switch (key.planId) {
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
          ctx.body = {
            code: '1000',
            message: '激活成功',
          }
        } else {
          ctx.body = {
            code: '1000',
            message: '激活码无效或已使用',
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

router.get('/', verifyAdminLogin, async ctx => {
  try {
    const {
      searchContent,
      startTime,
      endTime,
      pageSize,
      currentPage,
    } = ctx.request.query
    const pattern = new RegExp(searchContent, 'i')
    let condition
    if (startTime && endTime) {
      condition = {
        $or: [{ code: pattern }, { userTel: pattern }],
        time: { $gte: startTime, $lte: endTime },
      }
    } else {
      condition = {
        $or: [{ code: pattern }, { userTel: pattern }],
      }
    }
    const list = await KeyModel.find(condition)
      .sort({ _id: -1 })
      .skip(parseInt(pageSize) * parseInt(currentPage))
      .limit(parseInt(pageSize))
    const total = await KeyModel.find(condition).countDocuments()
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
    const body = ctx.request.body
    const data = new KeyModel({
      ...body,
      createTime: moment().format('YYYY-MM-DD HH:mm:ss'),
      activatedTime: '',
    })
    await data.save()
    ctx.body = {
      code: '1000',
      message: '添加成功',
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
    const result = await KeyModel.updateOne({ _id: ctx.params.id }, body)
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
  } catch (err) {
    console.log(err)
    ctx.body = {
      code: '9000',
      message: '请求错误',
    }
  }
})

router.post('/delete', verifyAdminLogin, async ctx => {
  try {
    const { items } = ctx.request.body
    const result = await KeyModel.deleteMany({ _id: { $in: items } })
    if (result.ok == 1 && result.deletedCount == items.length) {
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

module.exports = router
