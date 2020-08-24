const Router = require('@koa/router')
const ClassifyModel = require('../model/Classify')
const { verifyAdminLogin } = require('../utils/verify')

const router = new Router({ prefix: '/dictionary' })

router.get('/classify', verifyAdminLogin, async ctx => {
  try {
    const { all, searchContent, pageSize, currentPage } = ctx.request.query
    const pattern = new RegExp(searchContent, 'i')
    let list,
      total = [[], 0]
    if (all) {
      list = await ClassifyModel.find({ name: pattern })
    } else {
      list = await ClassifyModel.find({ name: pattern })
        .sort({ _id: -1 })
        .skip(parseInt(pageSize) * parseInt(currentPage))
        .limit(parseInt(pageSize))
      total = await ClassifyModel.find({ name: pattern }).countDocuments()
    }
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

router.post('/classify', verifyAdminLogin, async ctx => {
  try {
    const { name } = ctx.request.body
    const trimedName = name.trim()
    const existedName = await ClassifyModel.findOne({ name: trimedName })
    if (existedName) {
      ctx.body = {
        code: '2001',
        message: '分类已存在',
      }
    } else {
      const classifyObj = new ClassifyModel({
        name: trimedName,
      })
      await classifyObj.save()
      ctx.body = {
        code: '1000',
        message: '添加成功',
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

router.put('/classify/:id', verifyAdminLogin, async ctx => {
  try {
    const { name } = ctx.request.body
    const result = await ClassifyModel.updateOne(
      { _id: ctx.params.id },
      {
        $set: {
          name: name.trim(),
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

router.post('/classify/delete', verifyAdminLogin, async ctx => {
  try {
    const { items } = ctx.request.body
    const result = await ClassifyModel.deleteMany({ _id: { $in: items } })
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
