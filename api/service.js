const Router = require('@koa/router')
const ServiceModel = require('../model/Service')
const { verifyAdminLogin } = require('../utils/verify')

const router = new Router({ prefix: '/service' })

router.get('/', verifyAdminLogin, async ctx => {
  try {
    const data = await ServiceModel.find()
    ctx.body = {
      code: '1000',
      message: '请求成功',
      data: data[0],
    }
  } catch (e) {
    console.log(e)
    ctx.body = {
      code: '9000',
      message: '请求错误',
    }
  }
})

router.get('/privacypolicy', async ctx => {
  try {
    const data = await ServiceModel.find()
    ctx.body = {
      code: '1000',
      message: '请求成功',
      data: data[0].privacyPolicy,
    }
  } catch (e) {
    console.log(e)
    ctx.body = {
      code: '9000',
      message: '请求错误',
    }
  }
})

router.get('/terms', async ctx => {
  try {
    const data = await ServiceModel.find()
    ctx.body = {
      code: '1000',
      message: '请求成功',
      data: data[0].terms,
    }
  } catch (e) {
    console.log(e)
    ctx.body = {
      code: '9000',
      message: '请求错误',
    }
  }
})

router.get('/usage', async ctx => {
  try {
    const data = await ServiceModel.find()
    ctx.body = {
      code: '1000',
      message: '请求成功',
      data: data[0].usage,
    }
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
    const { privacyPolicy, terms, usage } = ctx.request.body
    const result = await ServiceModel.updateOne(
      { _id: ctx.params.id },
      { $set: { privacyPolicy, terms, usage } },
    )
    if (result.ok == 1 && result.nModified == 1) {
      ctx.body = {
        code: '1000',
        message: '保存成功',
      }
    } else {
      ctx.body = {
        code: '2000',
        message: '保存失败',
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
