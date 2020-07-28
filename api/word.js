const Router = require('@koa/router')
const router = new Router({ prefix: '/word' })
const JapaneseFourWordModel = require('../model/JapaneseFourWord')
const JapaneseThreeWordModel = require('../model/JapaneseThreeWord')
const JapaneseTwoWordModel = require('../model/JapaneseTwoWord')

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

const findData = (type, number) => {
  if (type == '中国风') {
    switch (number) {
      case '1':
        break
      case '2':
        break
      case '3':
        break
      case '4':
        break
    }
  } else {
  }
}

router.post('/add', async ctx => {
  try {
    const { word, type, number } = ctx.request.body
    console.log(word, type, number)
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

module.exports = router
