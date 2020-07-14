const JWT = require('../utils/jwt')
const config = require('../config/config')

const verifyAppBaseInfo = async (ctx, next) => {
  if (
    ctx.request.header.appname === config.appName &&
    ctx.request.header.packagename === config.packageName
  ) {
    next()
  } else {
    ctx.body = {
      code: '9001',
      message: '信息不匹配',
    }
  }
}

//登陆状态判断
const verifyLogin = async (ctx, next) => {
  const url = ctx.request.originalUrl
  if (!url.includes('login')) {
    const jwt = new JWT(ctx.request.header.authorization)
    const res = jwt.verifyToken()
    if (res.code == '1000') {
      ctx.tel = res.tel
      await next()
    } else {
      ctx.body = {
        code: res.code,
        message: res.message,
      }
    }
  } else {
    await next()
  }
}

module.exports = { verifyAppBaseInfo, verifyLogin }
