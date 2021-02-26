const fs = require('fs')
const Router = require('@koa/router')
const moment = require('moment')
const SurnameModel = require('../model/Surname')
const JWT = require('../utils/jwt')
const { verifyAdminLogin, verifyLogin } = require('../utils/verify')

const router = new Router({ prefix: '/surname' })

router.get('/', verifyLogin, async ctx => {
  try {
    const { searchContent, pageSize, currentPage } = ctx.request.query
    const pattern = new RegExp(searchContent, 'i')
    const list = await SurnameModel.find({ surname: pattern })
      .sort({ _id: -1 })
      .skip(parseInt(pageSize) * parseInt(currentPage))
      .limit(parseInt(pageSize))
    const total = await SurnameModel.find({ surname: pattern }).countDocuments()
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
    const { surname } = ctx.request.body
    const arr = unique(surname.split(','))
    arr.forEach(async e => {
      if (e.length < 1 || e === '') {
        return false
      }
      const existedSurname = await SurnameModel.findOne({
        surname: e.trim(),
      })
      //防止重复
      if (existedSurname) {
        return false
      } else {
        const word = new SurnameModel({
          surname: e.trim(),
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

router.post('/upload', verifyAdminLogin, async ctx => {
  try {
    const writerStream = fs.createWriteStream(
      process.cwd() + '/logs/word_upload.log',
      {
        flags: 'a',
      },
    )
    const clientIp = ctx.req.connection.remoteAddress
    const { path } = ctx.request.body
    const data = await loadFile(path)
    const arr = unique(data.split(','))
    let progress = 0
    //循环次数
    const times = Array.from({ length: arr.length }, (v, i) => i)
    await (async () => {
      for (let i of times) {
        if (arr[i].length < 1 || arr[i] === '') {
          continue
        }
        const existedSurname = await SurnameModel.findOne({
          surname: arr[i].trim(),
        })
        //防止重复
        if (existedSurname) {
          continue
        } else {
          const surname = new SurnameModel({
            surname: arr[i].trim(),
          })
          await surname.save()
          progress++
          console.log(`当前上传进度：${progress}/${arr.length}`)
        }
      }
    })()
    const jwt = new JWT(ctx.request.header.authorization)
    const res = jwt.verifyToken()
    writerStream.write(
      `用户：${res.user} IP：${clientIp} 在${moment().format(
        'YYYY-MM-DD HH:mm:ss',
      )}上传了${arr.length}个词语，上传成功${progress}个\n`,
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

router.put('/:id', verifyAdminLogin, async ctx => {
  try {
    const body = ctx.request.body
    const result = await SurnameModel.updateOne({ _id: ctx.params.id }, body)
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
    const result = await SurnameModel.deleteMany({ _id: { $in: items } })
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
