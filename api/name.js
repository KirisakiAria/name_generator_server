const Router = require('@koa/router')
const userModel = require('../model/User')
const router = new Router({ prefix: '/name' })

router.get('/', async ctx => {
  try {
    console.log(await userModel.find({ username: '空洞共鳴' }))
  } catch (e) {
    console.log(e)
  }
  const { type, number } = ctx.query
  const nameList = ['深淵道化', '失踪領域', '氷雪戦機']
  const randomIndex = Math.round(Math.random() * 2)
  ctx.body = {
    code: 1000,
    data: { name: nameList[randomIndex] },
  }
})

module.exports = router
