const fs = require('fs')
const Router = require('@koa/router')
const router = new Router({ prefix: '/word' })
const JapaneseFourWordModel = require('../model/JapaneseFourWord')
const JapaneseThreeWordModel = require('../model/JapaneseThreeWord')
const JapaneseTwoWordModel = require('../model/JapaneseTwoWord')
const JapaneseOneWordModel = require('../model/JapaneseOneWord')
const ChineseFourWordModel = require('../model/ChineseFourWord')
const ChineseThreeWordModel = require('../model/ChineseThreeWord')
const ChineseTwoWordModel = require('../model/ChineseTwoWord')
const ChineseOneWordModel = require('../model/ChineseOneWord')
const { verifyLogin } = require('../utils/verify')

router.post('/', async ctx => {
  try {
    const { type, number } = ctx.request.body
    const nameList = ['深淵道化', '失踪領域', '氷雪戦機']
    const randomIndex = Math.round(Math.random() * 2)
    ctx.body = {
      code: '1000',
      message: '请求成功',
      data: {
        word: nameList[randomIndex],
      },
    }
  } catch (e) {
    console.log(e)
    ctx.body = {
      code: '9000',
      message: '请求错误',
    }
  }
})

const selectModel = (type, number) => {
  if (type == '中国风') {
    switch (number) {
      case 1:
        model = ChineseOneWordModel
        break
      case 2:
        model = ChineseTwoWordModel
        break
      case 3:
        model = ChineseThreeWordModel
        break
      case 4:
        model = ChineseFourWordModel
        break
    }
  } else {
    switch (number) {
      case 1:
        model = JapaneseOneWordModel
        break
      case 2:
        model = JapaneseTwoWordModel
        break
      case 3:
        model = JapaneseThreeWordModel
        break
      case 4:
        model = JapaneseFourWordModel
        break
    }
  }
  return model
}

router.post('/add', verifyLogin, async ctx => {
  try {
    const { word, type } = ctx.request.body
    const Model = selectModel(type, word.length)
    const wordObj = new Model({ word })
    await wordObj.save()
    ctx.body = {
      code: '1000',
      message: '添加成功',
    }
  } catch (e) {
    console.log(e)
    ctx.body = {
      code: '9000',
      message: '请求错误',
    }
  }
})

router.get('/', async ctx => {
  try {
    const {
      type,
      number,
      searchContent,
      pageSize,
      currentPage,
    } = ctx.request.query
    const Model = selectModel(type, Number.parseInt(number))
    const pattern = new RegExp(searchContent, 'i')
    list = await Model.find({ word: pattern })
      .sort({ _id: -1 })
      .skip(parseInt(pageSize) * parseInt(currentPage))
      .limit(parseInt(pageSize))
    total = await Model.find({ word: pattern }).countDocuments()
    ctx.body = {
      code: '1000',
      message: '请求成功',
      data: {
        list,
        total,
      },
    }
  } catch (e) {
    console.log(e)
    ctx.body = {
      code: '9000',
      message: '请求错误',
    }
  }
})

router.post('/file', async ctx => {
  try {
    const { type, path } = ctx.request.body
    const data = await loadFile(path)
    const arr = data.split(',')
    arr.forEach(async e => {
      const Model = selectModel(type, e.length)
      const word = new Model({ word: e })
      await word.save()
    })
    ctx.body = {
      code: '1000',
      message: '上传成功',
    }
  } catch (err) {
    ctx.body = {
      code: '9000',
      message: '请求错误',
    }
  }
})

const loadFile = path => {
  return new Promise((resolve, reject) => {
    let data = ''
    const readerStream = fs.createReadStream(`${process.cwd()}/public${path}`)
    readerStream.setEncoding('UTF8')
    readerStream.on('data', chunk => {
      data += chunk
    })
    readerStream.on('error', err => {
      reject(err)
      console.log(`读取文件出错：${err.stack}`)
    })
    readerStream.on('end', () => {
      resolve(data)
    })
  })
}

router.delete('/:id', async ctx => {
  try {
    const { type, number } = ctx.request.query
    const Model = selectModel(type, Number.parseInt(number))
    const result = await Model.deleteOne({ _id: ctx.params.id })
    if (result.ok == 1 && result.deletedCount == 1) {
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
  } catch (e) {
    console.log(e)
    ctx.body = {
      code: '9000',
      message: '请求错误',
    }
  }
})

module.exports = router
