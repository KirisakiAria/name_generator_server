const path = require('path')
const Koa = require('koa')

const koaBody = require('koa-body')
const static = require('koa-static')
const bodyParser = require('koa-bodyparser')
const cors = require('koa2-cors')
const api = require('./api')
const views = require('koa-views')

const app = new Koa()
app.use(
  views(path.join(__dirname, './static'), {
    extension: 'ejs',
  }),
)
app.use(cors())
app.use(koaBody())
app.use(static(path.join(__dirname) + '/public/'))
app.use(bodyParser())
app.use(api.apiRouter.routes())
app.use(api.webRouter.routes())

module.exports = app
