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
  huaweiPayToken: String, //华为的支付token，用来获取支付信息，只有华为支付才会生成此字段
})

const Order = mongoose.model('Order', orderSchema)

module.exports = Order
