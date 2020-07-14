const Router = require('@koa/router')
const config = require('../config/config')
const { verifyAppBaseInfo, verifyLogin } = require('../utils/verify')
const name = require('./name')
const login = require('./login')
const register = require('./register')
const sendcode = require('./sendcode')

const router = new Router({ prefix: `/api/${config.apiVersion}` })

//验证
//router.use(verifyAppBaseInfo, verifyLogin)
router.use(name.routes())
router.use(login.routes())
router.use(register.routes())
router.use(sendcode.routes())

module.exports = router
