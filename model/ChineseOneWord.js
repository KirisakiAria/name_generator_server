const mongoose = require('mongoose')
const Schema = mongoose.Schema

const ChineseOneWordSchema = new Schema({
  word: String,
})

const ChineseOneWord = mongoose.model('ChineseOneWord', ChineseOneWordSchema)

module.exports = ChineseOneWord
