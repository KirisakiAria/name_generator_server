const mongoose = require('mongoose')
const Schema = mongoose.Schema

const EnglishWordSchema = new Schema({
  word: String,
  length: Number,
  classify: String,
  showable: Boolean,
  likedUsers: [String],
})

const EnglishWord = mongoose.model('EnglishWord', EnglishWordSchema)

module.exports = EnglishWord
