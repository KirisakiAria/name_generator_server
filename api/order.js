const Router = require('@koa/router')
const OrderModel = require('../model/Order')
const JWT = require('../utils/jwt')
const {
  verifyAppBaseInfo,
  verifyUserLogin,
  verifyAdminLogin,
} = require('../utils/verify')

const router = new Router({ prefix: '/order' })

router.get('/my', verifyAppBaseInfo, verifyUserLogin, async ctx => {
  try {
    const { pageSize, currentPage } = ctx.request.query
    const jwt = new JWT(ctx.request.header.authorization)
    const res = jwt.verifyToken()
    const pattern = new RegExp(res.user, 'i')
    const condition = {
      $or: [{ title: pattern }, { content: pattern }],
    }
    const list = await OrderModel.find(condition)
      .sort({ _id: -1 })
      .skip(parseInt(pageSize) * parseInt(currentPage))
      .limit(parseInt(pageSize))
    const total = await OrderModel.find(condition).countDocuments()
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

router.get('/', verifyAdminLogin, async ctx => {
  try {
    const {
      searchContent,
      startTime,
      endTime,
      pageSize,
      currentPage,
    } = ctx.request.query
    const pattern = new RegExp(searchContent, 'i')
    let condition
    if (startTime && endTime) {
      condition = {
        tel: pattern,
        time: { $gte: startTime, $lte: endTime },
      }
    } else {
      condition = {
        tel: pattern,
      }
    }
    const list = await OrderModel.find(condition)
      .sort({ _id: -1 })
      .skip(parseInt(pageSize) * parseInt(currentPage))
      .limit(parseInt(pageSize))
    const total = await OrderModel.find(condition).countDocuments()
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
    const { orderNo, tel, price, paymentMethod } = ctx.request.body
    const data = new OrderModel({
      orderNo,
      tel,
      price,
      time: Date.now(),
      paymentMethod,
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
    const { orderNo, tel, price, paymentMethod } = ctx.request.body
    const result = await OrderModel.updateOne(
      { _id: ctx.params.id },
      {
        $set: {
          orderNo,
          tel,
          price,
          paymentMethod,
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
    const result = await OrderModel.deleteMany({ _id: { $in: items } })
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
