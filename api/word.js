const fs = require('fs')
const Router = require('@koa/router')
const router = new Router({ prefix: '/word' })
const JWT = require('../utils/jwt')
const JapaneseFiveWordModel = require('../model/JapaneseFiveWord')
const JapaneseFourWordModel = require('../model/JapaneseFourWord')
const JapaneseThreeWordModel = require('../model/JapaneseThreeWord')
const JapaneseTwoWordModel = require('../model/JapaneseTwoWord')
const JapaneseOneWordModel = require('../model/JapaneseOneWord')
const ChineseFiveWordModel = require('../model/ChineseFiveWord')
const ChineseFourWordModel = require('../model/ChineseFourWord')
const ChineseThreeWordModel = require('../model/ChineseThreeWord')
const ChineseTwoWordModel = require('../model/ChineseTwoWord')
const ChineseOneWordModel = require('../model/ChineseOneWord')
const UserModel = require('../model/User')
const { verifyAppBaseInfo, verifyAdminLogin } = require('../utils/verify')

router.post('/random', verifyAppBaseInfo, async ctx => {
  try {
    const { type, number } = ctx.request.body
    const Model = selectModel(type, Number.parseInt(number))
    const count = await Model.find().countDocuments()
    const randomIndex = Math.floor(Math.random() * count)
    let data = await Model.findOne().skip(randomIndex)
    const jwt = new JWT(ctx.request.header.authorization)
    const res = jwt.verifyToken()
    if (res.user) {
      await UserModel.findOne({ tel: res.user }, (err, res) => {
        if (err) {
          console.log(err)
        } else {
          res.history.unshift({
            type,
            number,
            word: data.word,
          })
          if (res.history.length > 300) {
            for (let i = res.history.length - 300; i > 0; i--) {
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

const selectModel = (type, number) => {
  let model
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
      case 5:
        model = ChineseFiveWordModel
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
      case 5:
        model = JapaneseFiveWordModel
        break
    }
  }
  return model
}

router.get('/', verifyAdminLogin, async ctx => {
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
    const list = await Model.find({ word: pattern })
      .sort({ _id: -1 })
      .skip(parseInt(pageSize) * parseInt(currentPage))
      .limit(parseInt(pageSize))
    const total = await Model.find({ word: pattern }).countDocuments()
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
    const { word, type } = ctx.request.body
    const Model = selectModel(type, word.length)
    const existedWord = await Model.findOne({ word })
    if (existedWord) {
      ctx.body = {
        code: '2001',
        message: '词语已存在',
      }
    } else {
      const wordObj = new Model({ word })
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
    const Model = selectModel(type, word.length)
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
    arr.forEach(async e => {
      //最大长度暂定为5
      if (e.length > 5) {
        return false
      }
      const Model = selectModel(type, e.length)
      const existedWord = await Model.findOne({ word: e })
      //防止重复
      if (existedWord) {
        return false
      } else {
        const word = new Model({ word: e })
        await word.save()
      }
    })
    const jwt = new JWT(ctx.request.header.authorization)
    const res = jwt.verifyToken()
    writerStream.write(
      `用户：${res.user}在${new Date()}上传了${arr.length}个词语\n`,
      'UTF8',
    )
    writerStream.end()
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

router.delete('/:id', verifyAdminLogin, async ctx => {
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
  } catch (err) {
    console.log(err)
    ctx.body = {
      code: '9000',
      message: '请求错误',
    }
  }
})

module.exports = router
