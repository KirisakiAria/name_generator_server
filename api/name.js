const Router = require('@koa/router')
const router = new Router({ prefix: '/name' })

router.get('/', async ctx => {
  const { type, number } = ctx.query
  console.log(type, number)
  const nameList = ['深淵道化', '失踪領域', '氷雪戦機']
  const randomIndex = Math.round(Math.random() * 2)
  ctx.body = {
    code: '1000',
    data: { name: nameList[randomIndex] },
  }
})

module.exports = router
