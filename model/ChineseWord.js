const mongoose = require('mongoose')
const Schema = mongoose.Schema

const ChineseWordSchema = new Schema({
  word: String,
  length: Number,
  classify: String,
  showable: Boolean,
  likedUsers: [String],
})

const ChineseWord = mongoose.model('ChineseWord', ChineseWordSchema)

module.exports = ChineseWord
