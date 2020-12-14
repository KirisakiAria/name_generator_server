const mongoose = require('mongoose')
const Schema = mongoose.Schema

const paymentMethodSchema = new Schema({
  name: String,
  paymentId: String,
  available: Boolean,
})

const PaymentMethod = mongoose.model('PaymentMethod', paymentMethodSchema)

module.exports = PaymentMethod
