const mongoose = require('mongoose')
const Schema = mongoose.Schema

const errorSchema = new Schema({
  appVersion: String,
  brand: String,
  system: String,
  systemVersion: String,
  error: String,
  stackTrace: String,
})

const Error = mongoose.model('Error', errorSchema)

module.exports = Error
