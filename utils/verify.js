const JWT = require('../utils/jwt')
const AdminModel = require('../model/Admin')
const UserModel = require('../model/User')
const config = require('../config/config')

//验证app名、包名、密钥
const verifyAppBaseInfo = async (ctx, next) => {
  if (
    ctx.request.header.appname === config.appName &&
    ctx.request.header.packagename === config.packageName &&
    ctx.request.header.secret === config.secret
  ) {
    await next()
  } else {
    ctx.body = {
      code: '9001',
      message: '信息不匹配',
    }
  }
}

//验证登录状态
const verifyLogin = async (ctx, next) => {
  if (!ctx.request.header.authorization) {
    ctx.body = {
      code: '2000',
      message: '登陆状态失效，请重新登录',
    }
  }
  const jwt = new JWT(ctx.request.header.authorization)
  const res = jwt.verifyToken()
  if (res.code == '1000') {
    if (res.role == 1) {
      const user = await AdminModel.findOne({ username: res.user })
      if (user) {
        await next()
      } else {
        ctx.body = {
          code: '2001',
          message: '无此用户信息，请重新登录',
        }
      }
    } else {
      const user = await UserModel.findOne({ tel: res.user })
      if (user) {
        await next()
      } else {
        ctx.body = {
          code: '2001',
          message: '无此用户信息，请重新登录',
        }
      }
    }
  } else {
    ctx.body = {
      code: res.code,
      message: res.message,
    }
  }
}

module.exports = { verifyAppBaseInfo, verifyLogin }
