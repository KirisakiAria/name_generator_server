const mongoose = require('mongoose')
const Schema = mongoose.Schema

const ChineseThreeWordSchema = new Schema({
  word: String,
})

const ChineseThreeWord = mongoose.model(
  'ChineseThreeWord',
  ChineseThreeWordSchema,
)

module.exports = ChineseThreeWord
