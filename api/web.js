const Router = require('@koa/router')

const router = new Router()

router.get('/', async ctx => {
  await ctx.render('web/index')
})

router.get('/admin', async ctx => {
  await ctx.render('admin/index')
})

module.exports = router
