const mongoose = require('mongoose')
const Schema = mongoose.Schema

const userSchema = new Schema({
  uid: Number,
  username: String,
  avatar: String,
  tel: String,
  password: String,
  date: String,
  vipStartTime: Number,
  vipEndTime: Number,
  vip: Boolean,
  lastLoginTime: String,
  huaweiPayToken: String, //华为的支付token，用来获取支付信息，只有华为支付才会生成此字段
  history: [],
  favourites: [],
})

const User = mongoose.model('User', userSchema)

module.exports = User
