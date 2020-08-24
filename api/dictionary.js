const Router = require('@koa/router')
const ClassifyModel = require('../model/Classify')
const { verifyAdminLogin } = require('../utils/verify')

const router = new Router({ prefix: '/dictionary' })

module.exports = router
