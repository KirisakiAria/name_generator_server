const mongoose = require('mongoose')
const Schema = mongoose.Schema

const keySchema = new Schema({
  code: String,
  activated: Boolean,
  userTel: String,
  createTime: String,
  activationTime: String,
})

const Key = mongoose.model('Key', keySchema)

module.exports = Key
