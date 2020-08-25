const Router = require('@koa/router')
const config = require('../config/config')
const user = require('./user')
const admin = require('./admin')
const sendcode = require('./sendcode')
const upload = require('./upload')
const word = require('./word')
const application = require('./application')
const service = require('./service')
const information = require('./information')
const web = require('./web')
const dictionary = require('./dictionary')
const system = require('./system')

const apiRouter = new Router({ prefix: `/api/${config.apiVersion}` })

//验证
apiRouter.use(admin.routes()).use(admin.allowedMethods())
apiRouter.use(user.routes()).use(user.allowedMethods())
apiRouter.use(sendcode.routes()).use(sendcode.allowedMethods())
apiRouter.use(upload.routes()).use(upload.allowedMethods())
apiRouter.use(word.routes()).use(word.allowedMethods())
apiRouter.use(application.routes()).use(application.allowedMethods())
apiRouter.use(service.routes()).use(service.allowedMethods())
apiRouter.use(information.routes()).use(information.allowedMethods())
apiRouter.use(dictionary.routes()).use(dictionary.allowedMethods())
apiRouter.use(system.routes()).use(system.allowedMethods())

const webRouter = new Router()
webRouter.use(web.routes()).use(web.allowedMethods())

module.exports = { apiRouter, webRouter }
