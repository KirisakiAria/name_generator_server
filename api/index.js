const Router = require('@koa/router')
const config = require('../config/config')
const name = require('./name')
const user = require('./user')

const router = new Router({ prefix: `/api/${config.apiVersion}` })

router.use(name.routes())
router.use(user.routes())

module.exports = router
