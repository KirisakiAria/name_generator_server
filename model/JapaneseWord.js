const mongoose = require('mongoose')
const Schema = mongoose.Schema

const JapaneseWordSchema = new Schema({
  word: String,
  length: Number,
})

const JapaneseWord = mongoose.model('JapaneseWord', JapaneseWordSchema)

module.exports = JapaneseWord
