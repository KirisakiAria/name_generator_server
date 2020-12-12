const mongoose = require('mongoose')
const Schema = mongoose.Schema

const orderSchema = new Schema({
  orderNo: String,
  body: String,
  tel: String,
  price: Number,
  time: Number, //创建时间
  paymentMethod: String, //1支付宝 2微信
  status: Boolean, //支付状态
})

const Order = mongoose.model('Order', orderSchema)

module.exports = Order
