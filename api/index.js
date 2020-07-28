const Router = require('@koa/router')
const config = require('../config/config')
const user = require('./user')
const admin = require('./admin')
const sendcode = require('./sendcode')
const upload = require('./upload')
const word = require('./word')
const { verifyAppBaseInfo, verifyLogin } = require('../utils/verify')

const router = new Router({ prefix: `/api/${config.apiVersion}` })

//验证

router.use(verifyAppBaseInfo)
router.use(admin.routes()).use(user.allowedMethods())
router.use(user.routes()).use(user.allowedMethods())
router.use(sendcode.routes()).use(router.allowedMethods())
router.use(upload.routes()).use(router.allowedMethods())
router.use(word.routes()).use(router.allowedMethods())

module.exports = router
