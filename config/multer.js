const multer = require('@koa/multer')
const path = require('path')
const storage = multer.diskStorage({
  //定义文件保存路径
  destination(req, file, cb) {
    let filePath = '../public/others'
    const fileType = file.mimetype
    if (fileType.includes('image') || fileType.includes('application')) {
      filePath = '../public/avatar'
    } else if (fileType.includes('text')) {
      filePath = '../public/text'
    }
    cb(null, path.join(__dirname, filePath)) //路径根据具体而定。如果不存在的话会自动创建一个路径
  },
  //文件名
  filename(req, file, cb) {
    var fileFormat = file.originalname.split('.')
    cb(null, Date.now() + '.' + fileFormat[fileFormat.length - 1])
  },
})

const upload = multer({ storage: storage })

module.exports = upload
