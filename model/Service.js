const mongoose = require('mongoose')
const Schema = mongoose.Schema

const serviceSchema = new Schema({
  privacyPolicy: String,
  terms: String,
  usage: String,
  update: String,
  vip: String,
})

const Service = mongoose.model('Service', serviceSchema)

module.exports = Service
