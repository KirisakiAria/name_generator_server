const mongoose = require('mongoose')
const Schema = mongoose.Schema

const ChineseFiveWordSchema = new Schema({
  word: String,
})

const ChineseFiveWord = mongoose.model('ChineseFiveWord', ChineseFiveWordSchema)

module.exports = ChineseFiveWord
