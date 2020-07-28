const path = require('path')
const Koa = require('koa')
const mongoose = require('mongoose')
const koaBody = require('koa-body')
const static = require('koa-static')
const bodyParser = require('koa-bodyparser')
const cors = require('koa2-cors')
const api = require('./api')
const config = require('./config/config')

mongoose
  .connect(config.db, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(
    () => {
      console.log('数据库连接成功，端口为27017')
    },
    err => {
      console.log(`数据库连接失败！错误：${err}`.red)
    },
  )

const app = new Koa()
app.use(cors())
app.use(koaBody())
app.use(static(path.join(__dirname) + '/public/'))
app.use(bodyParser())
app.use(api.routes())

module.exports = app
