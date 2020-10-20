const fs = require('fs')
const moment = require('moment')
const zlib = require('zlib')
const axios = require('axios')
const parser = require('fast-xml-parser')
const he = require('he')
const Router = require('@koa/router')
const router = new Router({ prefix: '/word' })
const JWT = require('../utils/jwt')
const JapaneseWordModel = require('../model/JapaneseWord')
const ChineseWordModel = require('../model/ChineseWord')
const UserModel = require('../model/User')
const CoupleModel = require('../model/Couple')
const { verifyAppBaseInfo, verifyAdminLogin } = require('../utils/verify')

const findRandomWord = async (Model, count, length) => {
  const randomIndex = Math.floor(Math.random() * count)
  let data = await Model.findOne({
    length: Number.parseInt(length),
    showable: true,
  }).skip(randomIndex)
  return data
}

router.post('/random', verifyAppBaseInfo, async ctx => {
  try {
    const threshold = 50
    let data
    const { type, length, ifRomaji } = ctx.request.body
    const Model = selectModel(type)
    const count = await Model.find({
      length: Number.parseInt(length),
      showable: true,
    }).countDocuments()
    data = await findRandomWord(Model, count, length)
    //防止查词重复（阈值50）
    while (ctx.session.words && ctx.session.words.includes(data.word)) {
      data = await findRandomWord(Model, count, length)
    }
    if (ctx.session.words) {
      ctx.session.words.push(data.word)
    } else {
      ctx.session.words = [data.word]
    }
    if (ctx.session.words.length > threshold) {
      ctx.session.words.shift()
    }
    const jwt = new JWT(ctx.request.header.authorization)
    const res = jwt.verifyToken()
    if (res.user && data) {
      await UserModel.findOne({ tel: res.user }, (err, user) => {
        if (err) {
          console.log(err)
        } else {
          if (!user.history) {
            ctx.body = {
              code: '3007',
              message: '登录状态失效，请重新登录',
            }
            return
          }
          user.history.unshift({
            type,
            length,
            word: data.word,
          })
          if (user.history.length > 500) {
            for (let i = user.history.length - 200; i > 0; i--) {
              user.history.pop()
            }
          }
          user.save()
        }
      })
    }
    //罗马字
    const romaji = await getRomaji(ifRomaji, type, data.word)
    ctx.body = {
      code: '1000',
      message: '请求成功',
      data: {
        word: data.word,
        romaji,
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

router.post('/search', verifyAppBaseInfo, async ctx => {
  try {
    const { searchContent, currentPage } = ctx.request.body
    if (searchContent == '') {
      ctx.body = {
        code: '2003',
        message: '请输入关键字',
      }
    } else {
      const pattern = new RegExp(searchContent, 'i')
      const conditions = {
        word: pattern,
        showable: true,
        length: { $lte: 5 },
      }
      let chineselist = await ChineseWordModel.find(conditions)
        .skip(15 * parseInt(currentPage))
        .limit(15)
      let japaneselist = await JapaneseWordModel.find(conditions)
        .skip(15 * parseInt(currentPage))
        .limit(15)
      chineselist = chineselist.map(e =>
        Object.assign(e.toObject(), { type: '中国风' }),
      )
      japaneselist = japaneselist.map(e =>
        Object.assign(e.toObject(), { type: '日式' }),
      )
      ctx.body = {
        code: '1000',
        message: '请求成功',
        data: {
          list: chineselist.concat(japaneselist),
        },
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

const parseOptions = {
  attributeNamePrefix: '',
  attrNodeName: 'attr', //default is 'false'
  textNodeName: '#text',
  ignoreAttributes: false,
  ignoreNameSpace: false,
  allowBooleanAttributes: false,
  parseNodeValue: true,
  parseAttributeValue: false,
  trimValues: true,
  cdataTagName: '__cdata', //default is 'false'
  cdataPositionChar: '\\c',
  parseTrueNumberOnly: false,
  arrayMode: false, //"strict"
  attrValueProcessor: val => he.decode(val, { isAttributeValue: true }), //default is a=>a
  tagValueProcessor: val => he.decode(val), //default is a=>a
  stopNodes: ['parse-me-as-string'],
}

const getRomaji = async (ifRomaji, type, word) => {
  if (ifRomaji && type == '日式') {
    let romaji = ''
    const options = {
      method: 'POST',
      headers: { 'content-type': 'application/x-www-form-urlencoded' },
      data: `mode=japanese&q=${word}`,
      url: 'http://www.kawa.net/works/ajax/romanize/romanize.cgi',
    }
    const res = await axios(options)
    if (res.status == 200) {
      const json = parser.parse(res.data, parseOptions)
      if (json?.ul?.li?.span.length) {
        json.ul.li.span.forEach(e => {
          romaji += e.attr?.title.split('/')[0]
        })
      } else {
        romaji = json?.ul?.li?.span?.attr?.title.split('/')[0]
      }
    }
    if (romaji) {
      return romaji
    } else {
      return ''
    }
  } else {
    return ''
  }
}

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
      showable,
      searchContent,
      pageSize,
      currentPage,
    } = ctx.request.query
    const Model = selectModel(type)
    const pattern = new RegExp(searchContent, 'i')
    let conditions = {
      word: pattern,
      length: Number.parseInt(length),
    }
    if (showable !== 'all') {
      conditions = Object.assign(conditions, {
        showable,
      })
    }
    const list = await Model.find(conditions)
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
    const { word, type, classify, showable } = ctx.request.body
    const arr = unique(word.split(','))
    const Model = selectModel(type)
    arr.forEach(async e => {
      if (e.length < 1 || e === '') {
        return false
      }
      const existedWord = await Model.findOne({
        word: e.trim(),
      })
      //防止重复
      if (existedWord) {
        return false
      } else {
        const word = new Model({
          word: e.trim(),
          length: e.trim().length,
          classify,
          showable,
        })
        await word.save()
      }
    })
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
    const { word, type, classify, showable } = ctx.request.body
    const Model = selectModel(type)
    const result = await Model.updateOne(
      { _id: ctx.params.id },
      {
        $set: {
          word,
          classify,
          showable,
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

router.post('/upload', verifyAdminLogin, async ctx => {
  try {
    const writerStream = fs.createWriteStream(
      process.cwd() + '/logs/word_upload.log',
      {
        flags: 'a',
      },
    )
    const clientIp = ctx.req.connection.remoteAddress
    const { type, path, showable } = ctx.request.body
    const Model = selectModel(type)
    const data = await loadFile(path)
    const arr = unique(data.split(','))
    let length = 0
    //循环次数
    const times = Array.from({ length: arr.length }, (v, i) => i)
    await (async () => {
      for (let i of times) {
        if (arr[i].length < 1 || arr[i] === '') {
          continue
        }
        const existedWord = await Model.findOne({
          word: arr[i].trim(),
        })
        //防止重复
        if (existedWord) {
          continue
        } else {
          const word = new Model({
            word: arr[i].trim(),
            length: arr[i].trim().length,
            classify: '默认',
            showable,
          })
          await word.save()
          length++
        }
      }
    })()
    const jwt = new JWT(ctx.request.header.authorization)
    const res = jwt.verifyToken()
    writerStream.write(
      `用户：${res.user} IP：${clientIp} 在${moment().format()}上传了${
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

router.post('/output', verifyAdminLogin, async ctx => {
  try {
    const txtPath = '/public/output/word.txt'
    const gzPath = '/public/output/word.txt.gz'
    const writerStream = fs.createWriteStream(process.cwd() + txtPath)
    const { type, classify, showable, length } = ctx.request.body
    let condition = {}
    if (classify !== 'all') {
      condition = Object.assign(condition, { classify })
    }
    if (showable !== 'all') {
      condition = Object.assign(condition, { showable })
    }
    if (length !== 'all') {
      condition = Object.assign(condition, { length })
    }
    const Model = selectModel(type)
    const list = await Model.find(condition)
    let str = ''
    list.forEach(e => {
      str += `${e.word},`
    })
    writerStream.write(str, 'UTF8')
    writerStream.end()
    const inp = fs.createReadStream(process.cwd() + txtPath)
    const out = fs.createWriteStream(process.cwd() + gzPath)
    const gzlib = zlib.createGzip()
    inp.pipe(gzlib).pipe(out)
    ctx.body = {
      code: '1000',
      message: '下载成功',
      downloadUrl: gzPath.replace('/public', ''),
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
    const { type, items } = ctx.request.body
    const Model = selectModel(type)
    const result = await Model.deleteMany({ _id: { $in: items } })
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

router.post('/toggleshowable', verifyAdminLogin, async ctx => {
  try {
    const { type, items, showable } = ctx.request.body

    const Model = selectModel(type)
    const result = await Model.updateMany(
      { _id: { $in: items } },
      { $set: { showable } },
    )
    if (result.ok == 1 && result.nModified == items.length) {
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

router.get('/couples', verifyAdminLogin, async ctx => {
  try {
    const {
      type,
      length,
      showable,
      searchContent,
      pageSize,
      currentPage,
    } = ctx.request.query
    const pattern = new RegExp(searchContent, 'i')
    let conditions = {
      words: { $all: [pattern] },
      type,
      length: Number.parseInt(length),
    }
    if (showable !== 'all') {
      conditions = Object.assign(conditions, {
        showable,
      })
    }
    const list = await CoupleModel.find(conditions)
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
    const { type, words, checked, showable } = ctx.request.body
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
        showable,
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

router.post('/couples/addToWordList', verifyAdminLogin, async ctx => {
  try {
    const { wordList } = ctx.request.body
    let length = 0
    for (let el of wordList) {
      const Model = selectModel(el.type)
      const existedWord1 = await Model.findOne({ word: el.words[0] })
      if (!existedWord1) {
        const wordObj = new Model({
          word: el.words[0],
          length: el.words[0].length,
          classify: '默认',
          showable: true,
        })
        await wordObj.save()
        length++
      }
      const existedWord2 = await Model.findOne({ word: el.words[1] })
      if (!existedWord2) {
        const wordObj = new Model({
          word: el.words[1],
          length: el.words[1].length,
          classify: '默认',
          showable: true,
        })
        await wordObj.save()
        length++
      }
    }
    ctx.body = {
      code: '1000',
      message: `操作完成，共添加${length}个词语`,
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
    const { type, words, showable } = ctx.request.body
    const result = await CoupleModel.updateOne(
      { _id: ctx.params.id },
      {
        $set: {
          type,
          words,
          length: words[0].length,
          showable,
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

router.post('/couples/upload', verifyAdminLogin, async ctx => {
  try {
    const writerStream = fs.createWriteStream(
      process.cwd() + '/logs/couples_upload.log',
      {
        flags: 'a',
      },
    )
    const clientIp = ctx.req.connection.remoteAddress
    const { type, path, showable } = ctx.request.body
    const data = await loadFile(path)
    const arr = assemble(unique(data.split(',')), 2)
    let length = 0
    //循环次数
    const times = Array.from({ length: arr.length }, (v, i) => i)
    await (async () => {
      for (let i of times) {
        if (
          arr[i][0].length < 1 ||
          arr[i][0] === '' ||
          arr[i][1].length < 1 ||
          arr[i][1] === ''
        ) {
          continue
        }
        const stringWords = [
          [arr[i][0], arr[i][1]],
          [arr[i][1], arr[i][0]],
        ]
        const existedWord = await CoupleModel.findOne({
          words: { $in: stringWords },
        })
        //防止重复
        if (existedWord) {
          continue
        } else {
          const couple = new CoupleModel({
            type,
            words: [arr[i][0], arr[i][1]],
            length: arr[i][0].length,
            showable,
          })
          await couple.save()
          length++
        }
      }
    })()
    const jwt = new JWT(ctx.request.header.authorization)
    const res = jwt.verifyToken()
    writerStream.write(
      `用户：${res.user} IP：${clientIp} 在${moment().format()}上传了${
        arr.length
      }个情侣词，上传成功${length / 2}对\n`,
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

//一维转二维数组
const assemble = (arr, size) => {
  // arr是一维数组 size是二维数组包含几条数据
  const twoDArr = []
  for (let i = 0; i < arr.length; i = i + size) {
    twoDArr.push(arr.slice(i, i + size))
  }
  return twoDArr // 新的二维数组
}

router.post('/couples/delete', verifyAdminLogin, async ctx => {
  try {
    const { items } = ctx.request.body
    const result = await CoupleModel.deleteMany({ _id: { $in: items } })
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

router.post('/couples/toggleshowable', verifyAdminLogin, async ctx => {
  try {
    const { items, showable } = ctx.request.body
    const result = await CoupleModel.updateMany(
      { _id: { $in: items } },
      { $set: { showable } },
    )
    if (result.ok == 1 && result.nModified == items.length) {
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

router.post('/couples/output', verifyAdminLogin, async ctx => {
  try {
    const txtPath = '/public/output/couples.txt'
    const gzPath = '/public/output/couples.txt.gz'
    const writerStream = fs.createWriteStream(process.cwd() + txtPath)
    const { type, showable, length } = ctx.request.body
    let condition = { type }
    if (showable !== 'all') {
      condition = Object.assign(condition, { showable })
    }
    if (length !== 'all') {
      condition = Object.assign(condition, { length })
    }
    const list = await CoupleModel.find(condition)
    let str = ''
    list.forEach(e => {
      str += `${e.words.join(',')},`
    })
    writerStream.write(str, 'UTF8')
    writerStream.end()
    const inp = fs.createReadStream(process.cwd() + txtPath)
    const out = fs.createWriteStream(process.cwd() + gzPath)
    const gzlib = zlib.createGzip()
    inp.pipe(gzlib).pipe(out)
    ctx.body = {
      code: '1000',
      message: '下载成功',
      downloadUrl: gzPath.replace('/public', ''),
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
