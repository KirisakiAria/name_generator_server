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
        code: '3007',
        message: '登陆状态失效，请重新登录',
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

router.get('/history', verifyAppBaseInfo, async ctx => {
  try {
    const { page } = ctx.request.query
    const list = await InspirationModel.find()
      .sort({ _id: -1 })
      .skip(15 * parseInt(page))
      .limit(15)
    const total = await InspirationModel.find().countDocuments()
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

router.get('/history/:id', verifyAppBaseInfo, async ctx => {
  try {
    const data = await InspirationModel.findOne({ _id: ctx.params.id })
    ctx.body = {
      code: '1000',
      message: '请求成功',
      data: data,
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
    const { searchContent, pageSize, currentPage } = ctx.request.query
    const pattern = new RegExp(searchContent, 'i')
    const condition = {
      $or: [
        { 'chinese.title': pattern },
        { 'chinese.content': pattern },
        { 'japanese.title': pattern },
        { 'japanese.content': pattern },
        { 'japanese.titleTranslation': pattern },
        { 'japanese.contentTranslation': pattern },
      ],
    }

    const list = await InspirationModel.find(condition)
      .sort({ _id: -1 })
      .skip(parseInt(pageSize) * parseInt(currentPage))
      .limit(parseInt(pageSize))
    const total = await InspirationModel.find(condition).countDocuments()
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
    const body = ctx.request.body
    const data = new InspirationModel({
      ...body,
      date: moment().format('YYYY-MM-DD HH:mm:ss'),
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
    const { chinese, japanese, likedUsers } = ctx.request.body
    const result = await InspirationModel.updateOne(
      { _id: ctx.params.id },
      {
        $set: {
          chinese,
          japanese,
          likedUsers,
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
