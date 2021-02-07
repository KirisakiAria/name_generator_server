const mongoose = require('mongoose')
const Schema = mongoose.Schema

const ShadiaoWordSchema = new Schema({
  word: String,
  length: Number,
  classify: String,
  showable: Boolean,
  likedUsers: [String],
})

const ShadiaoWord = mongoose.model('ShadiaoWord', ShadiaoWordSchema)

module.exports = ShadiaoWord
