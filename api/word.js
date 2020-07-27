const Router = require('@koa/router')
const router = new Router({ prefix: '/word' })
const JapaneseFourIdiomModel = require('../model/JapaneseFourIdiom')
const JapaneseThreeIdiomModel = require('../model/JapaneseThreeIdiom')
const JapaneseTwoIdiomModel = require('../model/JapaneseTwoIdiom')

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

module.exports = router
