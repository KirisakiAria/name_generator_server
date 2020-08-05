const Router = require('@koa/router')
const upload = require('../config/multer')
const router = new Router({ prefix: '/upload' })
const { verifyAppBaseInfo, verifyUserLogin } = require('../utils/verify')

router.post(
  '/',
  upload.single('file'),
  verifyAppBaseInfo,
  verifyUserLogin,
  ctx => {
    ctx.body = {
      code: '1000',
      message: '上传成功',
      data: {
        path: ctx.file.path.replace('public\\', '/'),
      },
    }
  },
)

module.exports = router
