const fs = require('fs')
const Router = require('@koa/router')
const router = new Router({ prefix: '/word' })
const JWT = require('../utils/jwt')
const JapaneseWordModel = require('../model/JapaneseWord')
const ChineseWordModel = require('../model/ChineseWord')
const UserModel = require('../model/User')
const CoupleModel = require('../model/Couple')
const { verifyAppBaseInfo, verifyAdminLogin } = require('../utils/verify')

router.post('/random', verifyAppBaseInfo, async ctx => {
  try {
    const { type, length } = ctx.request.body
    const Model = selectModel(type)
    const count = await Model.find({
      length: Number.parseInt(length),
    }).countDocuments()
    const randomIndex = Math.floor(Math.random() * count)
    let data = await Model.findOne({
      length: Number.parseInt(length),
    }).skip(randomIndex)
    const jwt = new JWT(ctx.request.header.authorization)
    const res = jwt.verifyToken()
    if (res.user) {
      await UserModel.findOne({ tel: res.user }, (err, res) => {
        if (err) {
          console.log(err)
        } else {
          res.history.unshift({
            type,
            length,
            word: data.word,
          })
          if (res.history.length > 200) {
            for (let i = res.history.length - 200; i > 0; i--) {
              res.history.shift()
            }
          }
          res.save()
        }
      })
    }
    if (!data) {
      data = {
        word: '无',
      }
    }
    ctx.body = {
      code: '1000',
      message: '请求成功',
      data: {
        word: data.word,
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

const selectModel = type => {
  if (type == '中国风') {
    return ChineseWordModel
  } else {
    return JapaneseWordModel
  }
}

router.get('/', verifyAdminLogin, async ctx => {
  try {
    const {
      type,
      length,
      searchContent,
      pageSize,
      currentPage,
    } = ctx.request.query
    const Model = selectModel(type)
    const pattern = new RegExp(searchContent, 'i')
    const list = await Model.find({
      word: pattern,
      length: Number.parseInt(length),
    })
      .sort({ _id: -1 })
      .skip(parseInt(pageSize) * parseInt(currentPage))
      .limit(parseInt(pageSize))
    const total = await Model.find({
      word: pattern,
      length: Number.parseInt(length),
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
    const { word, type, classify } = ctx.request.body
    const Model = selectModel(type)
    const existedWord = await Model.findOne({ word })
    if (existedWord) {
      ctx.body = {
        code: '2001',
        message: '词语已存在',
      }
    } else {
      const wordObj = new Model({
        word,
        length: word.length,
        classify,
      })
      await wordObj.save()
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

router.put('/:id', verifyAdminLogin, async ctx => {
  try {
    const { word, type } = ctx.request.body
    const Model = selectModel(type)
    const result = await Model.updateOne(
      { _id: ctx.params.id },
      { $set: { word } },
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

router.post('/file', verifyAdminLogin, async ctx => {
  try {
    const writerStream = fs.createWriteStream(
      process.cwd() + '/logs/word_upload.log',
      {
        flags: 'a',
      },
    )
    const { type, path } = ctx.request.body
    const data = await loadFile(path)
    const arr = unique(data.split(','))
    let length = 0
    arr.forEach(async e => {
      if (e.length < 1 || e === '') {
        return false
      }
      const Model = selectModel(type)
      const existedWord = await Model.findOne({
        word: e,
      })
      //防止重复
      if (existedWord) {
        return false
      } else {
        const word = new Model({
          word: e,
          length: e.length,
          classify: '默认',
        })
        await word.save()
        length++
      }
    })
    const jwt = new JWT(ctx.request.header.authorization)
    const res = jwt.verifyToken()
    writerStream.write(
      `用户：${res.user}在${new Date()}上传了${
        arr.length
      }个词语，上传成功${length}个\n`,
      'UTF8',
    )
    writerStream.end()
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

router.post('/delete', verifyAdminLogin, async ctx => {
  try {
    const { type, ids } = ctx.request.body
    const Model = selectModel(type)
    const result = await Model.deleteMany({ _id: { $in: ids } })
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

router.get('/couples', verifyAdminLogin, async ctx => {
  try {
    const {
      type,
      length,
      searchContent,
      pageSize,
      currentPage,
    } = ctx.request.query
    const pattern = new RegExp(searchContent, 'i')
    const list = await CoupleModel.find({
      words: { $all: [pattern] },
      type,
      length: Number.parseInt(length),
    })
      .sort({ _id: -1 })
      .skip(parseInt(pageSize) * parseInt(currentPage))
      .limit(parseInt(pageSize))
    const total = await CoupleModel.find({
      words: pattern,
      type,
      length: Number.parseInt(length),
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

router.post('/couples', verifyAdminLogin, async ctx => {
  try {
    const { type, words, checked } = ctx.request.body
    let stringWords
    if (checked) {
      stringWords = [
        [words[0].word, words[1].word],
        [words[1].word, words[0].word],
      ]
    } else {
      stringWords = [
        [words[0], words[1]],
        [words[1], words[0]],
      ]
    }
    const existedWord = await CoupleModel.findOne({
      words: { $in: stringWords },
    })
    if (existedWord) {
      ctx.body = {
        code: '2001',
        message: '情侣词语已存在',
      }
    } else {
      const couple = new CoupleModel({
        type,
        words: checked ? [words[0].word, words[1].word] : [words[0], words[1]],
        length: words[0].length,
      })
      await couple.save()
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

router.put('/couples/:id', verifyAdminLogin, async ctx => {
  try {
    const { type, words } = ctx.request.body
    const result = await CoupleModel.updateOne(
      { _id: ctx.params.id },
      {
        $set: {
          type,
          words,
          length: words[0].length,
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

router.post('/couples/delete', verifyAdminLogin, async ctx => {
  try {
    const { ids } = ctx.request.body
    const result = await CoupleModel.deleteMany({ _id: { $in: ids } })
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
