const Router = require('@koa/router')
const router = new Router({ prefix: '/name' })

const delay = async time => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      console.log('延迟执行')
      resolve()
    }, time)
  })
}

router.get('/', async ctx => {
  const { type, number } = ctx.query
  const nameList = ['深淵道化', '失踪領域', '氷雪戦機']
  const randomIndex = Math.round(Math.random() * 2)
  //await delay(5000)
  ctx.body = {
    code: 1000,
    data: { name: nameList[randomIndex] },
  }
})

module.exports = router
