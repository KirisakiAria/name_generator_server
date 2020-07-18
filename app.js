const path = require('path')
const Koa = require('koa')
const mongoose = require('mongoose')
const static = require('koa-static')
const bodyParser = require('koa-bodyparser')
const api = require('./api')

mongoose.connect(
  'mongodb://kirisakiaria:ihSvydZrQQW9RSud@localhost:27017/name_generator',
  {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  },
)

const app = new Koa()
app.use(static(path.join(__dirname) + '/public/'))
app.use(bodyParser())
app.use(api.routes())

module.exports = app
