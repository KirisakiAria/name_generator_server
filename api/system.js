const os = require('os')
const Router = require('@koa/router')
const { verifyAdminLogin } = require('../utils/verify')

const router = new Router({ prefix: '/system' })

router.get('/', verifyAdminLogin, async ctx => {
  const systemData = {
    endianness: os.endianness(), //CPU的字节序
    type: os.type(), //操作系统类型
    platform: os.platform(), //操作系统名
    arch: os.arch(), //系统 CPU 架构
    release: os.release(), //操作系统的发行版本
    uptime: os.uptime(), //操作系统运行的时间，以秒为单位
    totalmem: os.totalmem(), //内存总量
    freemem: os.freemem(), //空闲内存总量
    cpus: os.cpus(), //cpu内核信息
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
