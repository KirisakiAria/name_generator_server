const Router = require('@koa/router')
const upload = require('../config/multer')
const router = new Router({ prefix: '/upload' })

router.post('/', upload.single('file'), ctx => {
  ctx.body = {
    code: '1000',
    message: '上传成功',
    data: {
      url: ctx.file.path.replace('public\\', '/'),
    },
  }
})

module.exports = router
