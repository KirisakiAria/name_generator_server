const Router = require('@koa/router')
const config = require('../config/config')
const word = require('./word')
const login = require('./login')
const register = require('./register')
const changePassword = require('./change_password')
const sendcode = require('./sendcode')
const upload = require('./upload')
const user = require('./user')
const { verifyAppBaseInfo, verifyLogin } = require('../utils/verify')

const router = new Router({ prefix: `/api/${config.apiVersion}` })

//验证
//router.use(verifyAppBaseInfo)
router.use(word.routes()).use(router.allowedMethods())
router.use(login.routes()).use(router.allowedMethods())
router.use(register.routes()).use(router.allowedMethods())
router.use(changePassword.routes()).use(router.allowedMethods())
router.use(sendcode.routes()).use(router.allowedMethods())
router.use(upload.routes()).use(router.allowedMethods())
router.use(user.routes()).use(user.allowedMethods())

module.exports = router
