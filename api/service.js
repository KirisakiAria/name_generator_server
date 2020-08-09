const Router = require('@koa/router')
const ServiceModel = require('../model/Service')
const { verifyAdminLogin } = require('../utils/verify')

const router = new Router({ prefix: '/service' })

router.get('/', async ctx => {
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

router.post('/privacypolicy', verifyAdminLogin, async ctx => {
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

module.exports = router
