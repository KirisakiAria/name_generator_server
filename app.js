const path = require('path')
const Koa = require('koa')
const config = require('./config/config')
const static = require('koa-static')
const api = require('./api')
const app = new Koa()

app.use(static(path.join(__dirname) + '/public/'))

app.use(api.routes())

module.exports = app
