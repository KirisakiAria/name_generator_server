const Router = require('@koa/router')
const ServiceModel = require('../model/Service')
const FeedbackModel = require('../model/Feedback')
const ApplicationModel = require('../model/Application')
const { verifyAdminLogin } = require('../utils/verify')

const router = new Router({ prefix: '/service' })

router.get('/', async ctx => {
  try {
    const data = await ServiceModel.find()
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

router.get('/privacypolicy', async ctx => {
  try {
    const data = await ServiceModel.find()
    ctx.body = {
      code: '1000',
      message: '请求成功',
      data: data[0].privacyPolicy,
    }
  } catch (err) {
    console.log(err)
    ctx.body = {
      code: '9000',
      message: '请求错误',
    }
  }
})

router.get('/terms', async ctx => {
  try {
    const data = await ServiceModel.find()
    ctx.body = {
      code: '1000',
      message: '请求成功',
      data: data[0].terms,
    }
  } catch (err) {
    console.log(err)
    ctx.body = {
      code: '9000',
      message: '请求错误',
    }
  }
})

router.get('/usage', async ctx => {
  try {
    const data = await ServiceModel.find()
    ctx.body = {
      code: '1000',
      message: '请求成功',
      data: data[0].usage,
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
    const { privacyPolicy, terms, usage } = ctx.request.body
    const result = await ServiceModel.updateOne(
      { _id: ctx.params.id },
      { $set: { privacyPolicy, terms, usage } },
    )
    if (result.ok == 1 && result.nModified == 1) {
      ctx.body = {
        code: '1000',
        message: '保存成功',
      }
    } else {
      ctx.body = {
        code: '2000',
        message: '保存失败',
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

router.get('/feedback', verifyAdminLogin, async ctx => {
  try {
    const {
      startTime,
      endTime,
      searchContent,
      pageSize,
      currentPage,
    } = ctx.request.query
    const pattern = new RegExp(searchContent, 'i')
    let condition
    if (startTime && endTime) {
      condition = {
        tel: pattern,
        time: { $lte: endTime, $gte: startTime },
      }
    } else {
      condition = {
        tel: pattern,
      }
    }
    const list = await FeedbackModel.find(condition)
      .sort({ _id: -1 })
      .skip(parseInt(pageSize) * parseInt(currentPage))
      .limit(parseInt(pageSize))
    const total = await FeedbackModel.find(condition).countDocuments()
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

router.post('/feedback', async ctx => {
  try {
    const { tel, username, email, content } = ctx.request.body
    const data = new FeedbackModel({
      tel,
      username,
      email,
      content,
      time: new Date(),
    })
    await data.save()
    ctx.body = {
      code: '1000',
      message: '反馈成功',
    }
  } catch (err) {
    console.log(err)
    ctx.body = {
      code: '9000',
      message: '请求错误',
    }
  }
})

router.post('/feedback', async ctx => {
  try {
    const { uid, tel, content } = ctx.request.body
    const data = new FeedbackModel({
      uid,
      tel,
      content,
      time: new Date(),
    })
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

router.get('/downloadlink', async ctx => {
  const app = await ApplicationModel.find()
  ctx.body = {
    code: '1000',
    message: '请求成功',
    data: {
      link: app[0].downloadLink,
    },
  }
})

router.post('/feedback/delete', verifyAdminLogin, async ctx => {
  try {
    const { ids } = ctx.request.body
    const result = await FeedbackModel.deleteMany({ _id: { $in: ids } })
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
