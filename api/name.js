const Router = require('@koa/router')
const router = new Router({ prefix: '/name' })

router.get('/', async ctx => {
  try {
    const { type, number } = ctx.query
    const nameList = ['深淵道化', '失踪領域', '氷雪戦機']
    const randomIndex = Math.round(Math.random() * 2)
    ctx.body = {
      code: '1000',
      message: '请求成功',
      data: { name: nameList[randomIndex] },
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
