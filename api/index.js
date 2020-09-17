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
const dictionary = require('./dictionary')
const system = require('./system')

const api = new Router({ prefix: `/api/${config.apiVersion}` })

//验证
api.use(admin.routes()).use(admin.allowedMethods())
api.use(user.routes()).use(user.allowedMethods())
api.use(sendcode.routes()).use(sendcode.allowedMethods())
api.use(upload.routes()).use(upload.allowedMethods())
api.use(word.routes()).use(word.allowedMethods())
api.use(application.routes()).use(application.allowedMethods())
api.use(service.routes()).use(service.allowedMethods())
api.use(information.routes()).use(information.allowedMethods())
api.use(dictionary.routes()).use(dictionary.allowedMethods())
api.use(system.routes()).use(system.allowedMethods())

module.exports = api
