const path = require('path')
const Koa = require('koa')
const koaBody = require('koa-body')
const static = require('koa-static')
const bodyParser = require('koa-bodyparser')
const cors = require('koa2-cors')
const api = require('./api')

const app = new Koa()
app.use(cors())
app.use(koaBody())
app.use(static(path.join(__dirname) + '/public/'))
app.use(bodyParser())
app.use(api.routes())

module.exports = app
