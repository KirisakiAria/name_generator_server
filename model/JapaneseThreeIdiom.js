const mongoose = require('mongoose')
const Schema = mongoose.Schema

const japaneseThreeWordSchema = new Schema({
  word: String,
})

const JapaneseThreeWord = mongoose.model(
  'JapaneseThreeWord',
  japaneseThreeWordSchema,
)

module.exports = JapaneseThreeWord
