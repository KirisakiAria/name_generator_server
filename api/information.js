const Router = require('@koa/router')
const ErrorModel = require('../model/Error')
const { verifyAppBaseInfo, verifyAdminLogin } = require('../utils/verify')

const router = new Router({ prefix: '/information' })

router.get('/error', verifyAdminLogin, async ctx => {
  try {
    const { system, searchContent, pageSize, currentPage } = ctx.request.query
    const pattern = new RegExp(searchContent, 'i')
    let condition
    if (system == 'all') {
      condition = { brand: pattern }
    } else {
      condition = { brand: pattern, system }
    }
    condition
    const list = await ErrorModel.find(condition)
      .sort({ _id: -1 })
      .skip(parseInt(pageSize) * parseInt(currentPage))
      .limit(parseInt(pageSize))
    const total = await ErrorModel.find(condition).countDocuments()
    ctx.body = {
      code: '1000',
      message: '请求成功',
      data: {
        list,
        total,
      },
    }
  } catch (err) {
    console.log(err)
    ctx.body = {
      code: '9000',
      message: '请求错误',
    }
  }
})

router.post('/error', verifyAppBaseInfo, async ctx => {
  try {
    const body = ctx.request.body
    const data = new ErrorModel(body)
    await data.save()
    ctx.body = {
      code: '1000',
      message: '请求成功',
    }
  } catch (err) {
    console.log(err)
    ctx.body = {
      code: '9000',
      message: '请求错误',
    }
  }
})

router.post('/error/delete', verifyAdminLogin, async ctx => {
  try {
    const { items } = ctx.request.body
    const result = await ErrorModel.deleteMany({ _id: { $in: items } })
    if (result.ok == 1 && result.deletedCount >= 1) {
      ctx.body = {
        code: '1000',
        message: '删除成功',
      }
    } else {
      ctx.body = {
        code: '2000',
        message: '删除失败',
      }
    }
  } catch (err) {
    console.log(err)
    ctx.body = {
      code: '9000',
      message: '请求错误',
    }
  }
})

module.exports = router
