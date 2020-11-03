const fs = require('fs')
const Router = require('@koa/router')
const DictionaryModel = require('../model/Dictionary')
const { verifyAdminLogin } = require('../utils/verify')

const router = new Router({ prefix: '/word_dictionary' })

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
        $or: [{ title: pattern }, { content: pattern }],
        date: { $lte: endTime, $gte: startTime },
      }
    } else {
      condition = {
        $or: [{ title: pattern }, { content: pattern }],
      }
    }
    const list = await DictionaryModel.find(condition)
      .sort({ _id: -1 })
      .skip(parseInt(pageSize) * parseInt(currentPage))
      .limit(parseInt(pageSize))
    const total = await DictionaryModel.find(condition).countDocuments()
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
    const {
      word,
      oldword,
      pinyin,
      explanation,
      radicals,
      strokes,
      more,
    } = ctx.request.body
    const data = new DictionaryModel({
      word,
      oldword,
      pinyin,
      explanation,
      radicals,
      strokes,
      more,
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

router.post('/upload', verifyAdminLogin, async ctx => {
  try {
    const {
      path,
      word,
      oldword,
      pinyin,
      explanation,
      radicals,
      strokes,
      more,
    } = ctx.request.body
    const data = await loadFile(path)
    const arr = unique(data.split(','))
    //循环次数
    const times = Array.from({ length: arr.length }, (v, i) => i)
    await (async () => {
      for (let i of times) {
        if (arr[i].length < 1 || arr[i] === '') {
          continue
        }
        const existedWord = await DictionaryModel.findOne({
          word: arr[i].trim(),
        })
        //防止重复
        if (existedWord) {
          continue
        } else {
          const item = new Model({
            word,
            oldword,
            pinyin,
            explanation,
            radicals,
            strokes,
            more,
          })
          await item.save()
        }
      }
    })()
    ctx.body = {
      code: '1000',
      message: '上传成功',
    }
  } catch (err) {
    console.log(err)
    ctx.body = {
      code: '9000',
      message: '请求错误',
    }
  }
})

//去重
const unique = arr => {
  return Array.from(new Set(arr))
}

//读取文件
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

router.put('/:id', verifyAdminLogin, async ctx => {
  try {
    const {
      word,
      oldword,
      pinyin,
      explanation,
      radicals,
      strokes,
      more,
    } = ctx.request.body
    const result = await DictionaryModel.updateOne(
      { _id: ctx.params.id },
      {
        $set: {
          word,
          oldword,
          pinyin,
          explanation,
          radicals,
          strokes,
          more,
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
    const result = await DictionaryModel.deleteMany({ _id: { $in: items } })
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
