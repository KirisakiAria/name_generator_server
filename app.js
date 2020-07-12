const path = require('path')
const Koa = require('koa')
const bodyParser = require('koa-bodyparser')
const config = require('./config/config')
const static = require('koa-static')
const api = require('./api')
const mongoose = require('mongoose')
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
