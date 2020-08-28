const si = require('systeminformation')
const Router = require('@koa/router')
const { verifyAdminLogin } = require('../utils/verify')

const router = new Router({ prefix: '/system' })

router.get('/', verifyAdminLogin, async ctx => {
  const systemData = {
    os: await si.osInfo(),
    mem: await si.mem(),
    cpu: await si.cpu(),
    time: await si.time(),
    load: await si.currentLoad(),
    fsSize: await si.fsSize(),
  }
  try {
    ctx.body = {
      code: '1000',
      message: '请求成功',
      data: systemData,
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
