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
  } catch (err) {
    console.log(err)
    ctx.body = {
      code: '9000',
      message: '请求错误',
    }
  }
})

router.get('/update', verifyAppBaseInfo, async ctx => {
  try {
    const { version } = ctx.request.query
    const app = await ApplicationModel.find()
    const currentVersion = app[0].version
    if (version !== currentVersion) {
      ctx.body = {
        code: '1000',
        message: '发现新版本，请到APP市场或官网下载更新',
      }
    } else {
      ctx.body = {
        code: '1000',
        message: '您的版本已经是最新',
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
    const { id } = ctx.params
    const {
      secret,
      appName,
      packageName,
      buildNumber,
      version,
    } = ctx.request.body
    const result = await ApplicationModel.updateOne(
      { _id: id },
      { $set: { secret, appName, packageName, buildNumber, version } },
    )
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

module.exports = router
