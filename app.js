const path = require('path')
const Koa = require('koa')
const config = require('./config/config')
const static = require('koa-static')
const api = require('./api')
const JWT = require('./utils/jwt')

const app = new Koa()

// const jwt = new JWT(ctx.request.header.authorization)
// const res = jwt.verifyToken()

app.use(static(path.join(__dirname) + '/public/'))

app.use(api.routes())

module.exports = app
