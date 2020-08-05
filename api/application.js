const Router = require('@koa/router')
const ApplicationModel = require('../model/Application')
const { verifyAppBaseInfo, verifyAdminLogin } = require('../utils/verify')

const router = new Router({ prefix: '/app' })

router.get('/', verifyAdminLogin, async ctx => {
  try {
    const app = await ApplicationModel.find()
    ctx.body = {
      code: '1000',
      message: '请求成功',
      data: {
        app: app[0],
      },
    }
  } catch (e) {
    console.log(e)
    ctx.body = {
      code: '9000',
      message: '请求错误',
    }
  }
})

router.get('/update', verifyAppBaseInfo, async ctx => {
  try {
    //有change参数代表修改密码
  } catch (e) {
    console.log(e)
    ctx.body = {
      code: '9000',
      message: '请求错误',
    }
  }
})

router.put('/:id', verifyAdminLogin, async ctx => {
  try {
    const { id } = ctx.params
    const { secret, appName, packageName, version } = ctx.request.body
    const result = await ApplicationModel.updateOne(
      { _id: id },
      { $set: { secret, appName, packageName, version } },
    )
    console.log(id, secret, appName, packageName, version)
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
  } catch (e) {
    console.log(e)
    ctx.body = {
      code: '9000',
      message: '请求错误',
    }
  }
})

module.exports = router
