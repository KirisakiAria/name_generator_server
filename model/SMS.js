const mongoose = require('mongoose')
const Schema = mongoose.Schema

const smsSchema = new Schema({
  tel: String, // 手机号
  authCode: Number, //验证码
  clientIp: String, // 客户端 ip
  sendCount: Number, // 发送次数
  lastTime: Number, // 最后一次的时间戳
})

const SMS = mongoose.model('SMS', smsSchema)

module.exports = SMS
