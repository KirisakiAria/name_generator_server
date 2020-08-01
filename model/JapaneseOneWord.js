const mongoose = require('mongoose')
const Schema = mongoose.Schema

const japaneseOneWordSchema = new Schema({
  word: String,
})

const JapaneseOneWord = mongoose.model('JapaneseOneWord', japaneseOneWordSchema)

module.exports = JapaneseOneWord
