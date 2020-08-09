const Router = require('@koa/router')
const config = require('../config/config')
const user = require('./user')
const admin = require('./admin')
const sendcode = require('./sendcode')
const upload = require('./upload')
const word = require('./word')
const application = require('./application')
const service = require('./service')

const router = new Router({ prefix: `/api/${config.apiVersion}` })

//验证
router.use(admin.routes()).use(user.allowedMethods())
router.use(user.routes()).use(user.allowedMethods())
router.use(sendcode.routes()).use(router.allowedMethods())
router.use(upload.routes()).use(router.allowedMethods())
router.use(word.routes()).use(router.allowedMethods())
router.use(application.routes()).use(router.allowedMethods())
router.use(service.routes()).use(router.allowedMethods())

module.exports = router
