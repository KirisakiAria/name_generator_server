const Router = require('@koa/router')
const config = require('../config/config')
const { verifyAppBaseInfo, verifyLogin } = require('../utils/verify')
const name = require('./name')
const login = require('./login')
const register = require('./register')
const changePassword = require('./change_password')
const sendcode = require('./sendcode')

const router = new Router({ prefix: `/api/${config.apiVersion}` })

//验证
//router.use(verifyAppBaseInfo)
router.use(name.routes()).use(router.allowedMethods())
router.use(login.routes()).use(router.allowedMethods())
router.use(register.routes()).use(router.allowedMethods())
router.use(changePassword.routes()).use(router.allowedMethods())
router.use(sendcode.routes()).use(router.allowedMethods())

module.exports = router
