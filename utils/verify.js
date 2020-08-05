const JWT = require('../utils/jwt')
const AdminModel = require('../model/Admin')
const UserModel = require('../model/User')
const ApplicationModel = require('../model/Application')

//验证app名、包名、密钥
const verifyAppBaseInfo = async (ctx, next) => {
  const app = await ApplicationModel.find()
  if (
    ctx.request.header.appname === app[0].appName &&
    ctx.request.header.packagename === app[0].packageName &&
    ctx.request.header.secret === app[0].secret
  ) {
    await next()
  } else {
    ctx.body = {
      code: '9001',
      message: '信息不匹配',
    }
  }
}

//验证管理员登录状态
const verifyAdminLogin = async (ctx, next) => {
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
      ctx.body = {
        code: '2001',
        message: '无此用户信息，请重新登录',
      }
    }
  } else {
    ctx.body = {
      code: res.code,
      message: res.message,
    }
  }
}

//验证普通用户登录状态
const verifyUserLogin = async (ctx, next) => {
  if (!ctx.request.header.authorization) {
    ctx.body = {
      code: '2000',
      message: '登陆状态失效，请重新登录',
    }
  }
  const jwt = new JWT(ctx.request.header.authorization)
  const res = jwt.verifyToken()
  if (res.code == '1000') {
    if (res.role == 2) {
      const user = await UserModel.findOne({ tel: res.user })
      if (user) {
        await next()
      } else {
        ctx.body = {
          code: '2001',
          message: '无此用户信息，请重新登录',
        }
      }
    } else {
      ctx.body = {
        code: '2001',
        message: '无此用户信息，请重新登录',
      }
    }
  } else {
    ctx.body = {
      code: res.code,
      message: res.message,
    }
  }
}

module.exports = { verifyAppBaseInfo, verifyUserLogin, verifyAdminLogin }
