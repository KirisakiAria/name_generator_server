const Router = require('@koa/router')
const config = require('../config/config')
const name = require('./name')

const router = new Router({ prefix: `/api/${config.apiVersion}` })

router.use(name.routes())

module.exports = router
