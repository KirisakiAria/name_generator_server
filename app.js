const path = require('path')
const Koa = require('koa')
const koaBody = require('koa-body')
const static = require('koa-static')
const bodyParser = require('koa-bodyparser')
const cors = require('koa2-cors')
const api = require('./api')
const session = require('koa-session')

const app = new Koa()

app.use(cors())
app.keys = ['S4BikZKaAh2Lcis3kcT5UQO4tmIY7R']
const sconfig = {
  key: 'koa.sess',
  maxAge: 86400000,
  overwrite: true,
  httpOnly: false,
  rolling: true,
  renew: true,
}
app.use(session(sconfig, app))
app.use(koaBody())
app.use(static(path.join(__dirname) + '/public/'))
app.use(bodyParser())
app.use(api.routes())

module.exports = app
