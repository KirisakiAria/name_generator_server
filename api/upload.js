const Router = require('@koa/router')
const upload = require('../config/multer')
const router = new Router({ prefix: '/upload' })
const { verifyLogin } = require('../utils/verify')

router.post('/', verifyLogin, upload.single('file'), ctx => {
  ctx.body = {
    code: '1000',
    message: '上传成功',
    data: {
      path: ctx.file.path.replace('public\\', '/'),
    },
  }
})

module.exports = router
