const mongoose = require('mongoose')
const Schema = mongoose.Schema

const orderSchema = new Schema({
  orderNo: String,
  tel: String,
  price: Number,
  time: Number,
  paymentMethod: String, //1支付宝 2微信
})

const Order = mongoose.model('Order', orderSchema)

module.exports = Order
