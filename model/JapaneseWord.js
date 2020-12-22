const mongoose = require('mongoose')
const Schema = mongoose.Schema

const JapaneseWordSchema = new Schema({
  word: String,
  length: Number,
  classify: String,
  showable: Boolean,
  likedUsers: [String],
})

const JapaneseWord = mongoose.model('JapaneseWord', JapaneseWordSchema)

module.exports = JapaneseWord
