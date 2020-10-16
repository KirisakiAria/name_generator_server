const Router = require('@koa/router')
const InspirationModel = require('../model/Inspiration')
const { verifyAppBaseInfo, verifyAdminLogin } = require('../utils/verify')

const router = new Router({ prefix: '/inspiration' })

router.get('/today', verifyAppBaseInfo, async ctx => {
  try {
    const data = await InspirationModel.find()
    ctx.body = {
      code: '1000',
      message: '请求成功',
      data: data[0],
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
    let condition
    const pattern = new RegExp(searchContent, 'i')
    if (startTime && endTime) {
      condition = {
        $or: [
          { 'chinese.title': pattern },
          { 'chinese.content': pattern },
          { 'japanese.title': pattern },
          { 'japanese.content': pattern },
        ],
        date: { $lte: endTime, $gte: startTime },
      }
    } else {
      condition = {
        $or: [
          { 'chinese.title': pattern },
          { 'chinese.content': pattern },
          { 'japanese.title': pattern },
          { 'japanese.content': pattern },
        ],
      }
    }
    const list = await InspirationModel.find(condition)
      .sort({ _id: -1 })
      .skip(parseInt(pageSize) * parseInt(currentPage))
      .limit(parseInt(pageSize))
    const total = await InspirationModel.find({
      word: pattern,
    }).countDocuments()
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
    const { chinese, japanese, date } = ctx.request.body
    const data = new InspirationModel({
      chinese,
      japanese,
      date,
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
    const { chinese, japanese } = ctx.request.body
    const result = await InspirationModel.updateOne(
      { _id: ctx.params.id },
      {
        $set: {
          chinese,
          japanese,
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
    const result = await InspirationModel.deleteMany({ _id: { $in: items } })
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
