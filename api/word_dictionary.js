const fs = require('fs')
const Router = require('@koa/router')
const WordDictionaryModel = require('../model/WordDictionary')
const { verifyAdminLogin } = require('../utils/verify')

const router = new Router({ prefix: '/word_dictionary' })

router.get('/', verifyAdminLogin, async ctx => {
  try {
    const {
      word,
      explanation,
      length,
      type,
      pageSize,
      currentPage,
    } = ctx.request.query
    const wordPattern = new RegExp(word, 'i')
    const explanationPattern = new RegExp(explanation, 'i')
    const condition = {
      word: wordPattern,
      length,
      type,
      explanation: explanationPattern,
    }
    const list = await WordDictionaryModel.find(condition)
      .sort({ _id: -1 })
      .skip(parseInt(pageSize) * parseInt(currentPage))
      .limit(parseInt(pageSize))
    const total = await WordDictionaryModel.find(condition).countDocuments()
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
      type,
    } = ctx.request.body
    const data = new WordDictionaryModel({
      word,
      oldword,
      length: word.length,
      pinyin,
      explanation,
      radicals,
      strokes,
      more,
      type,
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
    const { path } = ctx.request.body
    const rawData = await loadFile(path)
    const data = JSON.parse(rawData)
    let progress = 0
    //循环次数
    const times = Array.from({ length: data.length }, (v, i) => i)
    await (async () => {
      for (let i of times) {
        const word = data[i].word || data[i].ci
        //防止重复
        const item = new WordDictionaryModel({
          word,
          oldword: data[i].oldword,
          length: String(word).length,
          pinyin: data[i].pinyin,
          explanation: data[i].explanation,
          radicals: data[i].radicals,
          strokes: data[i].strokes,
          more: data[i].more,
        })
        await item.save()
        progress++
        console.log(`当前上传进度：${progress}/${data.length}`)
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
    const result = await WordDictionaryModel.updateOne(
      { _id: ctx.params.id },
      {
        $set: {
          word,
          oldword,
          length: word.length,
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
    const result = await WordDictionaryModel.deleteMany({ _id: { $in: items } })
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
