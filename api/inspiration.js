const Router = require('@koa/router')
const moment = require('moment')
const JWT = require('../utils/jwt')
const InspirationModel = require('../model/Inspiration')
const {
  verifyAppBaseInfo,
  verifyAdminLogin,
  verifyUserLogin,
} = require('../utils/verify')

const router = new Router({ prefix: '/inspiration' })

router.get('/today', verifyAppBaseInfo, async ctx => {
  try {
    let isLiked = false
    const data = await InspirationModel.find().sort({ _id: -1 })
    const token = ctx.request.header.authorization
    if (token) {
      const jwt = new JWT(token)
      const res = jwt.verifyToken()
      if (res.user) {
        isLiked = data[0].likedUsers.includes(res.user)
      }
    }
    ctx.body = {
      code: '1000',
      message: '请求成功',
      data: {
        id: data[0]._id,
        chinese: data[0].chinese,
        japanese: data[0].japanese,
        likeCount: data[0].likedUsers.length,
        isLiked,
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

router.put('/like/:id', verifyAppBaseInfo, verifyUserLogin, async ctx => {
  try {
    console.log(11111111111)
    const { islike } = ctx.request.body
    const jwt = new JWT(ctx.request.header.authorization)
    const res = jwt.verifyToken()
    if (res.user) {
      let result
      if (islike) {
        result = await InspirationModel.updateOne(
          { _id: ctx.params.id },
          { $pull: { likedUsers: res.user } },
        )
      } else {
        result = await InspirationModel.updateOne(
          { _id: ctx.params.id },
          { $push: { likedUsers: res.user } },
        )
      }
      if (result.ok == 1 && result.nModified == 1) {
        ctx.body = {
          code: '1000',
          message: '点赞成功',
        }
      } else {
        ctx.body = {
          code: '2000',
          message: '点赞失败',
        }
      }
    } else {
      ctx.body = {
        code: '3008',
        message: '无此用户信息，请重新登录',
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
    const { chinese, japanese } = ctx.request.body
    const data = new InspirationModel({
      chinese,
      japanese,
      date: moment().add(8, 'h').format(),
      likedUsers: [],
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
