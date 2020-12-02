const Router = require('@koa/router')
const NotificationModel = require('../model/Plan')
const { verifyAdminLogin, verifyLogin } = require('../utils/verify')

const router = new Router({ prefix: '/plan' })

router.get('/', verifyLogin, async ctx => {
  try {
    const { pageSize, currentPage } = ctx.request.query
    const list = await NotificationModel.find()
      .skip(parseInt(pageSize) * parseInt(currentPage))
      .limit(parseInt(pageSize))
    const total = await NotificationModel.find().countDocuments()
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

router.post('/', verifyAdminLogin, async ctx => {
  try {
    const { planId, title, currentPrice, originalPrice } = ctx.request.body
    const data = new NotificationModel({
      planId,
      title,
      currentPrice,
      originalPrice,
    })
    await data.save()
    ctx.body = {
      code: '1000',
      message: '添加成功',
    }
  } catch (err) {
    console.log(err)
    ctx.body = {
      code: '9000',
      message: '请求错误',
    }
  }
})

router.put('/:id', verifyAdminLogin, async ctx => {
  try {
    const { planId, title, currentPrice, originalPrice } = ctx.request.body
    const result = await NotificationModel.updateOne(
      { _id: ctx.params.id },
      {
        $set: {
          planId,
          title,
          currentPrice,
          originalPrice,
        },
      },
    )
    if (result.ok == 1 && result.nModified == 1) {
      ctx.body = {
        code: '1000',
        message: '修改成功',
      }
    } else {
      ctx.body = {
        code: '2000',
        message: '修改失败',
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

router.post('/delete', verifyAdminLogin, async ctx => {
  try {
    const { items } = ctx.request.body
    const result = await NotificationModel.deleteMany({ _id: { $in: items } })
    if (result.ok == 1 && result.deletedCount == items.length) {
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
